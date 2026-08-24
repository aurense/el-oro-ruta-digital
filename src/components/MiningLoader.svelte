<script lang="ts">
    export let mensaje: string = "Consultando pasaporte minero...";
    export let variante: "pantalla" | "tarjeta" = "pantalla";
</script>

<div class="mining-loader" class:pantalla={variante === "pantalla"} class:tarjeta={variante === "tarjeta"} role="status" aria-live="polite">
    <div class="loader-anim-wrap">
        <div class="aura-loader" aria-hidden="true"></div>
        <div class="pico-icon" aria-hidden="true">⛏️</div>
        <span class="spark spark-1" aria-hidden="true">✨</span>
        <span class="spark spark-2" aria-hidden="true">✨</span>
    </div>
    <p class="loader-mensaje">{mensaje}</p>
    <div class="loader-progreso-track" aria-hidden="true">
        <div class="loader-progreso-bar"></div>
    </div>
</div>

<style>
    .mining-loader {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        box-sizing: border-box;
        text-align: center;
    }

    .mining-loader.pantalla {
        height: 100%;
        min-height: 200px;
        padding: 24px 16px;
    }

    .mining-loader.tarjeta {
        padding: 20px 16px;
    }

    .loader-anim-wrap {
        position: relative;
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .aura-loader {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: radial-gradient(
            circle,
            rgba(242, 201, 76, 0.3) 0%,
            rgba(212, 160, 23, 0.08) 50%,
            transparent 75%
        );
        animation: pulso-aura 1.8s infinite ease-in-out;
    }
    @keyframes pulso-aura {
        0%, 100% { transform: scale(0.9); opacity: 0.5; }
        50% { transform: scale(1.3); opacity: 1; }
    }

    .pico-icon {
        font-size: 2rem;
        position: relative;
        z-index: 2;
        animation: picar 1.1s infinite cubic-bezier(0.36, 0.07, 0.19, 0.97);
        transform-origin: bottom left;
    }
    @keyframes picar {
        0%, 100% { transform: rotate(0deg); }
        35% { transform: rotate(-32deg); }
        50% { transform: rotate(16deg) scale(1.08); }
        65% { transform: rotate(-8deg); }
    }

    .spark {
        position: absolute;
        font-size: 0.9rem;
        z-index: 3;
        opacity: 0;
        pointer-events: none;
    }
    .spark-1 {
        top: 6px;
        right: 4px;
        animation: destello-1 1.1s infinite ease-out;
    }
    .spark-2 {
        bottom: 12px;
        right: 2px;
        animation: destello-2 1.1s infinite ease-out;
        animation-delay: 0.4s;
    }
    @keyframes destello-1 {
        0%, 45% { opacity: 0; transform: translate(0, 0) scale(0.3); }
        55% { opacity: 1; transform: translate(4px, -6px) scale(1.1); }
        80%, 100% { opacity: 0; transform: translate(8px, -12px) scale(0.5); }
    }
    @keyframes destello-2 {
        0%, 45% { opacity: 0; transform: translate(0, 0) scale(0.3); }
        55% { opacity: 1; transform: translate(6px, 4px) scale(1); }
        80%, 100% { opacity: 0; transform: translate(12px, 8px) scale(0.4); }
    }

    .loader-mensaje {
        font-family: 'Cinzel', serif;
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--gold-bright, #F2C94C);
        margin: 0;
        letter-spacing: 0.5px;
        text-shadow: 0 0 12px rgba(242, 201, 76, 0.25);
    }

    .loader-progreso-track {
        width: 140px;
        height: 3px;
        background: rgba(212, 160, 23, 0.15);
        border-radius: 999px;
        overflow: hidden;
        position: relative;
    }
    .loader-progreso-bar {
        position: absolute;
        top: 0;
        left: -50%;
        width: 50%;
        height: 100%;
        background: linear-gradient(90deg, transparent, var(--gold-bright, #F2C94C), transparent);
        border-radius: 999px;
        animation: desliz-linea 1.4s infinite ease-in-out;
    }
    @keyframes desliz-linea {
        0% { left: -50%; }
        100% { left: 100%; }
    }
</style>
