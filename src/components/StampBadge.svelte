<script lang="ts">
    export let imagen: string;
    export let nombre: string;
    export let obtenida: boolean;
</script>

<div class="badge" class:obtenida>
    <div class="badge-img-wrapper">
        <!-- Aura de glow para badges obtenidas -->
        {#if obtenida}
            <div class="badge-glow" aria-hidden="true"></div>
        {/if}
        <img src={imagen} alt={nombre} class:gris={!obtenida} />
        {#if !obtenida}
            <div class="badge-lock" aria-hidden="true">🔒</div>
        {/if}
    </div>
    <span class="nombre">{nombre}</span>
    {#if obtenida}
        <span class="badge-check" aria-label="Obtenida">✓</span>
    {/if}
</div>

<style>
    .badge {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px 12px;
        border-radius: 16px;
        background: var(--bg-card, #1E1008);
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.1));
        transition: transform 0.2s, border-color 0.3s;
        position: relative;
        cursor: default;
    }

    .badge.obtenida {
        border-color: var(--border-gold, rgba(212, 160, 23, 0.4));
        background: linear-gradient(145deg, #1E1008, #2A1A0A);
        animation: pulso-gold 4s ease-in-out infinite;
    }
    .badge.obtenida:hover {
        transform: translateY(-4px) scale(1.03);
        border-color: var(--gold-mid, #D4A017);
        box-shadow: 0 8px 32px rgba(212, 160, 23, 0.3);
    }

    @keyframes pulso-gold {
        0%, 100% { box-shadow: 0 0 0   0   rgba(212, 160, 23, 0);   }
        50%       { box-shadow: 0 0 16px 2px rgba(212, 160, 23, 0.2); }
    }

    /* ─── Wrapper imagen ─────────────────────────────────────────── */
    .badge-img-wrapper {
        position: relative;
        width: 86px;
        height: 86px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .badge-glow {
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(212, 160, 23, 0.3) 0%, transparent 70%);
        animation: glow-pulso 2.5s ease-in-out infinite;
    }
    @keyframes glow-pulso {
        0%, 100% { opacity: 0.6; transform: scale(0.95); }
        50%       { opacity: 1;   transform: scale(1.05); }
    }

    img {
        width: 80px;
        height: 80px;
        object-fit: contain;
        transition: filter 0.4s, transform 0.3s;
        position: relative;
        z-index: 1;
    }
    img.gris {
        filter: grayscale(100%) brightness(0.35);
    }
    .badge.obtenida img {
        filter: drop-shadow(0 2px 8px rgba(212, 160, 23, 0.4));
    }

    /* ─── Candado sobre badges bloqueadas ────────────────────────── */
    .badge-lock {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        z-index: 2;
        opacity: 0.6;
    }

    /* ─── Nombre ─────────────────────────────────────────────────── */
    .nombre {
        font-size: 0.78rem;
        color: var(--text-muted, #A08060);
        text-align: center;
        line-height: 1.3;
        max-width: 120px;
    }
    .badge.obtenida .nombre {
        color: var(--amber-light, #F5C87A);
    }

    /* ─── Checkmark ──────────────────────────────────────────────── */
    .badge-check {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        background: var(--gold-mid, #D4A017);
        color: #12090A;
        border-radius: 50%;
        font-size: 0.7rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }
</style>
