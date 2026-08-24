<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let imagen: string;
    export let nombre: string;
    export let obtenida: boolean;
    export let puntoId: string; // necesario para el evento

    const dispatch = createEventDispatcher();

    function handleClick() {
        dispatch("seleccionar", { puntoId, obtenida });
    }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div
    class="badge"
    class:obtenida
    role="button"
    tabindex="0"
    aria-label={obtenida ? `Ver sello obtenido: ${nombre}` : `Ver cómo desbloquear sello: ${nombre}`}
    on:click={handleClick}
    on:keydown={(e) => e.key === "Enter" && handleClick()}
>
    {#if obtenida}
        <span class="badge-check" aria-label="Obtenida">✓</span>
    {/if}

    <div class="badge-img-wrapper">
        {#if obtenida}
            <div class="badge-glow" aria-hidden="true"></div>
            <div class="badge-ring" aria-hidden="true"></div>
        {/if}
        <img src={imagen} alt={nombre} class:gris={!obtenida} />
        {#if !obtenida}
            <div class="badge-lock-wrap" aria-hidden="true">
                <span class="badge-lock">🔒</span>
            </div>
        {/if}
    </div>

    <div class="badge-info">
        <h3 class="nombre">{nombre}</h3>
        <div class="badge-status-pill" class:pill-obtenida={obtenida}>
            {#if obtenida}
                <span class="status-dot"></span>
                <span>DESBLOQUEADO</span>
            {:else}
                <span>🔒 PENDIENTE DE VISITA</span>
            {/if}
        </div>
        <p class="badge-hint">
            {obtenida ? "Toca para ver voucher e historia" : "Toca para ver indicaciones"}
        </p>
    </div>
</div>

<style>
    .badge {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        max-width: 320px;
        height: 100%;
        max-height: 100%;
        box-sizing: border-box;
        gap: 8px;
        padding: 16px 16px 14px;
        border-radius: 20px;
        background: linear-gradient(165deg, rgba(30, 16, 8, 0.95), rgba(20, 10, 5, 0.98));
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.16));
        transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
                    border-color 0.3s,
                    box-shadow 0.22s;
        position: relative;
        cursor: pointer;
        user-select: none;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        -webkit-tap-highlight-color: transparent;
        overflow: hidden;
    }

    .badge:not(.obtenida):hover {
        transform: translateY(-3px) scale(1.01);
        border-color: rgba(212, 160, 23, 0.35);
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.7);
    }

    .badge.obtenida {
        border-color: rgba(212, 160, 23, 0.45);
        background: linear-gradient(165deg, #24140a, #160a04);
        box-shadow:
            0 0 0 1px rgba(242, 201, 76, 0.15),
            0 12px 36px rgba(0, 0, 0, 0.75),
            0 0 25px rgba(212, 160, 23, 0.12);
    }
    .badge.obtenida:hover {
        transform: translateY(-4px) scale(1.02);
        border-color: var(--gold-bright, #f2c94c);
        box-shadow:
            0 0 0 1px rgba(242, 201, 76, 0.3),
            0 16px 44px rgba(0, 0, 0, 0.8),
            0 0 35px rgba(242, 201, 76, 0.25);
    }
    .badge:active {
        transform: translateY(-1px) scale(0.98);
        transition: transform 0.08s;
    }

    /* ─── Wrapper imagen elástico ────────────────────────────────── */
    .badge-img-wrapper {
        position: relative;
        flex: 1;
        min-height: 0;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px 0;
    }

    .badge-glow {
        position: absolute;
        width: min(170px, 90%);
        height: min(170px, 90%);
        border-radius: 50%;
        background: radial-gradient(circle, rgba(242, 201, 76, 0.38) 0%, rgba(212, 160, 23, 0.15) 50%, transparent 75%);
        animation: glow-pulso 3s ease-in-out infinite;
        pointer-events: none;
    }
    @keyframes glow-pulso {
        0%, 100% { opacity: 0.7; transform: scale(0.96); }
        50%       { opacity: 1;   transform: scale(1.06); }
    }

    .badge-ring {
        position: absolute;
        width: min(160px, 85%);
        height: min(160px, 85%);
        border-radius: 50%;
        border: 1px dashed rgba(242, 201, 76, 0.35);
        animation: rotar-anillo 20s linear infinite;
        pointer-events: none;
    }
    @keyframes rotar-anillo {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
    }

    img {
        max-width: 100%;
        max-height: 100%;
        width: min(150px, 100%);
        height: auto;
        aspect-ratio: 1;
        object-fit: contain;
        transition: filter 0.4s, transform 0.3s;
        position: relative;
        z-index: 1;
    }
    img.gris {
        filter: grayscale(100%) brightness(0.28) contrast(1.1);
    }
    .badge.obtenida img {
        filter: drop-shadow(0 4px 14px rgba(242, 201, 76, 0.45));
    }

    /* ─── Candado sobre badges bloqueadas ────────────────────────── */
    .badge-lock-wrap {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
    }
    .badge-lock {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(14, 7, 3, 0.85);
        border: 1px solid rgba(212, 160, 23, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
    }

    /* ─── Info del sello ─────────────────────────────────────────── */
    .badge-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        width: 100%;
        text-align: center;
        flex-shrink: 0;
    }

    .nombre {
        font-family: "Cinzel", serif;
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-muted, #a08060);
        margin: 0;
        line-height: 1.2;
        max-width: 260px;
    }
    .badge.obtenida .nombre {
        color: var(--text-primary, #f5e6c8);
        background: linear-gradient(135deg, var(--gold-bright, #f2c94c), var(--amber-light, #f5c87a));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .badge-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.8px;
        background: rgba(255, 255, 255, 0.04);
        color: var(--text-dim, #6b5040);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .badge-status-pill.pill-obtenida {
        background: rgba(212, 160, 23, 0.12);
        color: var(--gold-bright, #f2c94c);
        border-color: rgba(212, 160, 23, 0.35);
    }
    .status-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--gold-bright, #f2c94c);
        box-shadow: 0 0 6px rgba(242, 201, 76, 0.8);
    }

    .badge-hint {
        margin: 0;
        font-size: 0.7rem;
        color: var(--text-dim, #6b5040);
        font-style: italic;
    }

    /* ─── Checkmark ──────────────────────────────────────────────── */
    .badge-check {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, var(--gold-mid, #d4a017), var(--gold-bright, #f2c94c));
        color: #12090a;
        border-radius: 50%;
        font-size: 0.8rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 10px rgba(242, 201, 76, 0.4);
        z-index: 3;
    }
</style>


