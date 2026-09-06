<script lang="ts">
    import type { AliadoData } from "../data/aliados";
    import { userStore, puedeCanjearBeneficioHoy } from "../stores/user";

    export let aliado: AliadoData;
    /** "celebracion" → entrada animada, tamaño completo.
     *  "modal" → compacto, sin animación de entrada.  */
    export let tipo: "celebracion" | "modal" = "modal";

    const iconoTipo: Record<string, string> = {
        descuento: "％",
        cortesia:  "☕",
        otro:      "🎁",
    };

    $: beneficio = aliado.beneficio;
    $: stampAliado = $userStore.sellosAliados?.[aliado.id];
    $: disponibleHoy = puedeCanjearBeneficioHoy(stampAliado);
    $: ultimoCanje = stampAliado?.ultimoCanje;

    $: icono = iconoTipo[beneficio?.tipo ?? "otro"] ?? "🎁";
    $: etiqueta =
        beneficio?.tipo === "descuento"
            ? "DESCUENTO EXCLUSIVO"
            : beneficio?.tipo === "cortesia"
              ? "CORTESÍA DE BIENVENIDA"
              : "BENEFICIO ESPECIAL";

    /**
     * Construye la URL óptima para abrir la app nativa de mapas con indicaciones hacia el establecimiento.
     */
    function getMapUrl(aliadoData: AliadoData): string {
        const lat = aliadoData.coordenadas?.lat ?? 19.8032;
        const lng = aliadoData.coordenadas?.lng ?? -100.1315;
        const nombreEnc = encodeURIComponent(`${aliadoData.nombre}, El Oro`);

        if (typeof navigator !== "undefined") {
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isIOS) {
                return `https://maps.apple.com/?daddr=${lat},${lng}&q=${nombreEnc}`;
            }
        }
        return `https://google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }

    function formatearHora(iso: string): string {
        try {
            const d = new Date(iso);
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "";
        }
    }
</script>

{#if beneficio}
    <div
        class="voucher"
        class:voucher-celebracion={tipo === "celebracion"}
        class:voucher-modal={tipo === "modal"}
        class:voucher-canjeado={!disponibleHoy}
    >
        <!-- Encabezado del ticket -->
        <div class="voucher-head">
            <div class="voucher-head-left">
                <span class="voucher-icono-tipo" aria-hidden="true">{icono}</span>
                <span class="voucher-etiqueta">{etiqueta}</span>
            </div>
            
            <!-- Estado en vivo -->
            {#if disponibleHoy}
                <span class="voucher-status-tag tag-disponible">
                    <span class="pulse-dot"></span>
                    Disponible hoy
                </span>
            {:else}
                <span class="voucher-status-tag tag-canjeado">
                    ✓ Canjeado ({formatearHora(ultimoCanje?.fecha || "")})
                </span>
            {/if}
        </div>

        <!-- Cuerpo: aliado + beneficio + dirección -->
        <div class="voucher-cuerpo">
            <p class="voucher-aliado">{aliado.nombre}</p>
            <p class="voucher-detalle">{beneficio.detalle}</p>
            {#if aliado.direccion}
                <p class="voucher-direccion">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dir-icon">
                        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{aliado.direccion}</span>
                </p>
            {/if}
        </div>

        <!-- Línea perforada -->
        <div class="voucher-perforacion" aria-hidden="true">
            <span class="perforacion-circulo perforacion-izq"></span>
            <span class="perforacion-linea"></span>
            <span class="perforacion-circulo perforacion-der"></span>
        </div>

        <!-- Pie del ticket: vigencia + Acciones -->
        <div class="voucher-pie">
            <div class="pie-info">
                <span class="voucher-vigencia">📅 {beneficio.vigencia} • 1 por día</span>
                {#if !disponibleHoy && ultimoCanje?.folio}
                    <span class="folio-canje-tag">Folio: {ultimoCanje.folio}</span>
                {/if}
            </div>

            <div class="voucher-botones">
                {#if disponibleHoy}
                    <a href={`/aliado/${aliado.id}?canjear=1`} class="btn-voucher-accion btn-canjear">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                            <rect x="7" y="7" width="10" height="10" rx="2" />
                        </svg>
                        <span>Canjear con QR</span>
                    </a>
                {/if}

                <a
                    href={getMapUrl(aliado)}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-voucher-accion btn-mapa"
                    title="Cómo llegar en mapas"
                >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                        <line x1="9" y1="3" x2="9" y2="18"></line>
                        <line x1="15" y1="6" x2="15" y2="21"></line>
                    </svg>
                    <span>Mapa</span>
                </a>
            </div>
        </div>
    </div>
{/if}

<style>
    /* ─── Base ticket Mobile-First ─────────────────────────────────── */
    .voucher {
        display: flex;
        flex-direction: column;
        gap: 0;
        width: 100%;
        max-width: 360px;
        background: rgba(16, 8, 4, 0.95);
        border: 1px solid rgba(212, 160, 23, 0.45);
        border-radius: 14px;
        overflow: hidden;
        color: var(--text-primary, #F5E6C8);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 14px rgba(212, 160, 23, 0.15);
        transition: transform 0.2s, box-shadow 0.2s;
    }

    .voucher-canjeado {
        border-color: rgba(212, 160, 23, 0.25);
        background: rgba(14, 7, 3, 0.85);
    }

    /* ─── Encabezado ─────────────────────────────────────────────── */
    .voucher-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 12px 7px;
        background: linear-gradient(90deg, rgba(212, 160, 23, 0.16) 0%, rgba(212, 160, 23, 0.04) 100%);
        border-bottom: 1px solid rgba(212, 160, 23, 0.18);
    }

    .voucher-head-left {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .voucher-icono-tipo {
        font-size: 0.95rem;
    }

    .voucher-etiqueta {
        font-family: 'Cinzel', serif;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: var(--gold-bright, #F2C94C);
    }

    .voucher-status-tag {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    .tag-disponible {
        background: rgba(76, 175, 130, 0.15);
        border: 1px solid rgba(76, 175, 130, 0.4);
        color: #4CAF82;
    }
    .tag-canjeado {
        background: rgba(212, 160, 23, 0.12);
        border: 1px solid rgba(212, 160, 23, 0.3);
        color: var(--amber-light, #F5C87A);
    }

    .pulse-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4CAF82;
        box-shadow: 0 0 6px #4CAF82;
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(0.8); }
    }

    /* ─── Cuerpo ─────────────────────────────────────────────────── */
    .voucher-cuerpo {
        padding: 10px 14px 8px;
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .voucher-aliado {
        font-family: 'Cinzel', serif;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--gold-bright, #F2C94C);
        margin: 0;
    }

    .voucher-detalle {
        font-size: 0.84rem;
        font-weight: 600;
        color: var(--text-primary, #F5E6C8);
        line-height: 1.35;
        margin: 0;
    }

    .voucher-direccion {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.72rem;
        color: var(--text-muted, #A08060);
        margin: 2px 0 0;
    }
    .dir-icon {
        color: var(--gold-mid, #D4A017);
        flex-shrink: 0;
    }

    /* ─── Perforación ────────────────────────────────────────────── */
    .voucher-perforacion {
        position: relative;
        display: flex;
        align-items: center;
        height: 16px;
        overflow: hidden;
    }

    .perforacion-circulo {
        position: absolute;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--bg-primary, #12090A);
        border: 1px solid rgba(212, 160, 23, 0.45);
        top: 50%;
        transform: translateY(-50%);
    }
    .perforacion-izq { left: -8px; }
    .perforacion-der { right: -8px; }

    .perforacion-linea {
        width: 100%;
        margin: 0 12px;
        border-bottom: 1.5px dashed rgba(212, 160, 23, 0.3);
    }

    /* ─── Pie ─────────────────────────────────────────────────────── */
    .voucher-pie {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 4px 12px 10px;
    }

    .pie-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .voucher-vigencia {
        font-size: 0.7rem;
        color: var(--text-muted, #A08060);
    }

    .folio-canje-tag {
        font-family: 'Cinzel', serif;
        font-size: 0.68rem;
        color: var(--gold-bright, #F2C94C);
        font-weight: 700;
    }

    .voucher-botones {
        display: flex;
        gap: 8px;
    }

    .btn-voucher-accion {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 0.78rem;
        font-weight: 600;
        text-decoration: none;
        transition: all 0.2s ease;
    }

    .btn-canjear {
        flex: 2;
        background: linear-gradient(135deg, #F2C94C 0%, #D4A017 100%);
        color: #1A0D00;
        font-family: 'Cinzel', serif;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(212, 160, 23, 0.3);
    }
    .btn-canjear:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(242, 201, 76, 0.5);
    }

    .btn-mapa {
        flex: 1;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(212, 160, 23, 0.25);
        color: var(--text-primary, #F5E6C8);
    }
    .btn-mapa:hover {
        background: rgba(212, 160, 23, 0.15);
        border-color: var(--gold-mid, #D4A017);
    }
</style>
