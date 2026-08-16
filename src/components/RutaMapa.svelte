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
        <h2 class="mapa-titulo">🗺️ Ruta de Exploración</h2>
        <p class="mapa-contador">
            {#if obtenidos === total && total > 0}
                ¡Ruta completada! 🏆
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

                    <!-- Ruta base gris (siempre visible) -->
                    <line
                        x1={punto.mapa.x} y1={punto.mapa.y}
                        x2={siguiente.mapa.x} y2={siguiente.mapa.y}
                        stroke="rgba(120,80,40,0.35)"
                        stroke-width="2"
                        stroke-dasharray="6 6"
                        stroke-linecap="round"
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

                <!-- Anillo de pulso (solo en visitados) -->
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

                <!-- Icono del punto (encima del número, pequeño) -->
                <text
                    x={punto.mapa.x}
                    y={punto.mapa.y - 19}
                    text-anchor="middle"
                    font-size="11"
                    opacity={visitado ? "1" : "0.35"}
                    pointer-events="none"
                >{punto.mapa.icono}</text>

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

                <!-- Candado en no visitados -->
                {#if !visitado}
                    <text
                        x={punto.mapa.x + 10}
                        y={punto.mapa.y - 6}
                        font-size="8"
                        opacity="0.6"
                        pointer-events="none"
                    >🔒</text>
                {/if}
            {/each}
        </svg>

        <!-- ─ Tooltip / Panel de punto seleccionado ─────────────────── -->
        {#if puntoSeleccionado}
            {@const visitado = idsVisitados.has(puntoSeleccionado.id)}
            <div
                class="tooltip"
                class:tooltip-visitado={visitado}
                class:tooltip-bloqueado={!visitado}
                role="dialog"
                aria-label="Información de {puntoSeleccionado.nombre}"
            >
                <button class="tooltip-cerrar" on:click={cerrarTooltip} aria-label="Cerrar">✕</button>

                <p class="tooltip-icono">{puntoSeleccionado.mapa.icono}</p>
                <h3 class="tooltip-nombre">{puntoSeleccionado.nombre}</h3>
                <p class="tooltip-desc">{puntoSeleccionado.descripcionCorta}</p>

                {#if visitado}
                    <button
                        class="btn-tooltip btn-dorado"
                        on:click={() => irAlPunto(puntoSeleccionado.id)}
                    >
                        ▶ Ver historia de nuevo
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
                        🗺️ Cómo llegar
                    </button>
                {/if}
            </div>
        {/if}
    </div>
</section>

<style>
    /* ─── Sección contenedora ────────────────────────────────────────── */
    .ruta-mapa {
        max-width: 520px;
        margin: 16px auto 0;
        padding: 0 16px;
    }

    /* ─── Encabezado ─────────────────────────────────────────────────── */
    .mapa-header {
        text-align: center;
        margin-bottom: 12px;
    }
    .mapa-titulo {
        font-family: 'Cinzel', serif;
        font-size: 1.15rem;
        font-weight: 700;
        margin: 0 0 4px;
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

    /* ─── Marcadores — entrada escalonada ────────────────────────────── */
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

    /* ─── Overlay para cerrar tooltip ───────────────────────────────── */
    .overlay {
        position: fixed;
        inset: 0;
        z-index: 10;
        background: transparent;
    }

    /* ─── Tooltip ────────────────────────────────────────────────────── */
    .tooltip {
        position: absolute;
        bottom: 12px;
        left: 12px;
        right: 12px;
        padding: 16px 16px 18px;
        border-radius: 14px;
        z-index: 20;
        animation: slide-up 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes slide-up {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
    }

    .tooltip-visitado {
        background: rgba(30, 16, 8, 0.96);
        border: 1px solid rgba(212, 160, 23, 0.45);
        backdrop-filter: blur(12px);
    }
    .tooltip-bloqueado {
        background: rgba(20, 10, 5, 0.96);
        border: 1px solid rgba(100, 70, 40, 0.35);
        backdrop-filter: blur(12px);
    }

    .tooltip-cerrar {
        position: absolute;
        top: 10px;
        right: 12px;
        background: transparent;
        border: none;
        color: var(--text-muted, #A08060);
        font-size: 0.85rem;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
        transition: color 0.15s;
    }
    .tooltip-cerrar:hover { color: var(--text-primary, #F5E6C8); }

    .tooltip-icono {
        font-size: 1.6rem;
        margin: 0 0 4px;
        text-align: center;
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
        display: block;
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
