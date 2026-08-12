<script lang="ts">
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    export let pregunta: string;
    export let opciones: { texto: string; correcta: boolean }[];
    export let puntoId: string;

    const dispatch = createEventDispatcher();

    const MAX_INTENTOS = 3;
    let intentosRestantes = MAX_INTENTOS;
    let seleccionada: number | null = null;
    let resultado: "pendiente" | "correcta" | "fallida" = "pendiente";
    let bloqueada = false;
    let sacudirIndice: number | null = null; // índice del botón a sacudir

    $: mostrarResultado = resultado !== "pendiente";
    $: vidas = Array.from({ length: MAX_INTENTOS }, (_, i) => i < intentosRestantes);

    function getClaveHoy(): string {
        const hoy = new Date().toISOString().split("T")[0];
        return `trivia-${puntoId}-${hoy}`;
    }

    onMount(() => {
        const datos = localStorage.getItem(getClaveHoy());
        if (datos) {
            const parsed = JSON.parse(datos);
            intentosRestantes = parsed.intentosRestantes;
            if (parsed.resultado === "correcta") {
                resultado = "correcta";
                bloqueada = true;
                dispatch("success");
            } else if (intentosRestantes <= 0) {
                resultado = "fallida";
                bloqueada = true;
                dispatch("failed");
            }
        }
    });

    function elegirOpcion(indice: number) {
        if (bloqueada || resultado === "correcta") return;
        seleccionada = indice;
        const correcta = opciones[indice].correcta;

        if (correcta) {
            resultado = "correcta";
            bloqueada = true;
            guardarEstado();
            dispatch("success");
        } else {
            // Sacudir el botón incorrecto
            sacudirIndice = indice;
            setTimeout(() => (sacudirIndice = null), 500);

            intentosRestantes -= 1;
            if (intentosRestantes <= 0) {
                resultado = "fallida";
                bloqueada = true;
                dispatch("failed");
            }
            guardarEstado();
        }
    }

    function guardarEstado() {
        localStorage.setItem(
            getClaveHoy(),
            JSON.stringify({ intentosRestantes, resultado }),
        );
    }
</script>

<div class="trivia">
    <!-- Encabezado con vidas -->
    <div class="trivia-header">
        <h3 class="trivia-titulo">🎯 Trivia</h3>
        <div class="vidas" aria-label="{intentosRestantes} intentos restantes">
            {#each vidas as viva}
                <span class="vida" class:perdida={!viva} aria-hidden="true">❤️</span>
            {/each}
        </div>
    </div>

    <!-- Tarjeta con la pregunta -->
    <div class="pregunta-card">
        <p class="pregunta-texto">{pregunta}</p>
    </div>

    <!-- Opciones -->
    <div class="opciones" role="group" aria-label="Opciones de respuesta">
        {#each opciones as opcion, i}
            <button
                class="opcion-btn"
                class:correcta={resultado === "correcta" && opcion.correcta}
                class:incorrecta={seleccionada === i && !opcion.correcta && resultado !== "correcta"}
                class:sacudir={sacudirIndice === i}
                class:desactivada={bloqueada && !(resultado === "correcta" && opcion.correcta)}
                disabled={bloqueada}
                on:click={() => elegirOpcion(i)}
            >
                <span class="opcion-letra">{String.fromCharCode(65 + i)}</span>
                <span class="opcion-texto">{opcion.texto}</span>
                {#if resultado === "correcta" && opcion.correcta}
                    <span class="opcion-icono">✓</span>
                {:else if seleccionada === i && !opcion.correcta && resultado !== "pendiente"}
                    <span class="opcion-icono">✕</span>
                {/if}
            </button>
        {/each}
    </div>

    <!-- Mensajes de resultado -->
    {#if resultado === "correcta"}
        <p class="mensaje exito" role="status">
            ✅ ¡Correcto! Has ganado un sello.
        </p>
    {:else if resultado === "fallida"}
        <p class="mensaje error" role="alert">
            💔 Se acabaron los intentos de hoy. Vuelve mañana.
        </p>
    {:else if intentosRestantes < MAX_INTENTOS}
        <p class="mensaje aviso" role="status">
            Incorrecto, sigue intentando.
        </p>
    {/if}
</div>

<style>
    .trivia {
        margin: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .trivia-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .trivia-titulo {
        font-family: 'Cinzel', serif;
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--gold-bright, #F2C94C);
        margin: 0;
    }

    /* ─── Vidas ──────────────────────────────────────────────────── */
    .vidas {
        display: flex;
        gap: 4px;
    }
    .vida {
        font-size: 1.1rem;
        transition: filter 0.3s, transform 0.3s;
    }
    .vida.perdida {
        filter: grayscale(100%) brightness(0.4);
        transform: scale(0.8);
    }

    /* ─── Tarjeta de pregunta ────────────────────────────────────── */
    .pregunta-card {
        background: var(--bg-surface, #2C1A0E);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.25));
        border-radius: 14px;
        padding: 16px 18px;
    }
    .pregunta-texto {
        font-size: 0.95rem;
        color: var(--text-primary, #F5E6C8);
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
        padding: 13px 16px;
        background: var(--bg-card, #1E1008);
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.12));
        border-radius: 12px;
        color: var(--text-primary, #F5E6C8);
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s;
    }
    .opcion-btn:hover:not(:disabled) {
        border-color: var(--gold-mid, #D4A017);
        background: rgba(212, 160, 23, 0.1);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    }
    .opcion-btn:active:not(:disabled) { transform: translateY(0); }

    .opcion-btn.correcta {
        border-color: var(--success, #4CAF82);
        background: rgba(76, 175, 130, 0.15);
        animation: bounce-in 0.35s ease;
    }
    .opcion-btn.incorrecta {
        border-color: var(--error, #E05252);
        background: rgba(224, 82, 82, 0.12);
    }
    .opcion-btn.desactivada {
        opacity: 0.4;
        cursor: not-allowed;
    }

    /* Sacudida en respuesta incorrecta */
    .opcion-btn.sacudir {
        animation: sacudir 0.45s ease;
    }
    @keyframes sacudir {
        0%, 100% { transform: translateX(0); }
        15%       { transform: translateX(-8px); }
        40%       { transform: translateX(8px); }
        65%       { transform: translateX(-5px); }
        85%       { transform: translateX(4px); }
    }
    @keyframes bounce-in {
        0%   { transform: scale(0.97); }
        60%  { transform: scale(1.02); }
        100% { transform: scale(1); }
    }

    /* ─── Letra de opción ────────────────────────────────────────── */
    .opcion-letra {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: rgba(212, 160, 23, 0.12);
        border: 1px solid rgba(212, 160, 23, 0.25);
        color: var(--gold-mid, #D4A017);
        font-size: 0.75rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    .opcion-btn.correcta .opcion-letra {
        background: rgba(76, 175, 130, 0.3);
        border-color: var(--success, #4CAF82);
        color: var(--success, #4CAF82);
    }

    .opcion-texto { flex: 1; }

    .opcion-icono {
        font-size: 1rem;
        font-weight: 700;
        flex-shrink: 0;
    }
    .opcion-btn.correcta .opcion-icono { color: var(--success, #4CAF82); }
    .opcion-btn.incorrecta .opcion-icono { color: var(--error, #E05252); }

    /* ─── Mensajes ───────────────────────────────────────────────── */
    .mensaje {
        font-size: 0.875rem;
        text-align: center;
        padding: 10px 16px;
        border-radius: 10px;
        font-weight: 500;
        animation: fadeup 0.3s ease;
    }
    .exito {
        color: var(--success, #4CAF82);
        background: rgba(76, 175, 130, 0.1);
        border: 1px solid rgba(76, 175, 130, 0.3);
    }
    .error {
        color: var(--error, #E05252);
        background: rgba(224, 82, 82, 0.1);
        border: 1px solid rgba(224, 82, 82, 0.3);
    }
    .aviso {
        color: var(--text-muted, #A08060);
    }

    @keyframes fadeup {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
    }
</style>
