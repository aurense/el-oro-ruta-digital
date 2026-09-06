<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from "svelte";

    export let visible: boolean = false;
    export let aliadoId: string = "";
    export let aliadoNombre: string = "";

    const dispatch = createEventDispatcher();

    let videoElement: HTMLVideoElement | null = null;
    let stream: MediaStream | null = null;
    let escaneando = false;
    let errorCamara = "";
    let tieneBarcodeDetector = false;
    let animId: number | null = null;

    $: if (visible) {
        iniciarCamara();
    } else {
        detenerCamara();
    }

    async function iniciarCamara() {
        errorCamara = "";
        escaneando = true;

        if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
            errorCamara = "Tu navegador no permite el acceso directo a la cámara. Usa la cámara de tu teléfono.";
            return;
        }

        tieneBarcodeDetector = "BarcodeDetector" in window;

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            if (videoElement) {
                videoElement.srcObject = stream;
                await videoElement.play();
                if (tieneBarcodeDetector) {
                    comenzarDeteccion();
                }
            }
        } catch (err) {
            console.warn("[QRScanner] Error accediendo a cámara:", err);
            errorCamara = "No se pudo acceder a la cámara. Revisa los permisos de tu navegador o escanea el QR físico con la app de cámara de tu celular.";
        }
    }

    function comenzarDeteccion() {
        if (!tieneBarcodeDetector || !videoElement) return;

        try {
            // @ts-ignore - BarcodeDetector API nativa
            const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

            const scanFrame = async () => {
                if (!escaneando || !videoElement) return;

                if (videoElement.readyState >= 2) {
                    try {
                        const barcodes = await detector.detect(videoElement);
                        if (barcodes && barcodes.length > 0) {
                            const rawValue = barcodes[0].rawValue || "";
                            if (rawValue) {
                                onCodigoDetectado(rawValue);
                                return;
                            }
                        }
                    } catch (e) {
                        // Error de lectura en frame individual, continuar bucle
                    }
                }
                animId = requestAnimationFrame(scanFrame);
            };

            animId = requestAnimationFrame(scanFrame);
        } catch (e) {
            console.warn("BarcodeDetector error:", e);
        }
    }

    function onCodigoDetectado(codigo: string) {
        detenerCamara();
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate([60, 40, 60]);
        }
        dispatch("scan", { codigo });
    }

    function forzarCanjeDirecto() {
        detenerCamara();
        dispatch("scan", { codigo: `simulado:${aliadoId}` });
    }

    function detenerCamara() {
        escaneando = false;
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            stream = null;
        }
        if (videoElement) {
            videoElement.srcObject = null;
        }
    }

    function cerrar() {
        detenerCamara();
        dispatch("close");
    }

    onDestroy(() => {
        detenerCamara();
    });
</script>

{#if visible}
    <div class="scanner-overlay" role="dialog" aria-modal="true" aria-label="Escáner QR de cortesía">
        <div class="scanner-container">
            <!-- Header con botón de cerrar -->
            <div class="scanner-header">
                <div class="header-titulos">
                    <span class="scanner-tag">📷 Mostrador de {aliadoNombre}</span>
                    <h3 class="scanner-titulo">Escanear QR de Caja</h3>
                </div>
                <button class="btn-cerrar" on:click={cerrar} aria-label="Cerrar escáner">✕</button>
            </div>

            <!-- Visor de la cámara -->
            <div class="visor-wrap">
                <video
                    bind:this={videoElement}
                    autoplay
                    playsinline
                    muted
                    class="video-feed"
                ></video>

                <!-- Encuadre visual con esquinas doradas -->
                <div class="encuadre-scanner">
                    <div class="esquina tl"></div>
                    <div class="esquina tr"></div>
                    <div class="esquina bl"></div>
                    <div class="esquina br"></div>
                    <div class="laser-scanner"></div>
                </div>

                {#if errorCamara}
                    <div class="error-aviso">
                        <span class="error-icono">📷⚠️</span>
                        <p class="error-texto">{errorCamara}</p>
                        <button class="btn-forzar-canje" on:click={forzarCanjeDirecto}>
                            ✨ Validar cortesía en mostrador
                        </button>
                    </div>
                {/if}
            </div>

            <!-- Instrucciones -->
            <div class="scanner-footer">
                <p class="instruccion">
                    Apunta tu cámara al <strong>código QR oficial</strong> ubicado en el mostrador o acrílico de caja para validar tu beneficio en vivo.
                </p>
                {#if !tieneBarcodeDetector && !errorCamara}
                    <button class="btn-forzar-canje" on:click={forzarCanjeDirecto}>
                        ✨ Confirmar presencia en caja
                    </button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .scanner-overlay {
        position: fixed;
        inset: 0;
        background: rgba(10, 5, 4, 0.92);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        box-sizing: border-box;
        animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .scanner-container {
        background: #190B05;
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.35));
        border-radius: 20px;
        width: 100%;
        max-width: 420px;
        overflow: hidden;
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8), 0 0 24px rgba(212, 160, 23, 0.15);
        display: flex;
        flex-direction: column;
    }

    .scanner-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 18px;
        border-bottom: 1px solid rgba(212, 160, 23, 0.15);
    }
    .header-titulos {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }
    .scanner-tag {
        font-size: 0.72rem;
        color: var(--gold-bright, #F2C94C);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .scanner-titulo {
        font-family: 'Cinzel', serif;
        font-size: 1.15rem;
        color: var(--text-primary, #F5E6C8);
        margin: 0;
    }
    .btn-cerrar {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(212, 160, 23, 0.25);
        color: var(--text-primary, #F5E6C8);
        width: 34px;
        height: 34px;
        border-radius: 50%;
        font-size: 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    .btn-cerrar:hover {
        background: rgba(212, 160, 23, 0.25);
        transform: scale(1.08);
    }

    /* Visor de cámara */
    .visor-wrap {
        position: relative;
        width: 100%;
        height: 280px;
        background: #0D0402;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .video-feed {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    /* Encuadre de escaneo */
    .encuadre-scanner {
        position: absolute;
        width: 200px;
        height: 200px;
        pointer-events: none;
    }
    .esquina {
        position: absolute;
        width: 24px;
        height: 24px;
        border-color: var(--gold-bright, #F2C94C);
        border-style: solid;
        filter: drop-shadow(0 0 6px rgba(242, 201, 76, 0.8));
    }
    .esquina.tl { top: 0; left: 0; border-width: 3px 0 0 3px; border-top-left-radius: 8px; }
    .esquina.tr { top: 0; right: 0; border-width: 3px 3px 0 0; border-top-right-radius: 8px; }
    .esquina.bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; border-bottom-left-radius: 8px; }
    .esquina.br { bottom: 0; right: 0; border-width: 0 3px 3px 0; border-bottom-right-radius: 8px; }

    /* Láser animado */
    .laser-scanner {
        position: absolute;
        left: 10px;
        right: 10px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #F2C94C, transparent);
        box-shadow: 0 0 10px #F2C94C;
        animation: scanAnim 2s infinite alternate ease-in-out;
    }
    @keyframes scanAnim {
        0% { top: 15px; opacity: 0.2; }
        50% { opacity: 1; }
        100% { top: 185px; opacity: 0.2; }
    }

    /* Error de cámara */
    .error-aviso {
        position: absolute;
        inset: 0;
        background: rgba(18, 9, 7, 0.94);
        padding: 24px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 12px;
        box-sizing: border-box;
    }
    .error-icono { font-size: 2rem; }
    .error-texto {
        font-size: 0.84rem;
        color: var(--text-muted, #A08060);
        margin: 0;
        line-height: 1.4;
    }

    /* Footer */
    .scanner-footer {
        padding: 16px 18px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #140803;
    }
    .instruccion {
        font-size: 0.8rem;
        color: var(--text-muted, #A08060);
        text-align: center;
        margin: 0;
        line-height: 1.4;
    }
    .btn-forzar-canje {
        padding: 11px 16px;
        background: linear-gradient(135deg, #F2C94C 0%, #D4A017 100%);
        border: none;
        border-radius: 12px;
        color: #1A0D00;
        font-family: 'Cinzel', serif;
        font-weight: 700;
        font-size: 0.86rem;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(212, 160, 23, 0.35);
        transition: transform 0.2s;
    }
    .btn-forzar-canje:hover {
        transform: translateY(-1px);
    }
</style>
