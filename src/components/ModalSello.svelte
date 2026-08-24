<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import type { PuntoData } from "../data/puntos";
    import type { AliadoData } from "../data/aliados";
    import VoucherCard from "./VoucherCard.svelte";

    export let punto: PuntoData | null = null;
    export let fechaObtenida: Date | null = null;
    export let totalSellos: number = 0;
    export let totalPuntos: number = 3;
    export let visible: boolean = true;
    /** Aliado cuyo voucher se muestra en este sello. Opcional. */
    export let aliado: AliadoData | null = null;

    const dispatch = createEventDispatcher();

    let confettiPiezas: {
        x: number;
        color: string;
        delay: number;
        duration: number;
        size: number;
        shape: string;
    }[] = [];

    const colores = [
        "#F2C94C",
        "#D4A017",
        "#E07B39",
        "#F5C87A",
        "#ffffff",
        "#FFC107",
        "#FF9800",
        "#FFEB3B",
    ];

    function generarConfetti() {
        confettiPiezas = Array.from({ length: 36 }, () => ({
            x: Math.random() * 100,
            color: colores[Math.floor(Math.random() * colores.length)],
            delay: Math.random() * 0.6,
            duration: 1.2 + Math.random() * 1.0,
            size: 4 + Math.random() * 6,
            shape: Math.random() > 0.5 ? "50%" : "2px",
        }));
    }

    function formatearFecha(fecha: Date | null): string {
        if (!fecha) return "";
        return new Intl.DateTimeFormat("es-MX", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(fecha));
    }

    function cerrar() {
        dispatch("cerrar");
    }

    function irAlPunto() {
        if (punto) {
            window.location.href = `/punto/${punto.id}?origen=sello`;
        }
    }

    onMount(() => {
        generarConfetti();
    });

    $: if (visible && punto) {
        generarConfetti();
    }
</script>

{#if visible && punto}
<!-- Contenedor overlay para producción/móviles -->
<div
    class="modal-sello-overlay"
    role="dialog"
    aria-modal="true"
    on:click|self={cerrar}
    aria-label="Sello desbloqueado: {punto.nombre}"
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

    <!-- Panel central con Flexbox -->
    <div class="modal-panel">
        <!-- Botón cerrar -->
        <button class="btn-cerrar" on:click={cerrar} aria-label="Cerrar"
            >✕</button
        >

        <!-- Badge con aura elástica -->
        <div class="badge-wrapper">
            <div class="aura" aria-hidden="true"></div>
            <div class="aura aura--lenta" aria-hidden="true"></div>
            <img
                src={punto.insigniaURL}
                alt="Insignia de {punto.nombre}"
                class="insignia"
            />
        </div>

        <!-- Textos de celebración compactos -->
        <div class="modal-info">
            <p class="etiqueta-titulo">¡SELLO DESBLOQUEADO!</p>
            <h2 class="nombre-punto">{punto.nombre}</h2>

            <div class="meta-row">
                {#if fechaObtenida}
                    <span class="meta-item">
                        📅 {formatearFecha(fechaObtenida)}
                    </span>
                    <span class="meta-sep" aria-hidden="true">•</span>
                {/if}
                <span class="meta-item">
                    Pasaporte: <strong class="progreso-num">{totalSellos}/{totalPuntos}</strong>
                </span>
            </div>
        </div>

        <!-- Voucher del aliado vinculado (si existe) -->
        {#if aliado}
            <VoucherCard {aliado} tipo="modal" />
        {/if}

        <!-- Acciones en fila horizontal -->
        <div class="acciones">
            <button class="btn-historia" on:click={irAlPunto}>
                ▶ Visitar
            </button>
            <button class="btn-secundario" on:click={cerrar}>
                Cerrar
            </button>
        </div>
    </div>
</div>
{/if}

<style>
    /* ─── Overlay Flexbox ────────────────────────────────────────── */
    .modal-sello-overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(10, 5, 2, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
        box-sizing: border-box;
        overflow-y: auto;
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
        0% {
            transform: translateY(0) rotate(0deg) scaleX(1);
            opacity: 1;
        }
        50% {
            transform: translateY(50vh) rotate(360deg) scaleX(-1);
            opacity: 1;
        }
        100% {
            transform: translateY(105vh) rotate(720deg) scaleX(-1);
            opacity: 0;
        }
    }

    /* ─── Panel central Flexbox ──────────────────────────────────── */
    .modal-panel {
        position: relative;
        z-index: 2;
        background: linear-gradient(160deg, #1e1008 0%, #2a1a0a 100%);
        border: 1px solid rgba(212, 160, 23, 0.45);
        border-radius: 20px;
        padding: 20px 16px 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        max-width: min(92vw, 350px);
        width: 100%;
        max-height: min(92dvh, 520px);
        box-shadow:
            0 0 0 1px rgba(212, 160, 23, 0.08),
            0 24px 60px rgba(0, 0, 0, 0.75),
            0 0 50px rgba(212, 160, 23, 0.1);
        text-align: center;
        box-sizing: border-box;
        overflow-y: auto;
        /* Ocultar scrollbar */
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .modal-panel::-webkit-scrollbar {
        display: none;
    }

    /* ─── Botón cerrar ───────────────────────────────────────────── */
    .btn-cerrar {
        position: absolute;
        top: 10px;
        right: 12px;
        background: transparent;
        border: none;
        color: var(--text-muted, #a08060);
        font-size: 0.95rem;
        cursor: pointer;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.15s;
        z-index: 3;
    }
    .btn-cerrar:hover {
        background: rgba(255, 255, 255, 0.06);
        color: var(--text-primary, #f5e6c8);
    }

    /* ─── Badge con aura elástica ────────────────────────────────── */
    .badge-wrapper {
        position: relative;
        width: min(96px, 16vh);
        height: min(96px, 16vh);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-bottom: 2px;
    }

    .aura {
        position: absolute;
        inset: -8px;
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
        inset: -14px;
        background: conic-gradient(
            transparent 40%,
            rgba(242, 201, 76, 0.2) 60%,
            transparent 80%
        );
        animation: girar-aura 5.5s linear infinite reverse;
    }
    @keyframes girar-aura {
        to {
            transform: rotate(360deg);
        }
    }

    .insignia {
        width: min(80px, 13vh);
        height: min(80px, 13vh);
        object-fit: contain;
        position: relative;
        z-index: 1;
        animation: revelar-insignia 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: 0.1s;
        filter: drop-shadow(0 0 14px rgba(242, 201, 76, 0.55));
    }
    @keyframes revelar-insignia {
        from {
            transform: scale(0) rotate(-20deg);
            opacity: 0;
        }
        to {
            transform: scale(1) rotate(0deg);
            opacity: 1;
        }
    }

    /* ─── Textos de información ──────────────────────────────────── */
    .modal-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        flex-shrink: 0;
        width: 100%;
    }

    .etiqueta-titulo {
        font-family: "Cinzel", serif;
        font-size: 0.9rem;
        font-weight: 700;
        letter-spacing: 1.5px;
        background: linear-gradient(
            135deg,
            var(--gold-bright, #f2c94c),
            var(--gold-mid, #d4a017)
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
        animation: fadeup 0.4s 0.2s both;
    }

    .nombre-punto {
        font-family: "Cinzel", serif;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-primary, #f5e6c8);
        margin: 0;
        line-height: 1.2;
        animation: fadeup 0.4s 0.3s both;
    }

    .meta-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 1px;
        animation: fadeup 0.4s 0.35s both;
    }
    .meta-item {
        font-size: 0.72rem;
        color: var(--text-muted, #a08060);
    }
    .meta-sep {
        font-size: 0.7rem;
        color: rgba(212, 160, 23, 0.4);
    }
    .progreso-num {
        color: var(--gold-bright, #f2c94c);
    }

    @keyframes fadeup {
        from {
            opacity: 0;
            transform: translateY(8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* ─── Acciones en fila horizontal ────────────────────────────── */
    .acciones {
        display: flex;
        flex-direction: row;
        gap: 8px;
        width: 100%;
        flex-shrink: 0;
        margin-top: 4px;
        animation: fadeup 0.4s 0.4s both;
    }

    .btn-historia {
        flex: 1.2;
        padding: 9px 12px;
        border-radius: 999px;
        border: none;
        background: linear-gradient(
            135deg,
            var(--gold-mid, #d4a017),
            var(--gold-bright, #f2c94c)
        );
        color: #12090a;
        font-family: "Inter", sans-serif;
        font-weight: 700;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 14px rgba(212, 160, 23, 0.35);
        white-space: nowrap;
    }
    .btn-historia:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(212, 160, 23, 0.45);
    }
    .btn-historia:active {
        transform: translateY(0);
    }

    .btn-secundario {
        flex: 0.8;
        padding: 9px 12px;
        border-radius: 999px;
        border: 1px solid rgba(212, 160, 23, 0.25);
        background: transparent;
        color: var(--text-muted, #a08060);
        font-family: "Inter", sans-serif;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }
    .btn-secundario:hover {
        color: var(--text-primary, #f5e6c8);
        border-color: rgba(212, 160, 23, 0.5);
        background: rgba(212, 160, 23, 0.06);
    }
</style>
