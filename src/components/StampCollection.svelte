<script lang="ts">
    import StampBadge from "./StampBadge.svelte";
    import { userStore } from "../stores/user";
    import type { PuntoData } from "../data/puntos";
    import { onMount } from "svelte";

    export let puntos: PuntoData[];

    $: sellos = $userStore.sellos;
    $: total = puntos.length;
    $: obtenidos = sellos.length;
    $: porcentaje = total > 0 ? (obtenidos / total) * 100 : 0;
    $: rango = obtenidos === 0
        ? { label: "Explorador Novato", icono: "🔍" }
        : obtenidos < total
        ? { label: "Explorador en Progreso", icono: "🏅" }
        : { label: "Explorador Completo", icono: "🏆" };

    // Animar la barra XP al montar
    let barraVisible = false;
    onMount(() => {
        setTimeout(() => (barraVisible = true), 100);
    });
</script>

<div class="pasaporte">
    <!-- Encabezado del pasaporte -->
    <header class="pasaporte-header">
        <p class="rango-icono">{rango.icono}</p>
        <h2 class="pasaporte-titulo">Mi Pasaporte</h2>
        <p class="rango-label">{rango.label}</p>
    </header>

    <!-- Barra de XP / progreso -->
    <div class="xp-section">
        <div class="xp-labels">
            <span class="xp-texto">Sellos coleccionados</span>
            <span class="xp-contador">{obtenidos} / {total}</span>
        </div>
        <div class="xp-track" role="progressbar" aria-valuenow={obtenidos} aria-valuemax={total}>
            <div
                class="xp-fill"
                class:visible={barraVisible}
                style="width: {barraVisible ? porcentaje : 0}%"
            ></div>
        </div>
    </div>

    <!-- Cuadrícula de insignias -->
    <div class="grid">
        {#each puntos as punto}
            {@const obtenida = sellos.some((s) => s.puntoId === punto.id)}
            <StampBadge
                imagen={punto.insigniaURL}
                nombre={punto.nombre}
                {obtenida}
            />
        {/each}
    </div>

    <!-- Mensaje de completado -->
    {#if obtenidos === total && total > 0}
        <div class="completado">
            <p class="completado-icon">🎉</p>
            <p class="completado-texto">¡Has completado el Pasaporte El Oro!</p>
            <p class="completado-sub">Eres un verdadero explorador del Pueblo Mágico Minero.</p>
        </div>
    {/if}
</div>

<style>
    .pasaporte {
        max-width: 520px;
        margin: 0 auto;
        padding: 24px 16px 48px;
    }

    /* ─── Header ─────────────────────────────────────────────────── */
    .pasaporte-header {
        text-align: center;
        margin-bottom: 28px;
        padding-top: 16px;
    }
    .rango-icono {
        font-size: 2.2rem;
        margin-bottom: 6px;
        animation: flotar 3s ease-in-out infinite;
    }
    @keyframes flotar {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(-6px); }
    }
    .pasaporte-titulo {
        font-family: 'Cinzel', serif;
        font-size: 1.6rem;
        font-weight: 700;
        margin: 0 0 6px;
        background: linear-gradient(135deg, var(--gold-bright, #F2C94C), var(--gold-mid, #D4A017));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .rango-label {
        font-size: 0.85rem;
        color: var(--text-muted, #A08060);
        letter-spacing: 0.5px;
    }

    /* ─── Barra XP ───────────────────────────────────────────────── */
    .xp-section {
        margin-bottom: 28px;
        padding: 16px 20px;
        background: var(--bg-card, #1E1008);
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.12));
        border-radius: 14px;
    }
    .xp-labels {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    .xp-texto {
        font-size: 0.8rem;
        color: var(--text-muted, #A08060);
    }
    .xp-contador {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--gold-bright, #F2C94C);
        font-variant-numeric: tabular-nums;
    }
    .xp-track {
        height: 10px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 5px;
        overflow: hidden;
    }
    .xp-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--gold-dark, #8B6914), var(--gold-bright, #F2C94C));
        border-radius: 5px;
        width: 0%;
        transition: width 1.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 0 12px rgba(242, 201, 76, 0.5);
        position: relative;
    }
    /* Brillo deslizante en la barra */
    .xp-fill.visible::after {
        content: '';
        position: absolute;
        top: 0; right: 0;
        width: 40px; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        animation: brillo-xp 2s 1.2s ease forwards;
    }
    @keyframes brillo-xp {
        from { opacity: 1; transform: translateX(0); }
        to   { opacity: 0; transform: translateX(20px); }
    }

    /* ─── Cuadrícula ─────────────────────────────────────────────── */
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
    }

    /* ─── Completado ─────────────────────────────────────────────── */
    .completado {
        margin-top: 32px;
        padding: 24px 20px;
        background: var(--bg-card, #1E1008);
        border: 1px solid rgba(242, 201, 76, 0.35);
        border-radius: 16px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        box-shadow: 0 0 32px rgba(212, 160, 23, 0.15);
    }
    .completado-icon {
        font-size: 2.5rem;
        margin-bottom: 4px;
    }
    .completado-texto {
        font-family: 'Cinzel', serif;
        font-size: 1.05rem;
        font-weight: 700;
        background: linear-gradient(135deg, var(--gold-bright, #F2C94C), var(--gold-mid, #D4A017));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
    }
    .completado-sub {
        font-size: 0.85rem;
        color: var(--text-muted, #A08060);
        margin: 0;
    }
</style>
