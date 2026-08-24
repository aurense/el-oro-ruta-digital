<script lang="ts">
    import StampBadge from "./StampBadge.svelte";
    import ModalSello from "./ModalSello.svelte";
    import { userStore } from "../stores/user";
    import type { PuntoData } from "../data/puntos";
    import { aliados } from "../data/aliados";
    import { onMount } from "svelte";

    export let puntos: PuntoData[];

    $: sellos = $userStore.sellos;
    $: total = puntos.length;
    $: obtenidos = sellos.length;
    $: porcentaje = total > 0 ? (obtenidos / total) * 100 : 0;
    $: rango =
        obtenidos === 0
            ? { id: "visitante", label: "Paseante Casual", nivel: "1 / 3" }
            : obtenidos < total
              ? {
                    id: "explorador",
                    label: "Explorador en Progreso",
                    nivel: `${obtenidos} / ${total}`,
                }
              : {
                    id: "ciudadano",
                    label: "Ciudadano Aurense",
                    nivel: "Completado",
                };

    // Animar la barra XP al montar
    let barraVisible = false;
    onMount(() => {
        setTimeout(() => (barraVisible = true), 100);
    });

    // ─── Modal / Tooltip de punto ─────────────────────────────────
    let puntoModal: PuntoData | null = null;

    function abrirModal(punto: PuntoData) {
        puntoModal = punto;
    }
    function cerrarModal() {
        puntoModal = null;
    }

    /**
     * Abre la app de mapas nativa con las coordenadas del punto.
     */
    function abrirMapas(lat: number, lng: number, nombre: string) {
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const nombreEnc = encodeURIComponent(nombre);
        const url = isIOS
            ? `maps:?q=${nombreEnc}&ll=${lat},${lng}`
            : `geo:${lat},${lng}?q=${lat},${lng}(${nombreEnc})`;
        window.open(url, "_blank");
    }

    // ─── Carrusel ─────────────────────────────────────────────────
    let carruselEl: HTMLElement;
    let indiceActivo = 0;

    function onCarruselScroll() {
        if (!carruselEl || puntos.length === 0) return;
        const itemWidth = carruselEl.scrollWidth / puntos.length;
        indiceActivo = Math.round(carruselEl.scrollLeft / itemWidth);
    }

    function scrollAIndice(i: number) {
        if (!carruselEl || puntos.length === 0) return;
        const itemWidth = carruselEl.scrollWidth / puntos.length;
        carruselEl.scrollTo({ left: itemWidth * i, behavior: "smooth" });
    }
</script>

<div class="pasaporte">
    <!-- Encabezado compacto del pasaporte -->
    <header class="pasaporte-header">
        <div class="rango-emblema-wrapper">
            {#if rango.id === "visitante"}
                <!-- Medallón de Bronce - Visitante de Ocasión -->
                <div
                    class="medallon-rango medallon-visitante"
                    title={rango.label}
                >
                    <svg
                        viewBox="0 0 48 48"
                        class="medallon-svg"
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient
                                id="bronze-grad"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop offset="0%" stop-color="#E8AA7A" />
                                <stop offset="50%" stop-color="#B26C3B" />
                                <stop offset="100%" stop-color="#5E3114" />
                            </linearGradient>
                        </defs>
                        <circle
                            cx="24"
                            cy="24"
                            r="21"
                            fill="url(#bronze-grad)"
                            stroke="#F5CBB0"
                            stroke-width="1.2"
                        />
                        <circle
                            cx="24"
                            cy="24"
                            r="17"
                            fill="#1C0E07"
                            stroke="#B26C3B"
                            stroke-width="1"
                            stroke-dasharray="2 3"
                        />
                        <circle
                            cx="24"
                            cy="24"
                            r="12"
                            fill="none"
                            stroke="#E8AA7A"
                            stroke-width="0.8"
                        />
                        <polygon
                            points="24,10 27,21 38,24 27,27 24,38 21,27 10,24 21,21"
                            fill="#F5CBB0"
                        />
                        <polygon points="24,10 24,24 10,24" fill="#8C4D22" />
                        <polygon points="24,38 24,24 38,24" fill="#8C4D22" />
                        <circle
                            cx="24"
                            cy="24"
                            r="2.5"
                            fill="#1C0E07"
                            stroke="#F5CBB0"
                            stroke-width="1"
                        />
                    </svg>
                </div>
            {:else if rango.id === "explorador"}
                <!-- Medallón de Plata y Oro - Explorador en Progreso -->
                <div
                    class="medallon-rango medallon-explorador"
                    title={rango.label}
                >
                    <svg
                        viewBox="0 0 48 48"
                        class="medallon-svg"
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient
                                id="silver-gold-grad"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop offset="0%" stop-color="#F2C94C" />
                                <stop offset="35%" stop-color="#D4A017" />
                                <stop offset="70%" stop-color="#EAEAEA" />
                                <stop offset="100%" stop-color="#8E8E8E" />
                            </linearGradient>
                        </defs>
                        <circle
                            cx="24"
                            cy="24"
                            r="21"
                            fill="url(#silver-gold-grad)"
                            stroke="#FFF2B2"
                            stroke-width="1.2"
                        />
                        <circle
                            cx="24"
                            cy="24"
                            r="17"
                            fill="#1E1008"
                            stroke="#D4A017"
                            stroke-width="1"
                        />
                        <path
                            d="M12 30 C10 21 14 14 18 11 M36 30 C38 21 34 14 30 11"
                            stroke="#F2C94C"
                            stroke-width="1.4"
                            fill="none"
                            stroke-linecap="round"
                        />
                        <path
                            d="M14 16 L34 32 M34 16 L14 32"
                            stroke="#EAEAEA"
                            stroke-width="2.2"
                            stroke-linecap="round"
                        />
                        <path
                            d="M11 13 L17 19 M37 13 L31 19"
                            stroke="#F2C94C"
                            stroke-width="2.8"
                            stroke-linecap="round"
                        />
                        <polygon
                            points="24,19 28,24 24,29 20,24"
                            fill="#F2C94C"
                            stroke="#FFF2B2"
                            stroke-width="0.8"
                        />
                    </svg>
                </div>
            {:else}
                <!-- Gran Cruz de Oro - Ciudadano Aurense -->
                <div
                    class="medallon-rango medallon-ciudadano"
                    title={rango.label}
                >
                    <div class="medallon-aura" aria-hidden="true"></div>
                    <svg
                        viewBox="0 0 48 48"
                        class="medallon-svg"
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient
                                id="gold-crown-grad"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop offset="0%" stop-color="#FFF3B0" />
                                <stop offset="40%" stop-color="#F2C94C" />
                                <stop offset="70%" stop-color="#D4A017" />
                                <stop offset="100%" stop-color="#8B6914" />
                            </linearGradient>
                        </defs>
                        <polygon
                            points="24,2 29,15 42,11 36,24 46,33 32,36 29,48 20,39 9,45 13,32 2,24 14,17 10,5 22,12"
                            fill="url(#gold-crown-grad)"
                            stroke="#FFF9D2"
                            stroke-width="0.8"
                        />
                        <circle
                            cx="24"
                            cy="24"
                            r="14"
                            fill="#1C0E07"
                            stroke="#F2C94C"
                            stroke-width="1.2"
                        />
                        <polygon
                            points="24,14 27,21 34,24 27,27 24,34 21,27 14,24 21,21"
                            fill="#FFF3B0"
                        />
                        <circle
                            cx="24"
                            cy="24"
                            r="3.2"
                            fill="#D4A017"
                            stroke="#FFF3B0"
                            stroke-width="1"
                        />
                    </svg>
                </div>
            {/if}
        </div>

        <h2 class="pasaporte-titulo">Mi Pasaporte</h2>
        <div class="rango-badge-pill">
            <span class="rango-label">{rango.label}</span>
            <span class="rango-nivel-dot">•</span>
            <span class="rango-nivel">{rango.nivel}</span>
        </div>
    </header>

    <!-- Barra de XP / progreso -->
    <div class="xp-section">
        <div class="xp-labels">
            <span class="xp-texto">Progreso del Pasaporte</span>
            <span class="xp-contador">{obtenidos} / {total}</span>
        </div>
        <div
            class="xp-track"
            role="progressbar"
            aria-valuenow={obtenidos}
            aria-valuemax={total}
            aria-label="{obtenidos} de {total} sellos obtenidos"
        >
            <div
                class="xp-fill"
                class:visible={barraVisible}
                style="width: {barraVisible ? porcentaje : 0}%"
            ></div>
        </div>
    </div>

    <!-- ─── Carrusel horizontal de insignias ──────────────────── -->
    <div class="carrusel-wrap">
        <div
            class="carrusel"
            bind:this={carruselEl}
            on:scroll={onCarruselScroll}
            aria-label="Insignias del pasaporte"
            role="region"
        >
            {#each puntos as punto, i}
                {@const obtenida = sellos.some((s) => s.puntoId === punto.id)}
                <div class="carrusel-item">
                    <StampBadge
                        imagen={punto.insigniaURL}
                        nombre={punto.nombre}
                        puntoId={punto.id}
                        {obtenida}
                        on:seleccionar={() => abrirModal(punto)}
                    />
                </div>
            {/each}
        </div>

        <!-- Dots de posición (indicadores del carrusel) -->
        <div class="carrusel-dots" aria-hidden="true">
            {#each puntos as _, i}
                <button
                    class="dot"
                    class:dot-activo={indiceActivo === i}
                    on:click={() => scrollAIndice(i)}
                    aria-label="Ir a insignia {i + 1}"
                ></button>
            {/each}
        </div>
    </div>

    <!-- Footer discreto -->
    <div class="footer-bar">
        <a
            href="https://ko-fi.com/aurense"
            target="_blank"
            rel="noopener noreferrer"
            class="donation-link"
            aria-label="Apoyar el proyecto con una donación"
            >☕ Donativos voluntarios</a
        >
    </div>
</div>

<!-- Modal de celebración (obtenido) o Tooltip de indicaciones (no visitado) -->
{#if true}
    {@const esObtenida = Boolean(
        puntoModal && sellos.some((s) => s.puntoId === puntoModal?.id),
    )}
    {@const selloActual = puntoModal
        ? sellos.find((s) => s.puntoId === puntoModal?.id)
        : null}
    {@const aliadoDelModal = puntoModal?.voucherAliadoId
        ? (aliados.find((a) => a.id === puntoModal?.voucherAliadoId) ?? null)
        : null}
    <ModalSello
        visible={esObtenida}
        punto={puntoModal}
        fechaObtenida={selloActual?.fecha ?? null}
        totalSellos={obtenidos}
        totalPuntos={total}
        aliado={aliadoDelModal}
        on:cerrar={cerrarModal}
    />

    {#if puntoModal && !esObtenida}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="tooltip-overlay" on:click={cerrarModal}></div>
        <div
            class="tooltip-bloqueado"
            role="dialog"
            aria-label="Información de {puntoModal.nombre}"
        >
            <button
                class="tooltip-cerrar"
                on:click={cerrarModal}
                aria-label="Cerrar">✕</button
            >

            <div class="tooltip-icono-vector" aria-hidden="true">
                {#if puntoModal.id === "palacio-municipal"}
                    <svg viewBox="0 0 24 24" class="tooltip-svg"
                        ><path
                            d="M2 9L12 3L22 9H2Z"
                            fill="currentColor"
                        /><circle
                            cx="12"
                            cy="6.6"
                            r="1.2"
                            fill="#1E1008"
                            stroke="currentColor"
                            stroke-width="0.6"
                        /><path
                            d="M4 10V17M9 10V17M15 10V17M20 10V17"
                            stroke="currentColor"
                            stroke-width="1.6"
                            stroke-linecap="round"
                        /><path
                            d="M2 18H22M1 20.5H23"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                        /></svg
                    >
                {:else if puntoModal.id === "teatro-juarez"}
                    <svg viewBox="0 0 24 24" class="tooltip-svg"
                        ><path
                            d="M3 13C3 8 7 4 12 4C17 4 21 8 21 13C21 17.5 18 20.5 12 20.5C6 20.5 3 17.5 3 13Z"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.6"
                        /><ellipse
                            cx="8.5"
                            cy="11.5"
                            rx="1.8"
                            ry="1.2"
                            fill="currentColor"
                        /><ellipse
                            cx="15.5"
                            cy="11.5"
                            rx="1.8"
                            ry="1.2"
                            fill="currentColor"
                        /><path
                            d="M8 15.5C9.5 17.5 14.5 17.5 16 15.5"
                            stroke="currentColor"
                            stroke-width="1.4"
                            stroke-linecap="round"
                            fill="none"
                        /></svg
                    >
                {:else if puntoModal.id === "tiro-norte"}
                    <svg viewBox="0 0 24 24" class="tooltip-svg"
                        ><circle
                            cx="12"
                            cy="4"
                            r="2.4"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.4"
                        /><path
                            d="M6 21L9.5 6H14.5L18 21"
                            stroke="currentColor"
                            stroke-width="1.6"
                            stroke-linecap="round"
                        /><path
                            d="M8 13.5H16M6.8 17.5H17.2"
                            stroke="currentColor"
                            stroke-width="1.3"
                        /><path
                            d="M12 4L19 21"
                            stroke="currentColor"
                            stroke-width="1.2"
                            stroke-dasharray="1.5 1"
                        /></svg
                    >
                {/if}
            </div>

            <h3 class="tooltip-nombre">{puntoModal.nombre}</h3>
            <p class="tooltip-desc">{puntoModal.descripcionCorta}</p>
            <p class="tooltip-hint">
                📍 Dirígete a este lugar para escanear el QR y desbloquear la
                historia.
            </p>
            <button
                class="btn-tooltip btn-mapas"
                on:click={() =>
                    abrirMapas(
                        puntoModal.coordenadas.lat,
                        puntoModal.coordenadas.lng,
                        puntoModal.nombre,
                    )}
            >
                🗺️ Cómo llegar
            </button>
        </div>
    {/if}
{/if}

<style>
    /* ─── Contenedor principal: hereda 100% del shell ────────────── */
    .pasaporte {
        height: 100%;
        max-width: 520px;
        margin: 0 auto;
        padding: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-sizing: border-box;
    }

    /* ─── Header compacto ────────────────────────────────────────── */
    .pasaporte-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 8px 14px 4px;
        flex-shrink: 0;
    }

    /* ─── Medallones de Época ────────────────────────────────────── */
    .rango-emblema-wrapper {
        position: relative;
        margin-bottom: 6px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .medallon-rango {
        position: relative;
        width: 46px;
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: flotar-medallon 3.5s ease-in-out infinite;
        cursor: default;
    }
    .medallon-svg {
        width: 100%;
        height: 100%;
        position: relative;
        z-index: 2;
    }
    .medallon-visitante {
        filter: drop-shadow(0 4px 10px rgba(140, 83, 43, 0.4));
    }
    .medallon-explorador {
        filter: drop-shadow(0 6px 16px rgba(212, 160, 23, 0.5));
    }
    .medallon-ciudadano {
        filter: drop-shadow(0 0 18px rgba(242, 201, 76, 0.75));
    }

    /* Aura giratoria dorada para la Gran Cruz de Ciudadano Aurense */
    .medallon-aura {
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        background: radial-gradient(
            circle,
            rgba(242, 201, 76, 0.4) 0%,
            rgba(212, 160, 23, 0.15) 50%,
            transparent 75%
        );
        animation: pulso-aura 2.8s ease-in-out infinite;
        z-index: 1;
    }
    @keyframes pulso-aura {
        0%,
        100% {
            transform: scale(0.95);
            opacity: 0.7;
        }
        50% {
            transform: scale(1.15);
            opacity: 1;
        }
    }

    @keyframes flotar-medallon {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-4px);
        }
    }

    .pasaporte-titulo {
        font-family: "Cinzel", serif;
        font-size: 1.18rem;
        font-weight: 700;
        margin: 0 0 4px;
        background: linear-gradient(
            135deg,
            var(--gold-bright, #f2c94c),
            var(--gold-mid, #d4a017)
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    /* ─── Píldora de Rango ───────────────────────────────────────── */
    .rango-badge-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 12px;
        background: rgba(212, 160, 23, 0.08);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.3));
        border-radius: 999px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    .rango-label {
        font-size: 0.78rem;
        color: var(--text-primary, #f5e6c8);
        font-weight: 600;
        letter-spacing: 0.4px;
    }
    .rango-nivel-dot {
        color: var(--gold-mid, #d4a017);
        font-size: 0.75rem;
    }
    .rango-nivel {
        font-size: 0.74rem;
        color: var(--gold-bright, #f2c94c);
        font-weight: 500;
    }

    /* ─── Barra XP compacta ──────────────────────────────────────── */
    .xp-section {
        flex-shrink: 0;
        margin: 0 16px 6px;
        padding: 8px 14px;
        background: var(--bg-card, #1e1008);
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.12));
        border-radius: 12px;
    }
    .xp-labels {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
    }
    .xp-texto {
        font-size: 0.76rem;
        color: var(--text-muted, #a08060);
    }
    .xp-contador {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--gold-bright, #f2c94c);
        font-variant-numeric: tabular-nums;
    }
    .xp-track {
        height: 8px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 4px;
        overflow: hidden;
    }
    .xp-fill {
        height: 100%;
        background: linear-gradient(
            90deg,
            var(--gold-dark, #8b6914),
            var(--gold-bright, #f2c94c)
        );
        border-radius: 4px;
        width: 0%;
        transition: width 1.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 0 12px rgba(242, 201, 76, 0.5);
        position: relative;
    }
    /* Brillo deslizante en la barra */
    .xp-fill.visible::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        width: 40px;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
        );
        animation: brillo-xp 2s 1.2s ease forwards;
    }
    @keyframes brillo-xp {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }

    /* ─── Carrusel horizontal ────────────────────────────────────── */
    .carrusel-wrap {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
    }

    .carrusel {
        flex: 1;
        min-height: 0;
        display: flex;
        align-items: center;
        overflow-x: auto;
        overflow-y: hidden;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        gap: 0;
        padding: 4px 0;
        /* Ocultar scrollbar nativa */
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    .carrusel::-webkit-scrollbar {
        display: none;
    }

    .carrusel-item {
        flex: 0 0 calc(100vw - 36px);
        max-width: 330px;
        height: 100%;
        max-height: min(340px, 100%);
        scroll-snap-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px;
        box-sizing: border-box;
    }

    /* ─── Indicadores de posición (dots) ────────────────────────── */
    .carrusel-dots {
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        padding: 6px 0 2px;
    }
    .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: rgba(212, 160, 23, 0.25);
        border: none;
        padding: 0;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        -webkit-tap-highlight-color: transparent;
    }
    .dot-activo {
        background: linear-gradient(
            135deg,
            var(--gold-bright, #f2c94c),
            var(--gold-mid, #d4a017)
        );
        width: 20px;
        border-radius: 4px;
        box-shadow: 0 0 10px rgba(242, 201, 76, 0.6);
    }

    /* ─── Footer discreto ───────────────────────────────────────── */
    .footer-bar {
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        padding: 4px 0 6px;
    }
    .donation-link {
        font-family: "Inter", sans-serif;
        font-size: 0.72rem;
        color: var(--text-dim, #6b5040);
        text-decoration: none;
        padding: 4px 12px;
        border-radius: 999px;
        border: 1px solid rgba(212, 160, 23, 0.12);
        transition: all 0.2s;
    }
    .donation-link:hover {
        color: var(--gold-mid, #d4a017);
        border-color: rgba(212, 160, 23, 0.3);
        background: rgba(212, 160, 23, 0.06);
    }

    /* ─── Overlay & Tooltip para punto no visitado ───────────────────── */
    .tooltip-overlay {
        position: fixed;
        inset: 0;
        background: rgba(10, 5, 2, 0.75);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 100;
    }
    .tooltip-bloqueado {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        max-width: 380px;
        width: calc(100% - 32px);
        background: rgba(24, 12, 6, 0.98);
        border: 1px solid rgba(212, 160, 23, 0.4);
        border-radius: 16px;
        padding: 20px 18px 22px;
        z-index: 101;
        box-shadow:
            0 16px 40px rgba(0, 0, 0, 0.8),
            0 0 30px rgba(212, 160, 23, 0.1);
        animation: slide-up-tooltip 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes slide-up-tooltip {
        from {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    .tooltip-cerrar {
        position: absolute;
        top: 10px;
        right: 12px;
        background: transparent;
        border: none;
        color: var(--text-muted, #a08060);
        font-size: 0.95rem;
        cursor: pointer;
        padding: 6px;
        line-height: 1;
        transition: color 0.15s;
    }
    .tooltip-cerrar:hover {
        color: var(--text-primary, #f5e6c8);
    }
    .tooltip-icono-vector {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto 10px;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: rgba(212, 160, 23, 0.12);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.35));
        color: var(--gold-bright, #f2c94c);
    }
    .tooltip-svg {
        width: 24px;
        height: 24px;
    }
    .tooltip-nombre {
        font-family: "Cinzel", serif;
        font-size: 1.05rem;
        font-weight: 700;
        margin: 0 0 6px;
        color: var(--text-primary, #f5e6c8);
        text-align: center;
    }
    .tooltip-desc {
        font-size: 0.82rem;
        color: var(--text-muted, #a08060);
        line-height: 1.5;
        margin: 0 0 12px;
        text-align: center;
    }
    .tooltip-hint {
        font-size: 0.8rem;
        color: var(--gold-mid, #d4a017);
        margin: 0 0 14px;
        text-align: center;
        line-height: 1.5;
        background: rgba(212, 160, 23, 0.08);
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px dashed rgba(212, 160, 23, 0.25);
    }
    .btn-tooltip {
        display: block;
        width: 100%;
        padding: 12px 16px;
        border-radius: 999px;
        font-family: "Inter", sans-serif;
        font-weight: 600;
        font-size: 0.88rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    .btn-mapas {
        background: rgba(212, 160, 23, 0.14);
        color: var(--gold-bright, #f2c94c);
        border: 1px solid rgba(212, 160, 23, 0.4);
    }
    .btn-mapas:hover {
        background: rgba(212, 160, 23, 0.25);
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(212, 160, 23, 0.25);
    }
</style>
