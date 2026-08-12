<script lang="ts">
    import { onDestroy } from "svelte";

    export let audioURL: string;
    export let duracion: number = 0;

    let audio: HTMLAudioElement;
    let progress = 0;
    let currentTime = 0;
    let duration = 0;
    let playing = false;
    let ended = false;

    let bloqueado = false;

    // Eventos del audio
    function onTimeUpdate() {
        if (audio) {
            currentTime = audio.currentTime;
            duration = audio.duration || duracion;
            progress = (currentTime / duration) * 100;
            if (audio.ended) {
                console.log("[Audio] Terminó, disparando ended");
                ended = true;
                playing = false;
                dispatch("ended");
            }
        }
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

    // Prevenir que el usuario adelante manualmente
    function bloquearSeek(e: Event) {
        const target = e.target as HTMLAudioElement;
        if (bloqueado) return;
        // Solo permitimos que currentTime cambie si fue por nuestra acción (togglePlay al inicio)
        // En la práctica, deshabilitamos los controles nativos y la barra no es interactiva.
        // Si intentan modificar currentTime por consola, lo forzamos aquí.
        if (Math.abs(target.currentTime - currentTime) > 0.1) {
            target.currentTime = currentTime;
        }
    }

    // Llamado desde el evento 'seeking' para impedir saltos
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
    });

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
</script>

<div class="audio-player">
    <button class="play-btn" on:click={togglePlay}>
        {playing ? "⏸️ Pausar" : "▶️ Escuchar historia"}
    </button>

    <div class="progress-bar-container">
        <div class="progress-bar" style="width: {progress}%"></div>
    </div>

    <div class="time">
        {Math.floor(currentTime)}s / {Math.floor(duration)}s
    </div>

    <!-- Elemento de audio oculto, sin controles nativos -->
    <audio
        bind:this={audio}
        src={audioURL}
        on:timeupdate={onTimeUpdate}
        on:loadedmetadata={() => (duration = audio.duration || duracion)}
        on:seeking={handleSeeking}
        controls={false}
        preload="auto"
    ></audio>
</div>

<style>
    .audio-player {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        width: 100%;
        max-width: 300px;
        margin: 20px auto;
    }
    .play-btn {
        background: #8b5a2b;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 30px;
        font-size: 1.2rem;
        cursor: pointer;
    }
    .progress-bar-container {
        width: 100%;
        height: 8px;
        background: #ddd;
        border-radius: 4px;
        overflow: hidden;
    }
    .progress-bar {
        height: 100%;
        background: #8b5a2b;
        width: 0%;
        transition: width 0.1s linear;
    }
    .time {
        font-size: 0.9rem;
        color: #555;
    }
</style>
