<script lang="ts">
    import { userStore } from "../stores/user";
    import type { PuntoData } from "../data/puntos";

    export let puntos: PuntoData[];

    // ─── Estado ─────────────────────────────────────────────────────────────
    $: sellos = $userStore.sellos;
    $: idsVisitados = new Set(sellos.map((s) => s.puntoId));
    $: obtenidos = sellos.length;
    $: total = puntos.length;

    let puntoSeleccionado: PuntoData | null = null;

    function handleMarcadorClick(punto: PuntoData) {
        // Toggle: si ya está seleccionado, cierra; si no, abre
        puntoSeleccionado = puntoSeleccionado?.id === punto.id ? null : punto;
    }

    function cerrarTooltip() {
        puntoSeleccionado = null;
    }

    function irAlPunto(id: string) {
        window.location.href = `/punto/${id}?origen=sello`;
    }

    /**
     * Abre la app de mapas nativa con las coordenadas del punto.
     * Usa geo: en Android y maps: en iOS — ambos funcionan sin Internet.
     */
    function abrirMapas(lat: number, lng: number, nombre: string) {
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const nombreEnc = encodeURIComponent(nombre);
        const url = isIOS
            ? `maps:?q=${nombreEnc}&ll=${lat},${lng}`
            : `geo:${lat},${lng}?q=${lat},${lng}(${nombreEnc})`;
        window.open(url, "_blank");
    }

    // ─── Etiqueta truncada ───────────────────────────────────────────────────
    function truncar(texto: string, max = 14): string {
        return texto.length > max ? texto.slice(0, max - 1) + "…" : texto;
    }
</script>

<!-- Overlay para cerrar tooltip al tocar fuera -->
{#if puntoSeleccionado}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="overlay" on:click={cerrarTooltip}></div>
{/if}

<section class="ruta-mapa" aria-label="Mapa de ruta de exploración">

    <!-- ─── Encabezado ──────────────────────────────────────────────────── -->
    <header class="mapa-header">
        <div class="mapa-titulo-wrap">
            <svg class="mapa-titulo-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" y1="2" x2="8" y2="18"/>
                <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
            <h2 class="mapa-titulo">Ruta Cultural</h2>
        </div>
        <p class="mapa-contador">
            {#if obtenidos === total && total > 0}
                <span class="cnt-completada">
                    <svg class="cnt-trofeo-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/>
                        <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/>
                        <path d="M4 22h16"/>
                        <path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-2c-.55 0-1-.45-1-1v-2.34"/>
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
                    </svg>
                    <span>¡Ruta completada!</span>
                </span>
            {:else}
                <span class="cnt-num">{obtenidos}</span> de <span class="cnt-total">{total}</span> puntos visitados
            {/if}
        </p>
    </header>

    <!-- ─── Mapa SVG ────────────────────────────────────────────────────── -->
    <div class="mapa-wrapper">
        <svg
            viewBox="0 0 400 300"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Mapa de los puntos turísticos de El Oro"
        >
            <defs>
                <!-- Filtro de glow dorado para marcadores visitados -->
                <filter id="glow-dorado" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                <!-- Gradiente de fondo sutil -->
                <radialGradient id="bg-grad" cx="55%" cy="70%" r="60%">
                    <stop offset="0%"   stop-color="#2C1A0E" stop-opacity="1"/>
                    <stop offset="100%" stop-color="#12090A" stop-opacity="1"/>
                </radialGradient>
                <!-- Patrón de puntos sutil -->
                <pattern id="dot-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="0.8" fill="rgba(212,160,23,0.08)"/>
                </pattern>
            </defs>

            <!-- ─ Fondo ─────────────────────────────────────────────── -->
            <rect width="400" height="300" fill="url(#bg-grad)"/>
            <rect width="400" height="300" fill="url(#dot-pattern)"/>

            <!-- ─ Calles abstractas ──────────────────────────────────── -->
            <!-- Calle principal horizontal (Av. Constitución) -->
            <line x1="0"   y1="222" x2="400" y2="222" stroke="#1A0D07" stroke-width="14"/>
            <line x1="0"   y1="222" x2="400" y2="222" stroke="rgba(212,160,23,0.06)" stroke-width="1" stroke-dasharray="4 8"/>
            <!-- Calle vertical central -->
            <line x1="200" y1="0"   x2="200" y2="300" stroke="#1A0D07" stroke-width="11"/>
            <line x1="200" y1="0"   x2="200" y2="300" stroke="rgba(212,160,23,0.06)" stroke-width="1" stroke-dasharray="4 8"/>
            <!-- Calle horizontal media (Benito Juárez) -->
            <line x1="0"   y1="157" x2="330" y2="157" stroke="#1A0D07" stroke-width="9"/>
            <line x1="0"   y1="157" x2="330" y2="157" stroke="rgba(212,160,23,0.05)" stroke-width="1" stroke-dasharray="4 8"/>
            <!-- Calle hacia el Tiro Norte -->
            <line x1="270" y1="0"   x2="270" y2="157" stroke="#1A0D07" stroke-width="8"/>

            <!-- ─ Manzanas (bloques de edificios abstractos) ──────────── -->
            <rect x="8"   y="8"   width="80"  height="52" rx="3" fill="#1C0E07" opacity="0.9"/>
            <rect x="218" y="8"   width="55"  height="42" rx="3" fill="#1C0E07" opacity="0.9"/>
            <rect x="8"   y="168" width="55"  height="44" rx="3" fill="#1C0E07" opacity="0.9"/>
            <rect x="218" y="168" width="45"  height="44" rx="3" fill="#1C0E07" opacity="0.9"/>
            <rect x="320" y="168" width="72"  height="44" rx="3" fill="#1C0E07" opacity="0.9"/>
            <rect x="290" y="8"   width="50"  height="40" rx="3" fill="#1C0E07" opacity="0.9"/>
            <rect x="8"   y="230" width="90"  height="60" rx="3" fill="#1C0E07" opacity="0.8"/>
            <rect x="320" y="230" width="72"  height="60" rx="3" fill="#1C0E07" opacity="0.8"/>

            <!-- ─ Plaza central ──────────────────────────────────────── -->
            <rect x="155" y="168" width="52" height="42" rx="4"
                  fill="#1E1008" stroke="rgba(212,160,23,0.45)" stroke-width="1"/>
            <!-- Fuente central de la plaza -->
            <circle cx="181" cy="189" r="6" fill="none"
                    stroke="rgba(212,160,23,0.3)" stroke-width="1"/>
            <circle cx="181" cy="189" r="2" fill="rgba(212,160,23,0.2)"/>

            <!-- ─ Etiqueta de orientación ────────────────────────────── -->
            <text x="22" y="18" font-size="7" fill="rgba(212,160,23,0.3)" font-family="Inter,sans-serif">N ↑</text>

            <!-- ═══════════════════════════════════════════════════════ -->
            <!-- ─ RUTAS ENTRE PUNTOS (escalable: itera pares) ──────── -->
            <!-- ═══════════════════════════════════════════════════════ -->
            {#each puntos as punto, i}
                {#if i < puntos.length - 1}
                    {@const siguiente = puntos[i + 1]}
                    {@const activa = idsVisitados.has(siguiente.id)}

                    <!-- Ruta base (animada con sendero de exploración hacia puntos pendientes) -->
                    <line
                        x1={punto.mapa.x} y1={punto.mapa.y}
                        x2={siguiente.mapa.x} y2={siguiente.mapa.y}
                        stroke={activa ? "rgba(120,80,40,0.35)" : "rgba(200,138,88,0.45)"}
                        stroke-width={activa ? "2" : "2.2"}
                        stroke-dasharray="5 5"
                        stroke-linecap="round"
                        class={activa ? "" : "ruta-exploracion"}
                        role="button"
                        tabindex="0"
                        aria-label="Sendero hacia {siguiente.nombre}"
                        on:click={() => handleMarcadorClick(siguiente)}
                        on:keydown={(e) => e.key === 'Enter' && handleMarcadorClick(siguiente)}
                        style:cursor="pointer"
                    />

                    <!-- Ruta activa dorada animada -->
                    {#if activa}
                        <line
                            x1={punto.mapa.x} y1={punto.mapa.y}
                            x2={siguiente.mapa.x} y2={siguiente.mapa.y}
                            stroke="#D4A017"
                            stroke-width="2.5"
                            stroke-dasharray="6 6"
                            stroke-linecap="round"
                            class="ruta-activa"
                        />
                    {/if}
                {/if}
            {/each}

            <!-- ═══════════════════════════════════════════════════════ -->
            <!-- ─ MARCADORES (escalable: itera todos los puntos) ────── -->
            <!-- ═══════════════════════════════════════════════════════ -->
            {#each puntos as punto, i}
                {@const visitado = idsVisitados.has(punto.id)}
                {@const seleccionado = puntoSeleccionado?.id === punto.id}

                <!-- Anillo de pulso (visitados: dorado activo / no visitados: radar de exploración) -->
                {#if visitado}
                    <circle
                        cx={punto.mapa.x}
                        cy={punto.mapa.y}
                        r="14"
                        fill="none"
                        stroke="rgba(212,160,23,0.5)"
                        stroke-width="1.5"
                        class="anillo-pulso"
                        style="animation-delay: {i * 0.4}s"
                    />
                {:else}
                    <circle
                        cx={punto.mapa.x}
                        cy={punto.mapa.y}
                        r="13"
                        fill="none"
                        stroke="rgba(200,138,88,0.4)"
                        stroke-width="1.2"
                        class="anillo-pulso-pendiente"
                        style="animation-delay: {i * 0.75}s"
                    />
                {/if}

                <!-- Círculo base del marcador -->
                <circle
                    cx={punto.mapa.x}
                    cy={punto.mapa.y}
                    r="13"
                    fill={visitado ? "#2A1A08" : "#1A0D05"}
                    stroke={seleccionado ? "#F2C94C" : visitado ? "#D4A017" : "rgba(100,70,40,0.6)"}
                    stroke-width={seleccionado ? "2.5" : visitado ? "2" : "1.5"}
                    class="marcador"
                    style="--orden: {i}"
                    filter={visitado ? "url(#glow-dorado)" : "none"}
                    role="button"
                    tabindex="0"
                    aria-label="{visitado ? 'Visitado: ' : 'No visitado: '}{punto.nombre}"
                    on:click={() => handleMarcadorClick(punto)}
                    on:keydown={(e) => e.key === 'Enter' && handleMarcadorClick(punto)}
                    style:cursor="pointer"
                />

                <!-- Número del marcador -->
                <text
                    x={punto.mapa.x}
                    y={punto.mapa.y + 4.5}
                    text-anchor="middle"
                    font-size="10"
                    font-weight="700"
                    font-family="Inter, sans-serif"
                    fill={visitado ? "#F2C94C" : "rgba(160,128,96,0.7)"}
                    class="marcador-num"
                    style="--orden: {i}"
                    pointer-events="none"
                >{i + 1}</text>

                <!-- Icono vectorial de época del punto (encima del número) -->
                <g
                    transform="translate({punto.mapa.x - 7}, {punto.mapa.y - 27}) scale(0.6)"
                    class="marcador-icono-svg"
                    opacity={visitado ? "1" : "0.45"}
                    color={visitado ? "#F2C94C" : "#A08060"}
                    pointer-events="none"
                >
                    {#if punto.id === 'palacio-municipal'}
                        <!-- Palacio Municipal Neoclásico & Art Nouveau -->
                        <path d="M2 9L12 3L22 9H2Z" fill="currentColor" />
                        <circle cx="12" cy="6.6" r="1.2" fill="#1E1008" stroke="currentColor" stroke-width="0.6"/>
                        <path d="M4 10V17M9 10V17M15 10V17M20 10V17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                        <path d="M2 18H22M1 20.5H23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    {:else if punto.id === 'teatro-juarez'}
                        <!-- Teatro Juárez - Máscaras clásicas de época -->
                        <path d="M3 13C3 8 7 4 12 4C17 4 21 8 21 13C21 17.5 18 20.5 12 20.5C6 20.5 3 17.5 3 13Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
                        <ellipse cx="8.5" cy="11.5" rx="1.8" ry="1.2" fill="currentColor"/>
                        <ellipse cx="15.5" cy="11.5" rx="1.8" ry="1.2" fill="currentColor"/>
                        <path d="M8 15.5C9.5 17.5 14.5 17.5 16 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/>
                    {:else if punto.id === 'tiro-norte'}
                        <!-- Tiro Norte - Castillete minero y polea de extracción -->
                        <circle cx="12" cy="4" r="2.4" fill="none" stroke="currentColor" stroke-width="1.4"/>
                        <path d="M6 21L9.5 6H14.5L18 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                        <path d="M8 13.5H16M6.8 17.5H17.2" stroke="currentColor" stroke-width="1.3"/>
                        <path d="M12 4L19 21" stroke="currentColor" stroke-width="1.2" stroke-dasharray="1.5 1"/>
                    {/if}
                </g>

                <!-- Etiqueta con el nombre -->
                <text
                    x={punto.mapa.x}
                    y={punto.mapa.y + 27}
                    text-anchor="middle"
                    font-size="7.5"
                    font-family="Inter, sans-serif"
                    font-weight={visitado ? "600" : "400"}
                    fill={visitado ? "rgba(245,200,122,0.9)" : "rgba(160,128,96,0.5)"}
                    pointer-events="none"
                >{truncar(punto.nombre)}</text>

                <!-- Candado en no visitados (SVG vectorial de época) -->
                {#if !visitado}
                    <g transform="translate({punto.mapa.x + 8}, {punto.mapa.y - 12}) scale(0.4)" opacity="0.75">
                        <rect x="2" y="5" width="12" height="9" rx="1.8" fill="#1C0E07" stroke="#A08060" stroke-width="1.2"/>
                        <path d="M4.5 5V3.5a3.5 3.5 0 0 1 7 0V5" fill="none" stroke="#A08060" stroke-width="1.2" stroke-linecap="round"/>
                        <circle cx="8" cy="9.5" r="1" fill="#D4A017"/>
                    </g>
                {/if}
            {/each}
        </svg>
    </div>
</section>

<!-- ─ Modal / Panel de punto seleccionado (fuera del mapa para evitar overflow) ─── -->
{#if puntoSeleccionado}
    {@const visitado = idsVisitados.has(puntoSeleccionado.id)}
    <!-- Overlay para cerrar modal -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
        class="overlay"
        on:click={cerrarTooltip}
        tabindex="-1"
        role="button"
        aria-label="Cerrar modal"
    ></div>

    <div
        class="tooltip"
        class:tooltip-visitado={visitado}
        class:tooltip-bloqueado={!visitado}
        role="dialog"
        aria-label="Información de {puntoSeleccionado.nombre}"
    >
        <button class="tooltip-cerrar" on:click={cerrarTooltip} aria-label="Cerrar">✕</button>

        <div class="tooltip-icono-vector" aria-hidden="true">
            {#if puntoSeleccionado.id === 'palacio-municipal'}
                <svg viewBox="0 0 24 24" class="tooltip-svg"><path d="M2 9L12 3L22 9H2Z" fill="currentColor"/><circle cx="12" cy="6.6" r="1.2" fill="#1E1008" stroke="currentColor" stroke-width="0.6"/><path d="M4 10V17M9 10V17M15 10V17M20 10V17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M2 18H22M1 20.5H23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            {:else if puntoSeleccionado.id === 'teatro-juarez'}
                <svg viewBox="0 0 24 24" class="tooltip-svg"><path d="M3 13C3 8 7 4 12 4C17 4 21 8 21 13C21 17.5 18 20.5 12 20.5C6 20.5 3 17.5 3 13Z" fill="none" stroke="currentColor" stroke-width="1.6"/><ellipse cx="8.5" cy="11.5" rx="1.8" ry="1.2" fill="currentColor"/><ellipse cx="15.5" cy="11.5" rx="1.8" ry="1.2" fill="currentColor"/><path d="M8 15.5C9.5 17.5 14.5 17.5 16 15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>
            {:else if puntoSeleccionado.id === 'tiro-norte'}
                <svg viewBox="0 0 24 24" class="tooltip-svg"><circle cx="12" cy="4" r="2.4" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 21L9.5 6H14.5L18 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8 13.5H16M6.8 17.5H17.2" stroke="currentColor" stroke-width="1.3"/><path d="M12 4L19 21" stroke="currentColor" stroke-width="1.2" stroke-dasharray="1.5 1"/></svg>
            {/if}
        </div>
        <h3 class="tooltip-nombre">{puntoSeleccionado.nombre}</h3>
        <p class="tooltip-desc">{puntoSeleccionado.descripcionCorta}</p>

        {#if visitado}
            <button
                class="btn-tooltip btn-dorado"
                on:click={() => irAlPunto(puntoSeleccionado.id)}
            >
                <svg class="btn-tooltip-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                </svg>
                <span>Visitar nuevamente</span>
            </button>
        {:else}
            <p class="tooltip-hint">📍 Dirígete a este lugar para escanear el QR y desbloquear la historia.</p>
            <button
                class="btn-tooltip btn-mapas"
                on:click={() => abrirMapas(
                    puntoSeleccionado.coordenadas.lat,
                    puntoSeleccionado.coordenadas.lng,
                    puntoSeleccionado.nombre
                )}
            >
                <svg class="btn-tooltip-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                    <line x1="8" y1="2" x2="8" y2="18"/>
                    <line x1="16" y1="6" x2="16" y2="22"/>
                </svg>
                <span>Cómo llegar</span>
            </button>
        {/if}
    </div>
{/if}

<style>
    /* ─── Sección contenedora ────────────────────────────────────────── */
    .ruta-mapa {
        max-width: 520px;
        margin: 16px auto 0;
        padding: 0 16px;
    }

    /* ─── Encabezado ─────────────────────────────────────────────────── */
    .mapa-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        margin-bottom: 12px;
    }
    .mapa-titulo-wrap {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 2px;
    }
    .mapa-titulo-icono {
        width: 18px;
        height: 18px;
        color: var(--gold-bright, #F2C94C);
        flex-shrink: 0;
    }
    .mapa-titulo {
        font-family: 'Cinzel', serif;
        font-size: 1.2rem;
        font-weight: 700;
        margin: 0;
        background: linear-gradient(135deg, var(--gold-bright, #F2C94C), var(--gold-mid, #D4A017));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .mapa-contador {
        font-size: 0.8rem;
        color: var(--text-muted, #A08060);
        margin: 0;
    }
    .cnt-num  { color: var(--gold-bright, #F2C94C); font-weight: 700; }
    .cnt-total { color: var(--text-muted, #A08060); }
    .cnt-completada {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--gold-bright, #F2C94C);
        font-weight: 600;
    }
    .cnt-trofeo-icono {
        width: 15px;
        height: 15px;
        color: var(--gold-bright, #F2C94C);
    }

    /* ─── Wrapper del mapa ───────────────────────────────────────────── */
    .mapa-wrapper {
        position: relative;
        background: var(--bg-card, #1E1008);
        border: 1px solid var(--border-dim, rgba(212,160,23,0.12));
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }

    svg {
        display: block;
        width: 100%;
        height: auto;
    }

    /* ─── Rutas animadas ─────────────────────────────────────────────── */
    .ruta-activa {
        animation: marchar-ruta 1.4s linear infinite;
    }
    @keyframes marchar-ruta {
        from { stroke-dashoffset: 0; }
        to   { stroke-dashoffset: -24; } /* 6 + 6 + 6 + 6 */
    }

    /* ─── Sendero de exploración hacia puntos pendientes ─────────────── */
    .ruta-exploracion {
        animation: marchar-exploracion 3.2s linear infinite;
        transition: stroke 0.25s, stroke-width 0.25s, filter 0.25s;
    }
    .ruta-exploracion:hover {
        stroke: rgba(242, 201, 76, 0.85);
        stroke-width: 3.5;
        filter: drop-shadow(0 0 5px rgba(242, 201, 76, 0.7));
    }
    @keyframes marchar-exploracion {
        from { stroke-dashoffset: 0; }
        to   { stroke-dashoffset: -20; }
    }

    /* ─── Anillo de pulso SVG ────────────────────────────────────────── */
    .anillo-pulso {
        animation: pulsar-anillo 2.2s ease-out infinite;
        transform-box: fill-box;
        transform-origin: center;
    }
    @keyframes pulsar-anillo {
        0%   { r: 13; opacity: 0.8; }
        100% { r: 24; opacity: 0;   }
    }

    /* ─── Radar de exploración para puntos pendientes ───────────────── */
    .anillo-pulso-pendiente {
        animation: pulsar-radar 3.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        transform-box: fill-box;
        transform-origin: center;
        pointer-events: none;
    }
    @keyframes pulsar-radar {
        0%   { r: 13; opacity: 0.75; stroke: rgba(242, 201, 76, 0.65); }
        50%  { opacity: 0.35; stroke: rgba(200, 138, 88, 0.4); }
        100% { r: 26; opacity: 0; stroke: rgba(200, 138, 88, 0); }
    }

    /* ─── Marcadores — entrada escalonada e interactividad ──────────── */
    .marcador {
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.2s, stroke-width 0.2s, filter 0.2s;
    }
    .marcador:hover {
        transform: scale(1.18);
        filter: drop-shadow(0 0 12px rgba(242, 201, 76, 0.9));
    }
    .marcador,
    .marcador-num {
        animation: aparecer-marcador 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: calc(var(--orden, 0) * 0.18s);
        transform-box: fill-box;
        transform-origin: center;
    }
    @keyframes aparecer-marcador {
        from { transform: scale(0); opacity: 0; }
        to   { transform: scale(1); opacity: 1; }
    }

    /* ─── Overlay para cerrar modal ────────────────────────────────── */
    .overlay {
        position: fixed;
        inset: 0;
        z-index: 100;
        background: rgba(0, 0, 0, 0.72);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
    }

    /* ─── Modal / Panel de punto (Estilo StampCollection) ──────────── */
    .tooltip {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 360px;
        max-height: 85vh;
        overflow-y: auto;
        padding: 22px 20px 24px;
        border-radius: 18px;
        z-index: 101;
        box-shadow:
            0 16px 40px rgba(0, 0, 0, 0.85),
            0 0 30px rgba(212, 160, 23, 0.15);
        animation: slide-up-modal 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes slide-up-modal {
        from {
            opacity: 0;
            transform: translate(-50%, calc(-50% + 20px)) scale(0.92);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }

    .tooltip-visitado {
        background: linear-gradient(160deg, #221208 0%, #2E1B0B 100%);
        border: 1px solid rgba(212, 160, 23, 0.5);
    }
    .tooltip-bloqueado {
        background: linear-gradient(160deg, #1C0E07 0%, #261709 100%);
        border: 1px solid rgba(212, 160, 23, 0.35);
    }

    .tooltip-cerrar {
        position: absolute;
        top: 12px;
        right: 14px;
        background: transparent;
        border: none;
        color: var(--text-muted, #A08060);
        font-size: 1rem;
        cursor: pointer;
        padding: 6px;
        line-height: 1;
        transition: all 0.15s;
    }
    .tooltip-cerrar:hover {
        color: var(--text-primary, #F5E6C8);
        transform: scale(1.15);
    }

    .tooltip-icono-vector {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto 8px;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(212, 160, 23, 0.12);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.35));
        color: var(--gold-bright, #F2C94C);
    }
    .tooltip-svg {
        width: 22px;
        height: 22px;
    }
    .marcador-icono-svg {
        transition: transform 0.2s ease, opacity 0.2s ease;
    }
    .tooltip-nombre {
        font-family: 'Cinzel', serif;
        font-size: 0.95rem;
        font-weight: 700;
        margin: 0 0 6px;
        color: var(--text-primary, #F5E6C8);
        text-align: center;
    }
    .tooltip-desc {
        font-size: 0.78rem;
        color: var(--text-muted, #A08060);
        line-height: 1.5;
        margin: 0 0 12px;
        text-align: center;
    }
    .tooltip-hint {
        font-size: 0.78rem;
        color: var(--text-muted, #A08060);
        margin: 0 0 10px;
        text-align: center;
        line-height: 1.5;
    }

    /* ─── Botones del tooltip ────────────────────────────────────────── */
    .btn-tooltip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 11px 16px;
        border-radius: 999px;
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
    }
    .btn-tooltip-svg {
        width: 15px;
        height: 15px;
        flex-shrink: 0;
    }
    .btn-dorado {
        background: linear-gradient(135deg, var(--gold-mid, #D4A017), var(--gold-bright, #F2C94C));
        color: #12090A;
        box-shadow: 0 4px 14px rgba(212, 160, 23, 0.35);
    }
    .btn-dorado:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(212, 160, 23, 0.5);
    }
    .btn-mapas {
        background: rgba(212, 160, 23, 0.12);
        color: var(--gold-bright, #F2C94C);
        border: 1px solid rgba(212, 160, 23, 0.35) !important;
        border: none;
    }
    .btn-mapas:hover {
        background: rgba(212, 160, 23, 0.2);
        transform: translateY(-1px);
    }
</style>
