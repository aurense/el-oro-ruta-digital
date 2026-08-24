<script lang="ts">
    import { onDestroy } from "svelte";
    import { createEventDispatcher } from "svelte";

    export let audioURL: string;
    export let duracion: number = 0;

    const dispatch = createEventDispatcher();

    let audio: HTMLAudioElement;
    let progress = 0;
    let currentTime = 0;
    let duration = 0;
    let playing = false;
    let ended = false;

    // ── Velocidad de reproducción ──
    const velocidades = [0.75, 1, 1.25, 1.5];
    let velocidadActual = 1;

    function setVelocidad(v: number) {
        velocidadActual = v;
        if (audio) audio.playbackRate = v;
    }

    /** Convierte segundos a mm:ss */
    function formatTime(s: number): string {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, "0")}`;
    }

    function onTimeUpdate() {
        if (audio) {
            currentTime = audio.currentTime;
            duration = audio.duration || duracion;
            progress = (currentTime / duration) * 100;
            // Solo actualiza estado; el dispatch lo maneja onAudioEnded
            if (audio.ended && !ended) {
                ended = true;
                playing = false;
            }
        }
    }

    /** Llamado por el evento nativo 'ended' del <audio> — más fiable que pollear en timeupdate */
    function onAudioEnded() {
        ended = true;
        playing = false;
        dispatch("ended");
    }

    /** Si el archivo no puede cargarse, muestra error sin avanzar de fase */
    let errorCarga = false;
    function onAudioError() {
        errorCarga = true;
        playing = false;
        console.error("AudioPlayer: no se pudo cargar el audio:", audio?.src);
    }

    function togglePlay() {
        if (!audio) return;
        if (ended) {
            audio.currentTime = 0;
            ended = false;
        }
        if (audio.paused) {
            audio.play();
            playing = true;
        } else {
            audio.pause();
            playing = false;
        }
    }

    function handleSeeking() {
        if (audio && !ended) {
            audio.currentTime = currentTime;
        }
    }

    onDestroy(() => {
        if (audio) {
            audio.pause();
            audio.src = "";
        }
        velocidadActual = 1;
    });
</script>

<div class="audio-player">
    <!-- Indicador de estado -->
    <p class="instruccion">
        {#if ended}
            ✅ Historia completada
        {:else}
            🎧 Escucha la historia completa para continuar con la experiencia
        {/if}
    </p>

    <!-- Visualizador de onda sonora -->
    <div class="wave-container" aria-hidden="true">
        {#each [1, 2, 3, 4, 5, 6, 7] as i}
            <span class="wave-bar" class:active={playing} style="--i:{i}"
            ></span>
        {/each}
    </div>

    <!-- Botón play principal con texto descriptivo -->
    <button
        class="play-btn"
        class:playing
        on:click={togglePlay}
        aria-label={playing ? "Pausar audio" : "Reproducir audio"}
    >
        <span class="play-btn-inner">
            {#if playing}
                <svg
                    class="play-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <rect x="6" y="5" width="4" height="14" rx="1.5" />
                    <rect x="14" y="5" width="4" height="14" rx="1.5" />
                </svg>
            {:else}
                <svg
                    class="play-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
            {/if}
            <span class="play-label"
                >{playing ? "Pausar" : ended ? "Repetir" : "Reproducir"}</span
            >
        </span>
    </button>

    <!-- Barra de progreso -->
    <div
        class="progress-track"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso del audio"
    >
        <div class="progress-fill" style="width: {progress}%"></div>
    </div>

    <!-- Tiempo + chips de velocidad -->
    <div class="time-speed-row">
        <div class="time-display">
            <span class="time-current">{formatTime(currentTime)}</span>
            <span class="time-sep">/</span>
            <span class="time-total">{formatTime(duration || duracion)}</span>
        </div>

        <div
            role="group"
            aria-label="Velocidad de reproducción"
            class="speed-group"
        >
            {#each velocidades as v}
                <button
                    class="speed-chip"
                    class:activo={velocidadActual === v}
                    on:click={() => setVelocidad(v)}
                    aria-pressed={velocidadActual === v}
                    aria-label="{v}x velocidad"
                    >{v === 1 ? "1×" : `${v}×`}</button
                >
            {/each}
        </div>
    </div>

    <!-- Elemento de audio oculto -->
    <audio
        bind:this={audio}
        src={audioURL}
        on:timeupdate={onTimeUpdate}
        on:ended={onAudioEnded}
        on:error={onAudioError}
        on:loadedmetadata={() => (duration = audio.duration || duracion)}
        on:seeking={handleSeeking}
        controls={false}
        preload="auto"
    ></audio>

    {#if errorCarga}
        <p class="error-carga">
            ⚠️ No se pudo cargar el audio. Verifica tu conexión.
        </p>
    {/if}
</div>

<style>
    /* ─── Contenedor ─────────────────────────────────────────────── */
    .audio-player {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        margin: 0 auto;
        padding: 28px 24px;
        background: var(--bg-card, #1e1008);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.25));
        border-radius: 24px;
        max-width: 320px;
        width: 100%;
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(212, 160, 23, 0.06) inset;
    }

    /* ─── Instrucción ────────────────────────────────────────────── */
    .instruccion {
        font-size: 0.82rem;
        color: var(--text-muted, #a08060);
        text-align: center;
        line-height: 1.45;
        margin: 0;
        letter-spacing: 0.01em;
    }

    /* ─── Onda sonora ────────────────────────────────────────────── */
    .wave-container {
        display: flex;
        align-items: center;
        gap: 4px;
        height: 40px;
    }
    .wave-bar {
        width: 4px;
        height: 8px;
        background: var(--gold-mid, #d4a017);
        border-radius: 2px;
        opacity: 0.3;
        transition:
            height 0.15s ease,
            opacity 0.15s ease;
    }
    .wave-bar.active {
        opacity: 1;
        animation: onda 1.1s ease-in-out infinite;
        animation-delay: calc(var(--i) * 0.11s);
    }
    @keyframes onda {
        0%,
        100% {
            height: 6px;
            opacity: 0.6;
        }
        50% {
            height: 32px;
            opacity: 1;
        }
    }

    /* ─── Botón Play principal ───────────────────────────────────── */
    .play-btn {
        border: none;
        background: linear-gradient(
            135deg,
            var(--gold-mid, #d4a017),
            var(--gold-bright, #f2c94c)
        );
        color: #12090a;
        border-radius: 9999px;
        padding: 0 28px;
        height: 56px;
        cursor: pointer;
        transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow:
            0 4px 18px rgba(212, 160, 23, 0.45),
            0 0 0 0 rgba(212, 160, 23, 0);
        flex-shrink: 0;
        min-width: 160px;
    }
    .play-btn:hover {
        transform: translateY(-2px) scale(1.03);
        box-shadow:
            0 8px 28px rgba(212, 160, 23, 0.6),
            0 0 0 6px rgba(212, 160, 23, 0.12);
    }
    .play-btn:active {
        transform: scale(0.97);
    }
    .play-btn.playing {
        animation: latido 2.2s ease-in-out infinite;
    }
    @keyframes latido {
        0%,
        100% {
            box-shadow:
                0 4px 18px rgba(212, 160, 23, 0.45),
                0 0 0 0 rgba(212, 160, 23, 0.2);
        }
        50% {
            box-shadow:
                0 4px 18px rgba(212, 160, 23, 0.45),
                0 0 0 10px rgba(212, 160, 23, 0);
        }
    }

    .play-btn-inner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: "Inter", sans-serif;
        font-weight: 700;
        font-size: 0.95rem;
        letter-spacing: 0.01em;
        pointer-events: none;
    }
    .play-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    }
    .play-label {
        line-height: 1;
    }

    /* ─── Barra de progreso ──────────────────────────────────────── */
    .progress-track {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.07);
        border-radius: 3px;
        overflow: hidden;
    }
    .progress-fill {
        height: 100%;
        background: linear-gradient(
            90deg,
            var(--gold-dark, #8b6914),
            var(--gold-bright, #f2c94c)
        );
        border-radius: 3px;
        transition: width 0.4s linear;
        box-shadow: 0 0 8px rgba(242, 201, 76, 0.45);
    }

    /* ─── Tiempo + velocidad ─────────────────────────────────────── */
    .time-speed-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 8px;
    }
    .time-display {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 0.82rem;
        font-variant-numeric: tabular-nums;
        font-weight: 500;
        flex-shrink: 0;
    }
    .time-current {
        color: var(--gold-bright, #f2c94c);
    }
    .time-sep {
        color: var(--text-dim, #6b5040);
    }
    .time-total {
        color: var(--text-muted, #a08060);
    }

    /* ─── Grupo de velocidad ─────────────────────────────────── */
    .speed-group {
        display: flex;
        gap: 4px;
        align-items: center;
    }
    .speed-chip {
        padding: 3px 8px;
        border-radius: 999px;
        border: 1px solid rgba(212, 160, 23, 0.2);
        background: transparent;
        color: var(--text-dim, #6b5040);
        font-family: "Inter", sans-serif;
        font-size: 0.68rem;
        font-weight: 700;
        cursor: pointer;
        line-height: 1.5;
        transition: all 0.15s;
    }
    .speed-chip:hover:not(.activo) {
        border-color: rgba(212, 160, 23, 0.45);
        color: var(--text-muted, #a08060);
    }
    .speed-chip.activo {
        background: rgba(212, 160, 23, 0.18);
        border-color: var(--gold-mid, #d4a017);
        color: var(--gold-bright, #f2c94c);
    }

    /* ─── Error de carga ─────────────────────────────────────── */
    .error-carga {
        font-size: 0.78rem;
        color: #e07b39;
        text-align: center;
        margin: 0;
        padding: 8px 12px;
        background: rgba(224, 123, 57, 0.08);
        border: 1px solid rgba(224, 123, 57, 0.25);
        border-radius: 8px;
        width: 100%;
    }

    /* ─── Pantallas de baja altura ───────────────────────────────── */
    @media (max-height: 600px) {
        .audio-player {
            gap: 12px;
            padding: 18px 20px;
        }
        .play-btn {
            height: 46px;
            min-width: 130px;
            padding: 0 20px;
        }
        .play-btn-inner {
            font-size: 0.85rem;
        }
        .play-icon {
            width: 16px;
            height: 16px;
        }
        .wave-container {
            height: 26px;
        }
        .instruccion {
            font-size: 0.74rem;
        }
        .time-display {
            font-size: 0.74rem;
        }
    }
</style>
