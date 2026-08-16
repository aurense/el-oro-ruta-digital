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
            🎧 Escucha la historia completa para continuar
        {/if}
    </p>

    <!-- Visualizador de onda sonora -->
    <div class="wave-container" aria-hidden="true">
        {#each [1, 2, 3, 4, 5] as i}
            <span class="wave-bar" class:active={playing} style="--i:{i}"></span>
        {/each}
    </div>

    <!-- Botón play circular -->
    <button
        class="play-btn"
        class:playing
        on:click={togglePlay}
        aria-label={playing ? "Pausar narración" : "Reproducir narración"}
    >
        {#if playing}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1"/>
                <rect x="14" y="5" width="4" height="14" rx="1"/>
            </svg>
        {:else}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v14l11-7-11-7z"/>
            </svg>
        {/if}
    </button>

    <!-- Barra de progreso -->
    <div class="progress-track">
        <div class="progress-fill" style="width: {progress}%"></div>
    </div>

    <!-- Tiempo + Velocidad en una sola fila -->
    <div class="time-speed-row">
        <div class="time-display">
            <span class="time-current">{formatTime(currentTime)}</span>
            <span class="time-sep">/</span>
            <span class="time-total">{formatTime(duration || duracion)}</span>
        </div>

        <div
            role="group"
            aria-label="Velocidad de reproducción"
            style="display:flex; gap:5px; align-items:center;"
        >
            {#each velocidades as v}
                <button
                    on:click={() => setVelocidad(v)}
                    aria-pressed={velocidadActual === v}
                    aria-label="{v}x velocidad"
                    style="
                        padding: 3px 8px;
                        border-radius: 999px;
                        border: 1px solid {velocidadActual === v ? '#D4A017' : 'rgba(212,160,23,0.2)'};
                        background: {velocidadActual === v ? 'rgba(212,160,23,0.18)' : 'transparent'};
                        color: {velocidadActual === v ? '#F2C94C' : '#7A6040'};
                        font-size: 0.68rem;
                        font-weight: 700;
                        cursor: pointer;
                        line-height: 1.4;
                        font-family: Inter, sans-serif;
                        transition: all 0.15s;
                    "
                >{v === 1 ? '1×' : `${v}×`}</button>
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
        <p class="error-carga">⚠️ No se pudo cargar el audio. Verifica tu conexión.</p>
    {/if}
</div>

<style>
    .audio-player {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        margin: 20px auto;
        padding: 24px 20px;
        background: var(--bg-card, #1E1008);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.25));
        border-radius: 20px;
        max-width: 340px;
        width: 100%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }

    /* ─── Instrucción ────────────────────────────────────────────── */
    .instruccion {
        font-size: 0.8rem;
        color: var(--text-muted, #A08060);
        text-align: center;
        line-height: 1.4;
        margin: 0;
    }

    /* ─── Onda sonora ────────────────────────────────────────────── */
    .wave-container {
        display: flex;
        align-items: center;
        gap: 5px;
        height: 36px;
    }
    .wave-bar {
        width: 4px;
        height: 8px;
        background: var(--gold-mid, #D4A017);
        border-radius: 2px;
        transition: height 0.15s ease;
        opacity: 0.4;
    }
    .wave-bar.active {
        opacity: 1;
        animation: onda 1.1s ease-in-out infinite;
        animation-delay: calc(var(--i) * 0.12s);
    }
    @keyframes onda {
        0%, 100% { height: 8px;  opacity: 0.7; }
        50%       { height: 30px; opacity: 1;   }
    }

    /* ─── Botón Play ─────────────────────────────────────────────── */
    .play-btn {
        width: 68px;
        height: 68px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, var(--gold-mid, #D4A017), var(--gold-bright, #F2C94C));
        color: #12090A;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow:
            0 4px 20px rgba(212, 160, 23, 0.45),
            0 0 0 0 rgba(212, 160, 23, 0);
        flex-shrink: 0;
    }
    .play-btn:hover {
        transform: scale(1.08);
        box-shadow:
            0 6px 28px rgba(212, 160, 23, 0.6),
            0 0 0 6px rgba(212, 160, 23, 0.1);
    }
    .play-btn:active { transform: scale(0.96); }
    .play-btn.playing {
        animation: latido 2s ease-in-out infinite;
    }
    @keyframes latido {
        0%, 100% { box-shadow: 0 4px 20px rgba(212, 160, 23, 0.45), 0 0 0 0   rgba(212, 160, 23, 0.2); }
        50%       { box-shadow: 0 4px 20px rgba(212, 160, 23, 0.45), 0 0 0 10px rgba(212, 160, 23, 0);   }
    }

    /* ─── Barra de progreso ──────────────────────────────────────── */
    .progress-track {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 3px;
        overflow: hidden;
    }
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--gold-dark, #8B6914), var(--gold-bright, #F2C94C));
        border-radius: 3px;
        transition: width 0.4s linear;
        box-shadow: 0 0 8px rgba(242, 201, 76, 0.5);
    }

    /* ─── Tiempo + fila de velocidad ────────────────────────────── */
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
        gap: 4px;
        font-size: 0.82rem;
        font-variant-numeric: tabular-nums;
        font-weight: 500;
        flex-shrink: 0;
    }
    .time-current { color: var(--gold-bright, #F2C94C); }
    .time-sep     { color: var(--text-dim, #6B5040); }
    .time-total   { color: var(--text-muted, #A08060); }

    /* ─── Chips de velocidad ──────────────────────────────── */
    .speed-chips {
        display: flex;
        gap: 6px;
        align-items: center;
    }
    .speed-chip {
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid rgba(212, 160, 23, 0.2);
        background: transparent;
        color: var(--text-dim, #6B5040);
        font-family: 'Inter', sans-serif;
        font-size: 0.72rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s;
        line-height: 1;
    }
    .speed-chip:hover:not(.activo) {
        border-color: rgba(212, 160, 23, 0.5);
        color: var(--text-muted, #A08060);
        background: rgba(212, 160, 23, 0.06);
    }
    .speed-chip.activo {
        background: rgba(212, 160, 23, 0.15);
        border-color: var(--gold-mid, #D4A017);
        color: var(--gold-bright, #F2C94C);
        box-shadow: 0 0 8px rgba(212, 160, 23, 0.2);
    }

    /* ─── Error de carga ─────────────────────────────────────── */
    .error-carga {
        font-size: 0.78rem;
        color: #E07B39;
        text-align: center;
        margin: 0;
        padding: 8px 12px;
        background: rgba(224, 123, 57, 0.08);
        border: 1px solid rgba(224, 123, 57, 0.25);
        border-radius: 8px;
        width: 100%;
    }
</style>
