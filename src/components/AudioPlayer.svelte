<script lang="ts">
    import { onDestroy } from "svelte";
    import { createEventDispatcher } from "svelte";

    export let audioURL: string;
    export let duracion: number = 0;
    /** Permite cerrar el reproductor (por ejemplo si ya tiene el sello o ya lo escuchó) */
    export let permitirCerrar: boolean = false;

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
            if (audio.ended && !ended) {
                ended = true;
                playing = false;
            }
        }
    }

    /** Llamado por el evento nativo 'ended' del <audio> */
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

    function cerrar() {
        if (audio) {
            audio.pause();
            playing = false;
        }
        dispatch("cerrar");
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
    {#if permitirCerrar || ended}
        <button
            class="btn-cerrar"
            on:click={cerrar}
            aria-label="Cerrar reproductor"
        >✕</button>
    {/if}

    <!-- Píldora de estado gamificada -->
    <div class="instruccion-pill" class:completado={ended}>
        {#if ended}
            <span class="pill-icono">✅</span>
            <span class="pill-texto">Historia completada</span>
        {:else}
            <span class="pill-icono">🎧</span>
            <span class="pill-texto">Escucha para desbloquear la trivia</span>
        {/if}
    </div>

    <!-- Visualizador de onda sonora -->
    <div class="wave-container" aria-hidden="true">
        {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as i}
            <span class="wave-bar" class:active={playing} style="--i:{i}"></span>
        {/each}
    </div>

    <!-- Botón play principal -->
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

    <!-- Barra de progreso + Tiempos + Velocidades -->
    <div class="controls-bottom">
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
    /* ─── Contenedor Flexbox Responsivo ──────────────────────────── */
    .audio-player {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin: 0 auto;
        padding: 20px 18px 16px;
        background: linear-gradient(160deg, #1e1008 0%, #2a1a0a 100%);
        border: 1px solid rgba(212, 160, 23, 0.35);
        border-radius: 22px;
        max-width: min(92vw, 340px);
        width: 100%;
        max-height: min(85dvh, 360px);
        box-sizing: border-box;
        box-shadow:
            0 12px 36px rgba(0, 0, 0, 0.6),
            0 0 30px rgba(212, 160, 23, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    /* ─── Botón Cerrar ───────────────────────────────────────────── */
    .btn-cerrar {
        position: absolute;
        top: 10px;
        right: 12px;
        background: transparent;
        border: none;
        color: var(--text-muted, #a08060);
        font-size: 0.95rem;
        cursor: pointer;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.15s;
        z-index: 3;
    }
    .btn-cerrar:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-primary, #f5e6c8);
    }

    /* ─── Píldora de Instrucción ─────────────────────────────────── */
    .instruccion-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 9999px;
        background: rgba(212, 160, 23, 0.08);
        border: 1px solid rgba(212, 160, 23, 0.22);
        color: var(--gold-bright, #f2c94c);
        font-size: 0.74rem;
        font-weight: 600;
        letter-spacing: 0.2px;
        text-align: center;
        flex-shrink: 0;
    }
    .instruccion-pill.completado {
        background: rgba(76, 175, 130, 0.12);
        border-color: rgba(76, 175, 130, 0.35);
        color: #4caf82;
    }
    .pill-icono {
        font-size: 0.8rem;
    }
    .pill-texto {
        line-height: 1.2;
    }

    /* ─── Onda sonora compacta ───────────────────────────────────── */
    .wave-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        height: 28px;
        flex-shrink: 0;
    }
    .wave-bar {
        width: 3.5px;
        height: 6px;
        background: linear-gradient(180deg, var(--gold-bright, #f2c94c), var(--gold-mid, #d4a017));
        border-radius: 2px;
        opacity: 0.35;
        transition:
            height 0.15s ease,
            opacity 0.15s ease;
    }
    .wave-bar.active {
        opacity: 1;
        animation: onda 1.1s ease-in-out infinite;
        animation-delay: calc(var(--i) * 0.09s);
    }
    @keyframes onda {
        0%,
        100% {
            height: 6px;
            opacity: 0.5;
        }
        50% {
            height: 26px;
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
        padding: 0 24px;
        height: 48px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow:
            0 4px 16px rgba(212, 160, 23, 0.4),
            0 0 0 0 rgba(212, 160, 23, 0);
        flex-shrink: 0;
        min-width: 145px;
    }
    .play-btn:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow:
            0 6px 22px rgba(212, 160, 23, 0.55),
            0 0 0 5px rgba(212, 160, 23, 0.12);
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
                0 4px 16px rgba(212, 160, 23, 0.4),
                0 0 0 0 rgba(212, 160, 23, 0.2);
        }
        50% {
            box-shadow:
                0 4px 16px rgba(212, 160, 23, 0.4),
                0 0 0 8px rgba(212, 160, 23, 0);
        }
    }

    .play-btn-inner {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        font-family: "Inter", sans-serif;
        font-weight: 700;
        font-size: 0.9rem;
        letter-spacing: 0.01em;
        pointer-events: none;
    }
    .play-icon {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
    }
    .play-label {
        line-height: 1;
    }

    /* ─── Controles inferiores ───────────────────────────────────── */
    .controls-bottom {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        flex-shrink: 0;
    }

    /* ─── Barra de progreso ──────────────────────────────────────── */
    .progress-track {
        width: 100%;
        height: 5px;
        background: rgba(255, 255, 255, 0.08);
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
        transition: width 0.3s linear;
        box-shadow: 0 0 8px rgba(242, 201, 76, 0.45);
    }

    /* ─── Tiempo + velocidad ─────────────────────────────────────── */
    .time-speed-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 6px;
    }
    .time-display {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 0.76rem;
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

    /* ─── Grupo de velocidad ─────────────────────────────────────── */
    .speed-group {
        display: flex;
        gap: 3px;
        align-items: center;
    }
    .speed-chip {
        padding: 2px 7px;
        border-radius: 999px;
        border: 1px solid rgba(212, 160, 23, 0.2);
        background: transparent;
        color: var(--text-dim, #6b5040);
        font-family: "Inter", sans-serif;
        font-size: 0.66rem;
        font-weight: 700;
        cursor: pointer;
        line-height: 1.4;
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

    /* ─── Error de carga ─────────────────────────────────────────── */
    .error-carga {
        font-size: 0.74rem;
        color: #e07b39;
        text-align: center;
        margin: 0;
        padding: 6px 10px;
        background: rgba(224, 123, 57, 0.08);
        border: 1px solid rgba(224, 123, 57, 0.25);
        border-radius: 8px;
        width: 100%;
        box-sizing: border-box;
    }
</style>
