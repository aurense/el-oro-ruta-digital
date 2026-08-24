<script lang="ts">
    import RutaMapa from "./RutaMapa.svelte";
    import StampCollection from "./StampCollection.svelte";
    import type { PuntoData } from "../data/puntos";

    export let puntos: PuntoData[];

    // Vista activa: "mapa" o "pasaporte"
    // Inicia en mapa — el jugador ve primero el mundo, luego su inventario
    let vistaActiva: "mapa" | "pasaporte" = "mapa";

    function irA(vista: "mapa" | "pasaporte") {
        vistaActiva = vista;
    }
</script>

<div class="app-shell">
    <!-- ─── Ambas vistas en el DOM simultáneamente (técnica RPG) ─── -->
    <!-- Al cambiar de pestaña el estado interno se preserva -->

    <div
        class="vista"
        class:activa={vistaActiva === "mapa"}
        aria-hidden={vistaActiva !== "mapa"}
        id="vista-mapa"
    >
        <RutaMapa {puntos} />
    </div>

    <div
        class="vista"
        class:activa={vistaActiva === "pasaporte"}
        aria-hidden={vistaActiva !== "pasaporte"}
        id="vista-pasaporte"
    >
        <StampCollection {puntos} />
    </div>

    <!-- ─── Tab Bar inferior estilo RPG ──────────────────────────── -->
    <nav class="tab-bar" aria-label="Navegación principal">
        <button
            class="tab-btn"
            class:tab-activa={vistaActiva === "mapa"}
            on:click={() => irA("mapa")}
            aria-pressed={vistaActiva === "mapa"}
            aria-controls="vista-mapa"
            id="tab-mapa"
        >
            <span class="tab-icono" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                    <line x1="8" y1="2" x2="8" y2="18"/>
                    <line x1="16" y1="6" x2="16" y2="22"/>
                </svg>
            </span>
            <span class="tab-label">Explorar</span>
            {#if vistaActiva === "mapa"}
                <span class="tab-pip" aria-hidden="true"></span>
            {/if}
        </button>

        <button
            class="tab-btn"
            class:tab-activa={vistaActiva === "pasaporte"}
            on:click={() => irA("pasaporte")}
            aria-pressed={vistaActiva === "pasaporte"}
            aria-controls="vista-pasaporte"
            id="tab-pasaporte"
        >
            <span class="tab-icono" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    <line x1="12" y1="6" x2="16" y2="6"/>
                    <line x1="12" y1="10" x2="16" y2="10"/>
                    <line x1="12" y1="14" x2="16" y2="14"/>
                </svg>
            </span>
            <span class="tab-label">Pasaporte</span>
            {#if vistaActiva === "pasaporte"}
                <span class="tab-pip" aria-hidden="true"></span>
            {/if}
        </button>
    </nav>
</div>

<style>
    /* ─── Shell: crece para llenar el body (flex: 1 del body) ───── */
    .app-shell {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        position: relative;
        overflow: hidden;
    }

    /* ─── Vistas ─────────────────────────────────────────────────── */
    .vista {
        position: absolute;
        inset: 0;
        bottom: 56px; /* espacio para la tab bar */
        overflow-y: auto;
        overflow-x: hidden;
        /* Oculta sin destruir el componente */
        opacity: 0;
        pointer-events: none;
        transform: translateX(8px);
        transition:
            opacity 0.22s ease,
            transform 0.22s ease;
    }
    .vista.activa {
        opacity: 1;
        pointer-events: auto;
        transform: translateX(0);
    }

    /* ─── Tab Bar ────────────────────────────────────────────────── */
    .tab-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 56px;
        display: flex;
        align-items: stretch;
        background: rgba(18, 9, 10, 0.96);
        border-top: 1px solid rgba(212, 160, 23, 0.18);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        z-index: 50;
    }

    /* ─── Botones de pestaña ─────────────────────────────────────── */
    .tab-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        background: transparent;
        border: none;
        cursor: pointer;
        position: relative;
        padding: 6px 8px;
        transition: background 0.15s;
        /* Touch area generoso */
        -webkit-tap-highlight-color: transparent;
    }
    .tab-btn:active {
        background: rgba(212, 160, 23, 0.06);
    }

    /* Línea superior activa (estilo arcade) */
    .tab-activa::before {
        content: "";
        position: absolute;
        top: 0;
        left: 20%;
        right: 20%;
        height: 2px;
        background: linear-gradient(
            90deg,
            transparent,
            var(--gold-bright, #f2c94c),
            transparent
        );
        border-radius: 0 0 2px 2px;
        animation: barra-tab 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes barra-tab {
        from { opacity: 0; transform: scaleX(0.3); }
        to   { opacity: 1; transform: scaleX(1); }
    }

    .tab-icono {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .tab-icono svg {
        width: 20px;
        height: 20px;
        color: var(--text-dim, #6b5040);
        transition: color 0.2s, transform 0.2s;
    }
    .tab-activa .tab-icono svg {
        color: var(--gold-bright, #f2c94c);
        transform: scale(1.08);
        filter: drop-shadow(0 0 4px rgba(242, 201, 76, 0.5));
    }

    .tab-label {
        font-family: "Inter", sans-serif;
        font-size: 0.68rem;
        font-weight: 500;
        color: var(--text-dim, #6b5040);
        transition: color 0.2s;
        letter-spacing: 0.02em;
    }
    .tab-activa .tab-label {
        color: var(--gold-bright, #f2c94c);
        font-weight: 700;
    }

    /* Pip (punto indicador debajo del label) */
    .tab-pip {
        position: absolute;
        bottom: 5px;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--gold-bright, #f2c94c);
        box-shadow: 0 0 6px rgba(242, 201, 76, 0.8);
        animation: aparecer-pip 0.2s ease;
    }
    @keyframes aparecer-pip {
        from { transform: scale(0); opacity: 0; }
        to   { transform: scale(1); opacity: 1; }
    }
</style>
