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
</script>

{#if beneficio}
    <a
        href="/aliado/{aliado.id}"
        class="voucher"
        class:voucher-celebracion={tipo === "celebracion"}
        class:voucher-modal={tipo === "modal"}
        aria-label="Voucher: {beneficio.detalle} — {aliado.nombre}"
    >
        <!-- Encabezado del ticket -->
        <div class="voucher-head">
            <span class="voucher-icono-tipo" aria-hidden="true">{icono}</span>
            <span class="voucher-etiqueta">{etiqueta}</span>
        </div>

        <!-- Cuerpo: aliado + beneficio -->
        <div class="voucher-cuerpo">
            <p class="voucher-aliado">{aliado.nombre}</p>
            <p class="voucher-detalle">{beneficio.detalle}</p>
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
                Visitar
                <svg class="cta-flecha" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
            </span>
        </div>
    </a>
{/if}

<style>
    /* ─── Base ticket ──────────────────────────────────────────────── */
    .voucher {
        display: flex;
        flex-direction: column;
        gap: 0;
        width: 100%;
        max-width: 340px;
        background: rgba(14, 7, 3, 0.85);
        border: 1px solid rgba(212, 160, 23, 0.4);
        border-radius: 14px;
        overflow: hidden;
        text-decoration: none;
        color: inherit;
        position: relative;
        transition: transform 0.18s, box-shadow 0.18s;
    }
    .voucher:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 28px rgba(212, 160, 23, 0.22);
    }
    .voucher:active {
        transform: translateY(0);
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
        gap: 8px;
        padding: 10px 14px 8px;
        background: rgba(212, 160, 23, 0.1);
        border-bottom: 1px solid rgba(212, 160, 23, 0.15);
    }
    .voucher-icono-tipo {
        font-size: 1rem;
        line-height: 1;
    }
    .voucher-etiqueta {
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 1.2px;
        color: var(--gold-mid, #d4a017);
    }

    /* ─── Cuerpo ─────────────────────────────────────────────────── */
    .voucher-cuerpo {
        padding: 10px 14px 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .voucher-aliado {
        font-family: "Cinzel", serif;
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-primary, #f5e6c8);
        margin: 0;
        line-height: 1.3;
    }
    .voucher-detalle {
        font-size: 0.8rem;
        color: var(--text-muted, #a08060);
        margin: 0;
        line-height: 1.45;
    }

    /* ─── Línea perforada (estilo ticket físico) ─────────────────── */
    .voucher-perforacion {
        display: flex;
        align-items: center;
        padding: 0 0;
        position: relative;
    }
    .perforacion-circulo {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--bg-primary, #12090a);
        border: 1px solid rgba(212, 160, 23, 0.3);
        flex-shrink: 0;
        position: relative;
        z-index: 1;
    }
    .perforacion-izq { margin-left: -6px; }
    .perforacion-der { margin-right: -6px; }
    .perforacion-linea {
        flex: 1;
        border-top: 2px dashed rgba(212, 160, 23, 0.25);
        margin: 0 4px;
    }

    /* ─── Pie del ticket ─────────────────────────────────────────── */
    .voucher-pie {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 14px 10px;
        gap: 8px;
    }
    .voucher-vigencia {
        font-size: 0.7rem;
        color: var(--text-dim, #6b5040);
        font-style: italic;
    }
    .voucher-cta {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--gold-bright, #f2c94c);
        letter-spacing: 0.3px;
        white-space: nowrap;
    }
    .cta-flecha {
        width: 14px;
        height: 14px;
    }

    /* ─── Variante CELEBRACION: más grande + animación de entrada ── */
    .voucher-celebracion {
        max-width: 360px;
        animation: slide-up-voucher 0.4s 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
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
        padding: 12px 16px 10px;
    }
    .voucher-celebracion .voucher-etiqueta {
        font-size: 0.7rem;
    }
    .voucher-celebracion .voucher-cuerpo {
        padding: 12px 16px;
        gap: 6px;
    }
    .voucher-celebracion .voucher-aliado {
        font-size: 0.9rem;
    }
    .voucher-celebracion .voucher-detalle {
        font-size: 0.84rem;
    }
    .voucher-celebracion .voucher-pie {
        padding: 10px 16px 12px;
    }
    .voucher-celebracion .voucher-vigencia {
        font-size: 0.74rem;
    }
    .voucher-celebracion .voucher-cta {
        font-size: 0.78rem;
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
        font-size: 0.78rem;
    }
    .voucher-modal .voucher-detalle {
        font-size: 0.74rem;
        line-height: 1.35;
    }
    .voucher-modal .voucher-pie {
        padding: 5px 12px 6px;
    }
    .voucher-modal .voucher-vigencia {
        font-size: 0.66rem;
    }
    .voucher-modal .voucher-cta {
        font-size: 0.7rem;
    }
</style>
