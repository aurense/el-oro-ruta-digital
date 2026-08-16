<script lang="ts">
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    export let pregunta: string;
    export let opciones: { texto: string; correcta: boolean }[];
    export let puntoId: string;
    export let modoRevisar: boolean = false;

    const dispatch = createEventDispatcher();

    const MAX_INTENTOS = 4;
    let intentosRestantes = MAX_INTENTOS;
    let seleccionada: number | null = null;
    let opcionesFallidas: number[] = [];
    let resultado: "pendiente" | "correcta" | "fallida" = "pendiente";
    let bloqueada = false;
    let sacudirIndice: number | null = null; // índice del botón a sacudir
    let dialogEl: HTMLDialogElement;
    let yaCompletadaHoy = false;

    $: mostrarResultado = resultado !== "pendiente";
    $: vidas = Array.from(
        { length: MAX_INTENTOS },
        (_, i) => i < intentosRestantes,
    );

    function getClaveHoy(): string {
        const hoy = new Date().toISOString().split("T")[0];
        return `trivia-${puntoId}-${hoy}`;
    }

    onMount(() => {
        dialogEl?.showModal();

        const datos = localStorage.getItem(getClaveHoy());
        if (datos) {
            const parsed = JSON.parse(datos);
            intentosRestantes = parsed.intentosRestantes ?? MAX_INTENTOS;
            if (Array.isArray(parsed.opcionesFallidas)) {
                opcionesFallidas = parsed.opcionesFallidas;
            }
            if (parsed.resultado === "correcta") {
                resultado = "correcta";
                bloqueada = true;
                yaCompletadaHoy = true;
                if (!modoRevisar) {
                    dispatch("success");
                }
            } else if (intentosRestantes <= 0) {
                resultado = "fallida";
                bloqueada = true;
                if (!modoRevisar) {
                    dispatch("failed");
                }
            }
        }
    });

    function cerrarModal() {
        dialogEl?.close();
    }

    function elegirOpcion(indice: number) {
        if (bloqueada || resultado === "correcta" || opcionesFallidas.includes(indice)) return;
        seleccionada = indice;
        const correcta = opciones[indice].correcta;

        if (correcta) {
            resultado = "correcta";
            bloqueada = true;
            guardarEstado();
            // Pausa para que el usuario aprecie el acierto antes del cambio de fase
            setTimeout(() => {
                cerrarModal();
                dispatch("success");
            }, modoRevisar ? 1000 : 750);
        } else {
            // Sacudir el botón incorrecto y registrar en opciones fallidas
            sacudirIndice = indice;
            if (!opcionesFallidas.includes(indice)) {
                opcionesFallidas = [...opcionesFallidas, indice];
            }
            setTimeout(() => (sacudirIndice = null), 500);

            intentosRestantes -= 1;
            if (intentosRestantes <= 0) {
                resultado = "fallida";
                bloqueada = true;
                guardarEstado();
                setTimeout(() => {
                    cerrarModal();
                    dispatch("failed");
                }, 900);
            } else {
                guardarEstado();
            }
        }
    }

    function guardarEstado() {
        localStorage.setItem(
            getClaveHoy(),
            JSON.stringify({ intentosRestantes, resultado, opcionesFallidas }),
        );
    }
</script>

<dialog
    bind:this={dialogEl}
    class="trivia-modal"
    on:close={() => dispatch("cerrar")}
    on:click|self={cerrarModal}
    aria-label="Trivia: {pregunta}"
>
    <div class="trivia-panel">
        <!-- Encabezado con vidas y botón cerrar -->
        <div class="trivia-header">
            <div class="trivia-header-info">
                <h3 class="trivia-titulo">
                    {modoRevisar ? "🎯 Trivia (Modo Repaso)" : "🎯 Trivia Minera"}
                </h3>
                <div class="vidas" aria-label="{intentosRestantes} monedas restantes">
                    {#each vidas as viva}
                        <span class="vida" class:perdida={!viva} aria-hidden="true" title={viva ? "Intento disponible" : "Intento perdido"}>
                            <svg class="moneda-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10.2" class="moneda-borde" />
                                <circle cx="12" cy="12" r="8.2" class="moneda-cuerpo" />
                                <circle cx="12" cy="12" r="6.8" class="moneda-anillo" />
                                <path d="M12 7L13.3 10.7L17 12L13.3 13.3L12 17L10.7 13.3L7 12L10.7 10.7L12 7Z" class="moneda-emblema" />
                            </svg>
                        </span>
                    {/each}
                </div>
            </div>
            <button
                class="btn-cerrar"
                on:click={cerrarModal}
                type="button"
                aria-label="Cerrar trivia"
            >✕</button>
        </div>

        <!-- Tarjeta con la pregunta -->
        <div class="pregunta-card">
            <p class="pregunta-texto">{pregunta}</p>
        </div>

        <!-- Opciones -->
        <div class="opciones" role="group" aria-label="Opciones de respuesta">
            {#each opciones as opcion, i}
                {@const esFallida = opcionesFallidas.includes(i)}
                {@const esCorrecta = resultado === "correcta" && opcion.correcta}
                <button
                    class="opcion-btn"
                    class:correcta={esCorrecta}
                    class:fallida={esFallida}
                    class:sacudir={sacudirIndice === i}
                    class:desactivada={bloqueada && !esCorrecta}
                    disabled={bloqueada || esFallida}
                    on:click={() => elegirOpcion(i)}
                >
                    <span class="opcion-letra">{String.fromCharCode(65 + i)}</span>
                    <span class="opcion-texto" class:tachado={esFallida}>{opcion.texto}</span>
                    {#if esCorrecta}
                        <span class="opcion-icono exito">✓</span>
                    {:else if esFallida}
                        <span class="sello-descarte" aria-label="Descartada">DESCARTADA</span>
                    {/if}
                </button>
            {/each}
        </div>

        <!-- Mensajes de resultado -->
        {#if resultado === "correcta"}
            <p class="mensaje exito" role="status">
                {#if yaCompletadaHoy && modoRevisar}
                    ✨ Ya has completado este punto hoy. ¡Sello asegurado!
                {:else if modoRevisar}
                    ✨ ¡Respuesta correcta! Ya tienes este sello en tu pasaporte.
                {:else}
                    ✨ ¡Excelente respuesta! Desbloqueando tu sello...
                {/if}
            </p>
        {:else if resultado === "fallida"}
            <p class="mensaje error" role="alert">
                💔 Se acabaron los intentos de hoy. Vuelve mañana.
            </p>
        {:else if intentosRestantes < MAX_INTENTOS}
            <p class="mensaje aviso" role="status">
                ⚠️ Respuesta incorrecta. Te quedan {intentosRestantes} {intentosRestantes === 1 ? 'intento' : 'intentos'}.
            </p>
        {/if}
    </div>
</dialog>

<style>
    /* ─── Dialog nativo ──────────────────────────────────────────── */
    .trivia-modal {
        border: none;
        padding: 0;
        margin: auto;
        background: transparent;
        max-width: min(92vw, 420px);
        width: 100%;
        overflow: visible;
        outline: none;
    }

    /* Backdrop oscuro con blur */
    .trivia-modal::backdrop {
        background: rgba(10, 5, 2, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
    }

    /* Entrada del modal */
    .trivia-modal[open] {
        animation: entrar-modal 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes entrar-modal {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(18px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    /* ─── Panel central ──────────────────────────────────────────── */
    .trivia-panel {
        position: relative;
        z-index: 2;
        background: linear-gradient(160deg, var(--bg-card, #1E1008) 0%, #2A1A0A 100%);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.35));
        border-radius: var(--radius-lg, 22px);
        padding: 22px 20px 24px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-shadow:
            0 0 0 1px rgba(212, 160, 23, 0.08),
            0 24px 60px rgba(0, 0, 0, 0.75),
            0 0 50px rgba(212, 160, 23, 0.08);
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .trivia-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 4px;
        border-bottom: 1px solid var(--border-dim, rgba(212, 160, 23, 0.12));
    }
    .trivia-header-info {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }
    .trivia-titulo {
        font-family: "Cinzel", serif;
        font-size: 1.1rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        margin: 0;
        background: linear-gradient(135deg, var(--gold-bright, #f2c94c), var(--gold-mid, #d4a017));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .btn-cerrar {
        background: transparent;
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.2));
        color: var(--text-muted, #a08060);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
        line-height: 1;
    }
    .btn-cerrar:hover {
        color: var(--gold-bright, #f2c94c);
        border-color: var(--gold-mid, #d4a017);
        background: rgba(212, 160, 23, 0.1);
        transform: scale(1.05);
    }

    /* ─── Vidas (Monedas de Oro) ─────────────────────────────────── */
    .vidas {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: rgba(10, 5, 2, 0.45);
        padding: 4px 9px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.3));
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
    }
    .vida {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        filter: drop-shadow(0 2px 5px rgba(242, 201, 76, 0.45));
    }
    .moneda-svg {
        width: 100%;
        height: 100%;
        display: block;
    }
    .moneda-borde {
        fill: #8B6914;
        stroke: #FFE57F;
        stroke-width: 0.9;
    }
    .moneda-cuerpo {
        fill: #D4A017;
    }
    .moneda-anillo {
        stroke: #F2C94C;
        stroke-width: 0.7;
        stroke-dasharray: 1.5 1;
        fill: #E5AC1C;
    }
    .moneda-emblema {
        fill: #FFF6B8;
        filter: drop-shadow(0 0.5px 1px rgba(0, 0, 0, 0.45));
    }

    .vida.perdida {
        filter: grayscale(100%) brightness(0.28);
        opacity: 0.35;
        transform: scale(0.8);
    }

    /* ─── Tarjeta de pregunta ────────────────────────────────────── */
    .pregunta-card {
        background: var(--bg-surface, #2c1a0e);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.25));
        border-radius: var(--radius-md, 14px);
        padding: 16px 18px;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    .pregunta-texto {
        font-size: 0.95rem;
        font-weight: 500;
        color: var(--text-primary, #f5e6c8);
        line-height: 1.6;
        margin: 0;
        text-align: center;
    }

    /* ─── Opciones ───────────────────────────────────────────────── */
    .opciones {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .opcion-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 15px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.15));
        border-radius: var(--radius-md, 12px);
        color: var(--text-primary, #f5e6c8);
        font-family: "Inter", system-ui, sans-serif;
        font-size: 0.9rem;
        line-height: 1.4;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .opcion-btn:hover:not(:disabled) {
        border-color: var(--gold-mid, #d4a017);
        background: rgba(212, 160, 23, 0.09);
        transform: translateY(-2px);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
    }
    .opcion-btn:active:not(:disabled) {
        transform: translateY(0);
    }

    .opcion-btn.correcta {
        border-color: var(--success, #4caf82);
        background: rgba(76, 175, 130, 0.18);
        box-shadow: 0 0 16px rgba(76, 175, 130, 0.25);
        animation: bounce-in 0.35s ease;
    }
    .opcion-btn.fallida {
        border-color: rgba(224, 82, 82, 0.35);
        background: rgba(224, 82, 82, 0.07);
        opacity: 0.62;
        cursor: not-allowed;
        transform: scale(0.985);
        filter: grayscale(15%);
    }
    .opcion-btn.fallida:hover {
        transform: scale(0.985);
        border-color: rgba(224, 82, 82, 0.35);
        background: rgba(224, 82, 82, 0.07);
        box-shadow: none;
    }
    .opcion-btn.desactivada {
        opacity: 0.45;
        cursor: not-allowed;
    }

    /* Sacudida en respuesta incorrecta */
    .opcion-btn.sacudir {
        animation: sacudir 0.45s ease;
    }
    @keyframes sacudir {
        0%, 100% { transform: translateX(0); }
        15% { transform: translateX(-7px); }
        40% { transform: translateX(7px); }
        65% { transform: translateX(-4px); }
        85% { transform: translateX(4px); }
    }
    @keyframes bounce-in {
        0% { transform: scale(0.97); }
        60% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }

    /* ─── Letra de opción ────────────────────────────────────────── */
    .opcion-letra {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(212, 160, 23, 0.1);
        border: 1px solid rgba(212, 160, 23, 0.25);
        color: var(--gold-mid, #d4a017);
        font-size: 0.8rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s;
    }
    .opcion-btn.correcta .opcion-letra {
        background: rgba(76, 175, 130, 0.3);
        border-color: var(--success, #4caf82);
        color: var(--success, #4caf82);
    }
    .opcion-btn.fallida .opcion-letra {
        background: rgba(224, 82, 82, 0.18);
        border-color: rgba(224, 82, 82, 0.4);
        color: var(--error, #e05252);
        opacity: 0.8;
    }

    .opcion-texto {
        flex: 1;
        transition: all 0.2s ease;
    }
    .opcion-texto.tachado {
        text-decoration: line-through;
        text-decoration-color: rgba(224, 82, 82, 0.75);
        text-decoration-thickness: 2px;
        color: var(--text-muted, #a08060);
    }

    /* Sello postal de descarte / denegación */
    .sello-descarte {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: "Cinzel", "Courier New", monospace, serif;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 1px;
        color: var(--error, #e05252);
        border: 1.5px solid var(--error, #e05252);
        border-radius: 4px;
        padding: 2px 6px;
        transform: rotate(-6deg);
        background: rgba(224, 82, 82, 0.12);
        box-shadow: 0 0 6px rgba(224, 82, 82, 0.15);
        flex-shrink: 0;
        animation: estampar-sello 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        user-select: none;
    }

    @keyframes estampar-sello {
        0% {
            opacity: 0;
            transform: scale(1.5) rotate(-14deg);
        }
        100% {
            opacity: 1;
            transform: scale(1) rotate(-6deg);
        }
    }

    .opcion-icono {
        font-size: 1.05rem;
        font-weight: 700;
        flex-shrink: 0;
    }
    .opcion-icono.exito {
        color: var(--success, #4caf82);
    }

    /* ─── Mensajes ───────────────────────────────────────────────── */
    .mensaje {
        font-size: 0.85rem;
        text-align: center;
        padding: 10px 14px;
        border-radius: var(--radius-sm, 10px);
        font-weight: 500;
        line-height: 1.4;
        animation: fadeup 0.3s ease;
        margin: 0;
    }
    .exito {
        color: var(--success, #4caf82);
        background: rgba(76, 175, 130, 0.12);
        border: 1px solid rgba(76, 175, 130, 0.3);
    }
    .error {
        color: var(--error, #e05252);
        background: rgba(224, 82, 82, 0.12);
        border: 1px solid rgba(224, 82, 82, 0.3);
    }
    .aviso {
        color: var(--gold-bright, #f2c94c);
        background: rgba(212, 160, 23, 0.08);
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.2));
    }

    @keyframes fadeup {
        from {
            opacity: 0;
            transform: translateY(6px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>

