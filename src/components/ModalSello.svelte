<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import type { PuntoData } from "../data/puntos";

    export let punto: PuntoData;
    export let fechaObtenida: Date | null;
    export let totalSellos: number;
    export let totalPuntos: number;

    const dispatch = createEventDispatcher();

    let dialogEl: HTMLDialogElement;
    let confettiPiezas: {
        x: number;
        color: string;
        delay: number;
        duration: number;
        size: number;
        shape: string;
    }[] = [];

    const colores = [
        "#F2C94C", "#D4A017", "#E07B39",
        "#F5C87A", "#ffffff", "#FFC107",
        "#FF9800", "#FFEB3B",
    ];

    function generarConfetti() {
        confettiPiezas = Array.from({ length: 44 }, () => ({
            x: Math.random() * 100,
            color: colores[Math.floor(Math.random() * colores.length)],
            delay: Math.random() * 0.7,
            duration: 1.4 + Math.random() * 1.2,
            size: 5 + Math.random() * 7,
            shape: Math.random() > 0.5 ? "50%" : "2px",
        }));
    }

    function formatearFecha(fecha: Date | null): string {
        if (!fecha) return "";
        return new Intl.DateTimeFormat("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(new Date(fecha));
    }

    function cerrar() {
        dialogEl?.close();
    }

    function irAlPunto() {
        window.location.href = `/punto/${punto.id}?origen=sello`;
    }

    onMount(() => {
        generarConfetti();
        dialogEl?.showModal();
    });
</script>

<!-- Escuchar el evento nativo "close" del <dialog> para notificar al padre -->
<dialog
    bind:this={dialogEl}
    class="modal-sello"
    on:close={() => dispatch("cerrar")}
    on:click|self={cerrar}
    aria-label="Sello obtenido: {punto.nombre}"
>
    <!-- Confetti -->
    <div class="confetti-container" aria-hidden="true">
        {#each confettiPiezas as p}
            <span
                class="confetti-pieza"
                style="
                    left: {p.x}%;
                    background: {p.color};
                    width: {p.size}px;
                    height: {p.size}px;
                    border-radius: {p.shape};
                    animation-delay: {p.delay}s;
                    animation-duration: {p.duration}s;
                "
            ></span>
        {/each}
    </div>

    <!-- Panel central -->
    <div class="modal-panel">
        <!-- Botón cerrar -->
        <button class="btn-cerrar" on:click={cerrar} aria-label="Cerrar">✕</button>

        <!-- Badge con aura -->
        <div class="badge-wrapper">
            <div class="aura" aria-hidden="true"></div>
            <div class="aura aura--lenta" aria-hidden="true"></div>
            <img
                src={punto.insigniaURL}
                alt="Insignia de {punto.nombre}"
                class="insignia"
            />
        </div>

        <!-- Textos de celebración -->
        <p class="etiqueta-titulo">¡SELLO OBTENIDO!</p>
        <h2 class="nombre-punto">{punto.nombre}</h2>

        {#if fechaObtenida}
            <p class="fecha">
                Obtenido el {formatearFecha(fechaObtenida)}
            </p>
        {/if}

        <p class="progreso">
            Tu pasaporte:
            <strong class="progreso-num">{totalSellos}</strong>
            de
            <strong>{totalPuntos}</strong>
            sellos
        </p>

        <!-- Acciones -->
        <div class="acciones">
            <button class="btn-historia" on:click={irAlPunto}>
                ▶ Ver historia
            </button>
            <button class="btn-secundario" on:click={cerrar}>
                Cerrar
            </button>
        </div>
    </div>
</dialog>

<style>
    /* ─── Dialog nativo ──────────────────────────────────────────── */
    .modal-sello {
        /* Reset de estilos por defecto del <dialog> */
        border: none;
        padding: 0;
        background: transparent;
        max-width: min(90vw, 360px);
        width: 100%;
        overflow: visible;
    }

    /* Backdrop oscuro con blur */
    .modal-sello::backdrop {
        background: rgba(10, 5, 2, 0.82);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
    }

    /* Entrada del modal */
    .modal-sello[open] {
        animation: entrar-modal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes entrar-modal {
        from { opacity: 0; transform: scale(0.85) translateY(20px); }
        to   { opacity: 1; transform: scale(1)    translateY(0); }
    }

    /* ─── Confetti ───────────────────────────────────────────────── */
    .confetti-container {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    }
    .confetti-pieza {
        position: absolute;
        top: -12px;
        opacity: 0;
        animation: caer-confetti linear forwards;
    }
    @keyframes caer-confetti {
        0%   { transform: translateY(0)     rotate(0deg)   scaleX(1);  opacity: 1; }
        50%  { transform: translateY(50vh)  rotate(360deg) scaleX(-1); opacity: 1; }
        100% { transform: translateY(105vh) rotate(720deg) scaleX(-1); opacity: 0; }
    }

    /* ─── Panel central ──────────────────────────────────────────── */
    .modal-panel {
        position: relative;
        z-index: 2;
        background: linear-gradient(160deg, #1E1008 0%, #2A1A0A 100%);
        border: 1px solid rgba(212, 160, 23, 0.45);
        border-radius: 24px;
        padding: 32px 24px 28px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        box-shadow:
            0 0 0 1px rgba(212, 160, 23, 0.08),
            0 24px 60px rgba(0, 0, 0, 0.7),
            0 0 60px rgba(212, 160, 23, 0.08);
        text-align: center;
    }

    /* ─── Botón cerrar ───────────────────────────────────────────── */
    .btn-cerrar {
        position: absolute;
        top: 14px;
        right: 16px;
        background: transparent;
        border: none;
        color: var(--text-muted, #A08060);
        font-size: 1rem;
        cursor: pointer;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.15s;
    }
    .btn-cerrar:hover {
        background: rgba(255,255,255,0.06);
        color: var(--text-primary, #F5E6C8);
    }

    /* ─── Badge con aura ─────────────────────────────────────────── */
    .badge-wrapper {
        position: relative;
        width: 140px;
        height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;
    }

    .aura {
        position: absolute;
        inset: -14px;
        border-radius: 50%;
        background: conic-gradient(
            transparent 20%,
            rgba(242, 201, 76, 0.5) 40%,
            rgba(224, 123, 57, 0.4) 60%,
            transparent 80%
        );
        animation: girar-aura 3s linear infinite;
    }
    .aura--lenta {
        inset: -26px;
        background: conic-gradient(
            transparent 40%,
            rgba(242, 201, 76, 0.2) 60%,
            transparent 80%
        );
        animation: girar-aura 5.5s linear infinite reverse;
    }
    @keyframes girar-aura {
        to { transform: rotate(360deg); }
    }

    .insignia {
        width: 115px;
        height: 115px;
        object-fit: contain;
        position: relative;
        z-index: 1;
        animation: revelar-insignia 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: 0.1s;
        filter: drop-shadow(0 0 18px rgba(242, 201, 76, 0.55));
    }
    @keyframes revelar-insignia {
        from { transform: scale(0) rotate(-20deg); opacity: 0; }
        to   { transform: scale(1) rotate(0deg);   opacity: 1; }
    }

    /* ─── Textos ─────────────────────────────────────────────────── */
    .etiqueta-titulo {
        font-family: 'Cinzel', serif;
        font-size: 1.2rem;
        font-weight: 700;
        letter-spacing: 2px;
        background: linear-gradient(135deg, var(--gold-bright, #F2C94C), var(--gold-mid, #D4A017));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
        animation: fadeup 0.4s 0.3s both;
    }

    .nombre-punto {
        font-size: 1rem;
        font-weight: 500;
        color: var(--text-primary, #F5E6C8);
        margin: 0;
        animation: fadeup 0.4s 0.4s both;
    }

    .fecha {
        font-size: 0.78rem;
        color: var(--text-muted, #A08060);
        margin: 0;
        animation: fadeup 0.4s 0.45s both;
    }

    .progreso {
        font-size: 0.82rem;
        color: var(--text-muted, #A08060);
        margin: 0;
        animation: fadeup 0.4s 0.5s both;
    }
    .progreso-num {
        color: var(--gold-bright, #F2C94C);
    }

    @keyframes fadeup {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
    }

    /* ─── Acciones ───────────────────────────────────────────────── */
    .acciones {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        margin-top: 6px;
        animation: fadeup 0.4s 0.55s both;
    }

    .btn-historia {
        width: 100%;
        padding: 13px;
        border-radius: 999px;
        border: none;
        background: linear-gradient(135deg, var(--gold-mid, #D4A017), var(--gold-bright, #F2C94C));
        color: #12090A;
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 16px rgba(212, 160, 23, 0.35);
    }
    .btn-historia:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(212, 160, 23, 0.5);
    }
    .btn-historia:active { transform: translateY(0); }

    .btn-secundario {
        width: 100%;
        padding: 10px;
        border-radius: 999px;
        border: 1px solid rgba(212, 160, 23, 0.25);
        background: transparent;
        color: var(--text-muted, #A08060);
        font-family: 'Inter', sans-serif;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    .btn-secundario:hover {
        color: var(--text-primary, #F5E6C8);
        border-color: rgba(212, 160, 23, 0.5);
        background: rgba(212, 160, 23, 0.06);
    }
</style>
