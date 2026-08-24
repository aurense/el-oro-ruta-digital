<script lang="ts">
    import type { AliadoData } from "../data/aliados";

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
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
</script>

{#if beneficio}
    <a
        href={getMapUrl(aliado)}
        target="_blank"
        rel="noopener noreferrer"
        class="voucher"
        class:voucher-celebracion={tipo === "celebracion"}
        class:voucher-modal={tipo === "modal"}
        aria-label="Abrir indicaciones en mapas hacia {aliado.nombre} — {beneficio.detalle}"
        title="Toca para abrir indicaciones en tu app de mapas"
    >
        <!-- Encabezado del ticket -->
        <div class="voucher-head">
            <div class="voucher-head-left">
                <span class="voucher-icono-tipo" aria-hidden="true">{icono}</span>
                <span class="voucher-etiqueta">{etiqueta}</span>
            </div>
            <span class="voucher-map-tag" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Mapa
            </span>
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

        <!-- Pie del ticket: vigencia + CTA -->
        <div class="voucher-pie">
            <span class="voucher-vigencia">📅 {beneficio.vigencia}</span>
            <span class="voucher-cta">
                <svg class="cta-icono-mapa" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                    <line x1="9" y1="3" x2="9" y2="18"></line>
                    <line x1="15" y1="6" x2="15" y2="21"></line>
                </svg>
                Cómo llegar
                <svg class="cta-flecha" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
            </span>
        </div>
    </a>
{/if}

<style>
    /* ─── Base ticket Mobile-First ─────────────────────────────────── */
    .voucher {
        display: flex;
        flex-direction: column;
        gap: 0;
        width: 100%;
        max-width: 340px;
        background: rgba(16, 8, 4, 0.9);
        border: 1px solid rgba(212, 160, 23, 0.45);
        border-radius: 14px;
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        position: relative;
        box-sizing: border-box;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5);
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;
        cursor: pointer;
    }
    .voucher:hover {
        transform: translateY(-3px);
        border-color: var(--gold-bright, #f2c94c);
        box-shadow: 0 8px 28px rgba(212, 160, 23, 0.3);
    }
    .voucher:active {
        transform: translateY(-1px);
    }

    /* Destello superior animado */
    .voucher::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #f2c94c, transparent);
        animation: destello 4s ease-in-out infinite;
    }
    @keyframes destello {
        0%   { left: -100%; opacity: 0; }
        10%  { opacity: 1; }
        50%  { left: 100%; }
        100% { left: 100%; opacity: 0; }
    }

    /* ─── Encabezado ─────────────────────────────────────────────── */
    .voucher-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 9px 13px 8px;
        background: rgba(212, 160, 23, 0.12);
        border-bottom: 1px solid rgba(212, 160, 23, 0.18);
        box-sizing: border-box;
    }
    .voucher-head-left {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
    }
    .voucher-icono-tipo {
        font-size: 0.95rem;
        line-height: 1;
        flex-shrink: 0;
    }
    .voucher-etiqueta {
        font-size: 0.64rem;
        font-weight: 700;
        letter-spacing: 1.1px;
        color: var(--gold-bright, #f2c94c);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .voucher-map-tag {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 0.62rem;
        font-weight: 700;
        color: #120803;
        background: linear-gradient(135deg, #FFF4B8 0%, #F2C94C 100%);
        padding: 2px 7px;
        border-radius: 999px;
        letter-spacing: 0.4px;
        flex-shrink: 0;
    }

    /* ─── Cuerpo ─────────────────────────────────────────────────── */
    .voucher-cuerpo {
        padding: 10px 14px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        box-sizing: border-box;
    }
    .voucher-aliado {
        font-family: "Cinzel", serif;
        font-size: 0.86rem;
        font-weight: 700;
        color: var(--text-primary, #f5e6c8);
        margin: 0;
        line-height: 1.3;
    }
    .voucher-detalle {
        font-size: 0.8rem;
        color: var(--text-muted, #d8c4b2);
        margin: 0;
        line-height: 1.4;
    }
    .voucher-direccion {
        display: flex;
        align-items: flex-start;
        gap: 4px;
        font-size: 0.72rem;
        color: var(--gold-mid, #d4a017);
        margin: 2px 0 0;
        line-height: 1.3;
    }
    .dir-icon {
        flex-shrink: 0;
        margin-top: 1.5px;
        stroke: var(--gold-mid, #d4a017);
    }

    /* ─── Línea perforada (estilo ticket físico) ─────────────────── */
    .voucher-perforacion {
        display: flex;
        align-items: center;
        position: relative;
    }
    .perforacion-circulo {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--bg-primary, #12090a);
        border: 1px solid rgba(212, 160, 23, 0.35);
        flex-shrink: 0;
        position: relative;
        z-index: 1;
    }
    .perforacion-izq { margin-left: -6px; }
    .perforacion-der { margin-right: -6px; }
    .perforacion-linea {
        flex: 1;
        border-top: 2px dashed rgba(212, 160, 23, 0.3);
        margin: 0 4px;
    }

    /* ─── Pie del ticket ─────────────────────────────────────────── */
    .voucher-pie {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 14px 10px;
        gap: 8px;
        box-sizing: border-box;
    }
    .voucher-vigencia {
        font-size: 0.68rem;
        color: var(--text-dim, #8f725f);
        font-style: italic;
        white-space: nowrap;
    }
    .voucher-cta {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.74rem;
        font-weight: 700;
        color: var(--gold-bright, #f2c94c);
        letter-spacing: 0.3px;
        white-space: nowrap;
        transition: color 0.18s ease;
    }
    .voucher:hover .voucher-cta {
        color: #fff;
    }
    .cta-icono-mapa {
        width: 13px;
        height: 13px;
        stroke: var(--gold-bright, #f2c94c);
    }
    .cta-flecha {
        width: 13px;
        height: 13px;
        transition: transform 0.18s ease;
    }
    .voucher:hover .cta-flecha {
        transform: translateX(3px);
    }

    /* ─── Variante CELEBRACION: más grande + animación de entrada ── */
    .voucher-celebracion {
        max-width: 360px;
        animation: slide-up-voucher 0.4s 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    @keyframes slide-up-voucher {
        from {
            opacity: 0;
            transform: translateY(18px) scale(0.96);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    .voucher-celebracion .voucher-head {
        padding: 11px 16px 9px;
    }
    .voucher-celebracion .voucher-etiqueta {
        font-size: 0.68rem;
    }
    .voucher-celebracion .voucher-cuerpo {
        padding: 12px 16px;
        gap: 5px;
    }
    .voucher-celebracion .voucher-aliado {
        font-size: 0.92rem;
    }
    .voucher-celebracion .voucher-detalle {
        font-size: 0.84rem;
    }
    .voucher-celebracion .voucher-pie {
        padding: 10px 16px 12px;
    }
    .voucher-celebracion .voucher-vigencia {
        font-size: 0.72rem;
    }
    .voucher-celebracion .voucher-cta {
        font-size: 0.8rem;
    }

    /* ─── Variante MODAL: compacto ───────────────────────────────── */
    .voucher-modal {
        max-width: 100%;
        border-radius: 12px;
        flex-shrink: 0;
    }
    .voucher-modal .voucher-head {
        padding: 6px 12px 5px;
    }
    .voucher-modal .voucher-cuerpo {
        padding: 6px 12px;
        gap: 2px;
    }
    .voucher-modal .voucher-aliado {
        font-size: 0.8rem;
    }
    .voucher-modal .voucher-detalle {
        font-size: 0.74rem;
        line-height: 1.35;
    }
    .voucher-modal .voucher-direccion {
        font-size: 0.68rem;
    }
    .voucher-modal .voucher-pie {
        padding: 5px 12px 6px;
    }
    .voucher-modal .voucher-vigencia {
        font-size: 0.64rem;
    }
    .voucher-modal .voucher-cta {
        font-size: 0.72rem;
    }
</style>
