<script lang="ts">
    import { onMount } from "svelte";
    import AudioPlayer from "./AudioPlayer.svelte";
    import Trivia from "./Trivia.svelte";
    import DataForm from "./DataForm.svelte";
    import { userStore } from "../stores/user";
    import {
        guardarDatosUsuario,
        guardarVisita,
        guardarSello,
    } from "../lib/db";

    export let punto: {
        id: string;
        nombre: string;
        descripcionCorta: string;
        imagenMiniatura: string;
        audioURL: string;
        duracion: number;
        trivia: {
            pregunta: string;
            opciones: { texto: string; correcta: boolean }[];
        };
        insigniaURL: string;
    };

    let fase: "audio" | "trivia" | "selloGanado" | "fallida" = "audio";
    let mostrarDataForm = false;
    let datosPerfilGuardados = false;
    let perfilLocal = $userStore.perfil;
    // Para la animación del confetti
    let confettiPiezas: { x: number; color: string; delay: number; duration: number; size: number }[] = [];

    $: uid = $userStore.uid;
    $: perfil = $userStore.perfil;
    $: sellos = $userStore.sellos;

    function onAudioEnded() {
        fase = "trivia";
    }

    function onTriviaSuccess() {
        if (sellos.length === 0 && !perfil) {
            mostrarDataForm = true;
        } else {
            guardarSelloLocal();
        }
    }

    function onTriviaFailed() {
        fase = "fallida";
    }

    async function onPerfilGuardado(
        event: CustomEvent<{
            pais: string;
            estado: string;
            municipio: string;
            rangoEdad: string;
        }>,
    ) {
        const datos = event.detail;
        try {
            await guardarDatosUsuario(uid!, { perfil: datos });
            userStore.update((s) => ({ ...s, perfil: datos }));
            mostrarDataForm = false;
            datosPerfilGuardados = true;
            guardarSelloLocal();
        } catch (e) {
            alert("Error al guardar los datos. Intenta de nuevo.");
        }
    }

    async function guardarSelloLocal() {
        if (!uid) return;
        try {
            await guardarSello(uid, punto.id);
            userStore.update((s) => ({
                ...s,
                sellos: [...s.sellos, { puntoId: punto.id, fecha: new Date() }],
            }));
            activarCelebracion();
        } catch (e) {
            userStore.update((s) => ({
                ...s,
                sellos: [...s.sellos, { puntoId: punto.id, fecha: new Date() }],
            }));
            activarCelebracion();
            console.warn("El sello se guardará en el servidor cuando vuelva la conexión.", e);
        }
    }

    function activarCelebracion() {
        fase = "selloGanado";
        generarConfetti();
        // Vibración háptica: patrón de fanfarria
        if ("vibrate" in navigator) {
            navigator.vibrate([80, 40, 80, 40, 200]);
        }
    }

    function generarConfetti() {
        const colores = [
            "#F2C94C", "#D4A017", "#E07B39",
            "#F5C87A", "#fff", "#FFC107",
            "#FF9800", "#FFEB3B"
        ];
        confettiPiezas = Array.from({ length: 40 }, (_, i) => ({
            x: Math.random() * 100,
            color: colores[Math.floor(Math.random() * colores.length)],
            delay: Math.random() * 0.8,
            duration: 1.5 + Math.random() * 1.2,
            size: 6 + Math.random() * 8,
        }));
    }

    function irAlPasaporte() {
        window.location.href = "/";
    }
</script>

<div class="punto-page">
    <!-- Hero image con gradiente overlay -->
    <div class="hero">
        <img src={punto.imagenMiniatura} alt={punto.nombre} class="hero-img" />
        <div class="hero-overlay">
            <h1 class="hero-titulo">{punto.nombre}</h1>
        </div>
    </div>

    <!-- Descripción -->
    <p class="descripcion">{punto.descripcionCorta}</p>

    <!-- ─ Fase: AUDIO ─ -->
    {#if fase === "audio"}
        <AudioPlayer
            audioURL={punto.audioURL}
            duracion={punto.duracion}
            on:ended={onAudioEnded}
        />

    <!-- ─ Fase: TRIVIA ─ -->
    {:else if fase === "trivia"}
        <Trivia
            pregunta={punto.trivia.pregunta}
            opciones={punto.trivia.opciones}
            puntoId={punto.id}
            on:success={onTriviaSuccess}
            on:failed={onTriviaFailed}
        />

    <!-- ─ Fase: SELLO GANADO 🎉 ─ -->
    {:else if fase === "selloGanado"}
        <!-- Confetti -->
        <div class="confetti-container" aria-hidden="true">
            {#each confettiPiezas as p}
                <span
                    class="confetti-pieza"
                    style="
                        left: {p.x}%;
                        background: {p.color};
                        width: {p.size}px;
                        height: {p.size}px;
                        animation-delay: {p.delay}s;
                        animation-duration: {p.duration}s;
                    "
                ></span>
            {/each}
        </div>

        <div class="celebracion">
            <!-- Aura giratoria + badge -->
            <div class="badge-wrapper">
                <div class="aura" aria-hidden="true"></div>
                <div class="aura aura--lenta" aria-hidden="true"></div>
                <img
                    src={punto.insigniaURL}
                    alt="Sello de {punto.nombre}"
                    class="insignia-celebracion"
                />
            </div>

            <p class="celebracion-etiqueta">¡SELLO OBTENIDO!</p>
            <h2 class="celebracion-nombre">{punto.nombre}</h2>
            <p class="celebracion-contador">
                Tu pasaporte: <strong>{sellos.length}</strong> de <strong>3</strong> sellos
            </p>

            <div class="celebracion-acciones">
                <button class="btn-gold" on:click={irAlPasaporte}>
                    🎒 Ver mi pasaporte
                </button>
            </div>
        </div>

    <!-- ─ Fase: FALLIDA ─ -->
    {:else if fase === "fallida"}
        <div class="fallida-card">
            <p class="fallida-icon">😞</p>
            <h2>Mejor suerte mañana</h2>
            <p>Agotaste los intentos de hoy. Regresa mañana para intentarlo de nuevo y obtener tu sello.</p>
            <a href="/" class="btn-outline" style="margin-top: 20px;">Volver al inicio</a>
        </div>
    {/if}

    <!-- Modal de datos de perfil -->
    {#if mostrarDataForm}
        <DataForm on:save={onPerfilGuardado} />
    {/if}
</div>

<style>
    /* ─── Página de punto ──────────────────────────────────────────── */
    .punto-page {
        max-width: 500px;
        margin: 0 auto;
        padding: 0 0 60px;
    }

    /* ─── Hero ─────────────────────────────────────────────────────── */
    .hero {
        position: relative;
        width: 100%;
        height: 240px;
        overflow: hidden;
        border-radius: 0 0 24px 24px;
        margin-bottom: 20px;
    }
    .hero-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
    .hero-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            to top,
            rgba(18, 9, 10, 0.9) 0%,
            rgba(18, 9, 10, 0.3) 50%,
            transparent 100%
        );
        display: flex;
        align-items: flex-end;
        padding: 20px;
    }
    .hero-titulo {
        font-family: 'Cinzel', serif;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        text-shadow: 0 2px 8px rgba(0,0,0,0.8);
        line-height: 1.2;
        margin: 0;
    }

    /* ─── Descripción ───────────────────────────────────────────────── */
    .descripcion {
        font-size: 0.95rem;
        color: var(--text-muted);
        text-align: center;
        padding: 0 20px;
        margin-bottom: 8px;
        line-height: 1.6;
    }

    /* ─── Confetti ──────────────────────────────────────────────────── */
    .confetti-container {
        position: fixed;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 10;
    }
    .confetti-pieza {
        position: absolute;
        top: -12px;
        border-radius: 2px;
        opacity: 0;
        animation: caer-confetti linear forwards;
    }
    @keyframes caer-confetti {
        0%   { transform: translateY(0)    rotate(0deg)   scaleX(1);  opacity: 1; }
        50%  { transform: translateY(50vh) rotate(360deg) scaleX(-1); opacity: 1; }
        100% { transform: translateY(105vh) rotate(720deg) scaleX(-1); opacity: 0; }
    }

    /* ─── Celebración ───────────────────────────────────────────────── */
    .celebracion {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 24px 20px 40px;
        text-align: center;
    }

    .badge-wrapper {
        position: relative;
        width: 160px;
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
    }

    /* Aura giratoria tipo halo */
    .aura {
        position: absolute;
        inset: -16px;
        border-radius: 50%;
        background: conic-gradient(
            transparent 20%,
            rgba(242, 201, 76, 0.5) 40%,
            rgba(224, 123, 57, 0.4) 60%,
            transparent 80%
        );
        animation: girar-aura 3s linear infinite;
    }
    .aura--lenta {
        inset: -28px;
        background: conic-gradient(
            transparent 40%,
            rgba(242, 201, 76, 0.2) 60%,
            transparent 80%
        );
        animation: girar-aura 5s linear infinite reverse;
    }
    @keyframes girar-aura {
        to { transform: rotate(360deg); }
    }

    .insignia-celebracion {
        width: 130px;
        height: 130px;
        object-fit: contain;
        position: relative;
        z-index: 1;
        animation: revelar-insignia 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        filter: drop-shadow(0 0 20px rgba(242, 201, 76, 0.6));
    }
    @keyframes revelar-insignia {
        from { transform: scale(0) rotate(-20deg); opacity: 0; }
        to   { transform: scale(1) rotate(0deg);   opacity: 1; }
    }

    .celebracion-etiqueta {
        font-family: 'Cinzel', serif;
        font-size: 1.35rem;
        font-weight: 700;
        letter-spacing: 2px;
        background: linear-gradient(135deg, var(--gold-bright), var(--gold-mid));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: fadeup 0.5s 0.4s both;
    }
    .celebracion-nombre {
        font-size: 1.1rem;
        color: var(--text-primary);
        font-weight: 500;
        animation: fadeup 0.5s 0.5s both;
    }
    .celebracion-contador {
        font-size: 0.9rem;
        color: var(--text-muted);
        animation: fadeup 0.5s 0.6s both;
    }
    .celebracion-contador strong {
        color: var(--gold-bright);
    }
    .celebracion-acciones {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 8px;
        animation: fadeup 0.5s 0.7s both;
    }

    @keyframes fadeup {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
    }

    /* ─── Fallida ───────────────────────────────────────────────────── */
    .fallida-card {
        margin: 24px 20px;
        padding: 28px 20px;
        background: var(--bg-card);
        border: 1px solid rgba(224, 82, 82, 0.25);
        border-radius: var(--radius-md);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }
    .fallida-icon { font-size: 2.5rem; }
    .fallida-card h2 {
        font-family: 'Cinzel', serif;
        font-size: 1.2rem;
        color: var(--text-primary);
    }
    .fallida-card p {
        font-size: 0.9rem;
        color: var(--text-muted);
        line-height: 1.6;
    }

    /* ─── Botones globales usados aquí ─────────────────────────────── */
    .btn-gold {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: linear-gradient(135deg, var(--gold-mid), var(--gold-bright));
        color: var(--bg-primary);
        border: none;
        border-radius: var(--radius-full, 9999px);
        padding: 13px 30px;
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s;
        box-shadow: 0 4px 16px rgba(212, 160, 23, 0.35);
    }
    .btn-gold:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(212, 160, 23, 0.55);
    }

    .btn-outline {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: var(--gold-mid, #D4A017);
        border: 1px solid rgba(212, 160, 23, 0.30);
        border-radius: 9999px;
        padding: 11px 24px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        font-size: 0.9rem;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s;
    }
    .btn-outline:hover {
        background: rgba(212, 160, 23, 0.1);
        border-color: var(--gold-bright, #F2C94C);
        color: var(--gold-bright, #F2C94C);
    }
</style>
