<script lang="ts">
    import { onMount } from "svelte";
    import AudioPlayer from "./AudioPlayer.svelte";
    import Trivia from "./Trivia.svelte";
    import DataForm from "./DataForm.svelte";
    import VoucherCard from "./VoucherCard.svelte";
    import { aliados } from "../data/aliados";
    import { userStore, obtenerPasoPendientePerfil } from "../stores/user";
    import type { DatosPerfil } from "../stores/user";
    import {
        guardarDatosUsuario,
        guardarVisita,
        guardarSello,
        registrarAudioEscuchado,
        registrarResultadoTrivia,
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
        voucherAliadoId?: string;
    };
    export let origen: string = "desconocido";

    // Aliado cuyo voucher se entrega al desbloquear este sello
    $: aliadoVoucher = punto.voucherAliadoId
        ? (aliados.find((a) => a.id === punto.voucherAliadoId) ?? null)
        : null;

    // Determinar fase inicial síncrona sin parpadeos
    const yaObtenidoInicial = Boolean(
        $userStore.sellos?.some((s) => s.puntoId === punto.id),
    );
    let fase: "audio" | "trivia" | "triviaRevisit" | "selloGanado" | "fallida" =
        yaObtenidoInicial ? "selloGanado" : "audio";
    let mostrarDataForm = false;
    let pasoDataForm: 1 | 2 | 3 = 1;
    let datosPerfilGuardados = false;
    let perfilLocal = $userStore.perfil;
    let selloRecienGanado = false;
    let faseInicializada = yaObtenidoInicial;
    let intentosTriviaUsados = 1;
    let monedasGanadasEstaPartida = 40;
    // Variable para controlar la visibilidad de la zona principal (transición fade)
    let zonaVisible = true;

    let confettiPiezas: {
        x: number;
        color: string;
        delay: number;
        duration: number;
        size: number;
    }[] = [];

    $: uid = $userStore.uid;
    $: perfil = $userStore.perfil;
    $: sellos = $userStore.sellos;
    $: yaTieneSello = Boolean(sellos.some((s) => s.puntoId === punto.id));

    // Si al actualizarse el store en tiempo real el usuario ya tiene el sello y no se había inicializado
    $: if (yaTieneSello && !faseInicializada && fase === "audio") {
        fase = "selloGanado";
        faseInicializada = true;
    }

    onMount(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const origenUrl = params.get("origen");
            if (origenUrl) {
                origen = origenUrl;
            }
        }
    });

    /** Cambia de fase con una transición GPU ultrarrápida */
    async function cambiarFase(
        nuevaFase:
            | "audio"
            | "trivia"
            | "triviaRevisit"
            | "selloGanado"
            | "fallida",
    ) {
        zonaVisible = false;
        await new Promise((r) => setTimeout(r, 120));
        fase = nuevaFase;
        zonaVisible = true;
    }

    function onAudioEnded() {
        if (uid) {
            registrarAudioEscuchado(uid, punto.id, origen);
        }
        cambiarFase(yaTieneSello ? "triviaRevisit" : "trivia");
        if ("vibrate" in navigator) {
            navigator.vibrate([80, 40, 80, 40, 200]);
        }
    }

    function onCerrarAudio() {
        if (yaTieneSello) {
            cambiarFase("selloGanado");
        } else {
            irAlPasaporte();
        }
    }

    function onTriviaSuccess(
        event?: CustomEvent<{
            vidasRestantes?: number;
            intentosUsados?: number;
            monedasGanadas?: number;
        }>,
    ) {
        const vidas = event?.detail?.vidasRestantes ?? 3;
        intentosTriviaUsados = event?.detail?.intentosUsados ?? 4 - vidas;
        monedasGanadasEstaPartida = event?.detail?.monedasGanadas ?? Math.max(10, vidas * 10);
        if (uid) {
            registrarResultadoTrivia(uid, punto.id, true, vidas, origen);
        }
        if (yaTieneSello) {
            cambiarFase("selloGanado");
            return;
        }

        const pasoPendiente = obtenerPasoPendientePerfil($userStore.perfil);
        if (pasoPendiente !== null) {
            pasoDataForm = pasoPendiente;
            mostrarDataForm = true;
        } else {
            guardarSelloLocal();
        }
    }

    function onTriviaFailed(
        event?: CustomEvent<{
            vidasRestantes?: number;
            intentosUsados?: number;
        }>,
    ) {
        if (uid) {
            registrarResultadoTrivia(uid, punto.id, false, 0, origen);
        }
        cambiarFase("fallida");
    }

    async function onPerfilGuardado(
        event: CustomEvent<{
            paso: 1 | 2 | 3;
            datos: any;
        }>,
    ) {
        const { paso, datos } = event.detail;
        try {
            const perfilActual: DatosPerfil = $userStore.perfil || {
                nombre: "",
                pais: "México",
                estado: "",
            };
            const nuevoPerfil: DatosPerfil = {
                ...perfilActual,
                ...datos,
                actualizadoEn: new Date().toISOString(),
            };

            if (uid) {
                guardarDatosUsuario(uid, { perfil: nuevoPerfil }).catch((e) =>
                    console.warn("Sync error perfil:", e),
                );
            }
            userStore.update((s) => ({ ...s, perfil: nuevoPerfil }));
            mostrarDataForm = false;
            datosPerfilGuardados = true;
            guardarSelloLocal();
        } catch (e) {
            alert("Error al guardar los datos. Intenta de nuevo.");
        }
    }

    async function guardarSelloLocal() {
        if (yaTieneSello) return;
        selloRecienGanado = true;

        // 1. Actualización optimista inmediata en userStore
        userStore.update((s) => ({
            ...s,
            monedas: (s.monedas || 0) + monedasGanadasEstaPartida,
            sellos: [
                ...s.sellos,
                {
                    puntoId: punto.id,
                    fecha: new Date(),
                    origen,
                    intentosUsados: intentosTriviaUsados,
                },
            ],
        }));

        // 2. Transición y celebración inmediata
        activarCelebracion();

        // 3. Sincronización en segundo plano con Firestore (fire-and-forget)
        if (uid) {
            guardarSello(uid, punto.id, origen, {
                intentosUsados: intentosTriviaUsados,
            }).catch((e) =>
                console.warn("Guardado de sello en background diferido:", e),
            );

            guardarVisita(uid, punto.id, origen, {
                selloObtenido: true,
                intentosTrivia: intentosTriviaUsados,
                audioEscuchado: true,
            }).catch((e) =>
                console.warn("Guardado de visita en background diferido:", e),
            );
        }
    }

    function activarCelebracion() {
        generarConfetti();
        cambiarFase("selloGanado");
        if ("vibrate" in navigator) {
            navigator.vibrate([80, 40, 80, 40, 200]);
        }
    }

    function generarConfetti() {
        const colores = [
            "#F2C94C",
            "#D4A017",
            "#E07B39",
            "#F5C87A",
            "#fff",
            "#FFC107",
            "#FF9800",
            "#FFEB3B",
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

    function verTrivia() {
        cambiarFase("triviaRevisit");
    }

    function escucharAudio() {
        cambiarFase("audio");
    }
</script>

<!-- Confetti animado (solo en celebración) -->
{#if fase === "selloGanado" && selloRecienGanado && confettiPiezas.length > 0}
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
{/if}

<div class="punto-page">
    <!-- ─── Header compacto ────────────────────────────────────────── -->
    <header class="punto-header">
        <a href="/" class="btn-volver" title="Volver al pasaporte">
            <svg
                class="btn-volver-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Pasaporte</span>
        </a>
        <div class="header-right">
            <span class="monedas-contador-header" title="Tus Monedas Áureas">
                🪙 {$userStore.monedas || 0}
            </span>
            <div class="punto-badges">
                {#if yaTieneSello}
                    <span class="badge-sello-obtenido">✓ Sello obtenido</span>
                {/if}
            </div>
        </div>
    </header>

    <!-- ─── Zona principal de fase ─────────────────────────────────── -->
    <main
        class="punto-main"
        class:zona-visible={zonaVisible}
        class:zona-oculta={!zonaVisible}
    >
        <!-- ─ Fase: AUDIO ─ -->
        {#if fase === "audio"}
            <div class="vista-fase">
                <!-- Miniatura compacta del lugar -->
                <div class="punto-mini-card">
                    <img
                        src={punto.imagenMiniatura}
                        alt={punto.nombre}
                        class="punto-img-mini"
                    />
                    <div class="punto-mini-info">
                        <h1 class="punto-nombre">{punto.nombre}</h1>
                        <p class="punto-desc">{punto.descripcionCorta}</p>
                    </div>
                </div>

                <!-- Reproductor de audio -->
                <AudioPlayer
                    audioURL={punto.audioURL}
                    duracion={punto.duracion}
                    puntoId={punto.id}
                    puntoNombre={punto.nombre}
                    permitirCerrar={yaTieneSello}
                    on:ended={onAudioEnded}
                    on:cerrar={onCerrarAudio}
                />
            </div>

            <!-- ─ Fase: TRIVIA (Desafío interactivo con Vidas) ─ -->
        {:else if fase === "trivia"}
            <div class="vista-fase">
                <Trivia
                    pregunta={punto.trivia.pregunta}
                    opciones={punto.trivia.opciones}
                    puntoId={punto.id}
                    on:success={onTriviaSuccess}
                    on:failed={onTriviaFailed}
                    on:cerrar={() => cambiarFase("audio")}
                />
            </div>

            <!-- ─ Fase: TRIVIA REVISIT (Modo Repaso) ─ -->
        {:else if fase === "triviaRevisit"}
            <div class="vista-fase">
                <Trivia
                    pregunta={punto.trivia.pregunta}
                    opciones={punto.trivia.opciones}
                    puntoId={punto.id}
                    modoRevisar={true}
                    on:success={onTriviaSuccess}
                    on:failed={onTriviaFailed}
                    on:cerrar={() => cambiarFase("selloGanado")}
                />
            </div>

            <!-- ─ Fase: SELLO GANADO (Celebración & Recompensa) ─ -->
        {:else if fase === "selloGanado"}
            <div class="vista-fase vista-sello">
                <div class="badge-wrapper">
                    <div class="aura" aria-hidden="true"></div>
                    <div class="aura aura--lenta" aria-hidden="true"></div>
                    <img
                        src={punto.insigniaURL}
                        alt="Sello de {punto.nombre}"
                        class="insignia-celebracion"
                    />
                </div>

                <p class="celebracion-etiqueta">
                    {selloRecienGanado ? "¡SELLO OBTENIDO!" : "SELLO OBTENIDO"}
                </p>
                <h2 class="celebracion-nombre">{punto.nombre}</h2>

                <!-- Píldora de Monedas Áureas Ganadas -->
                <div class="monedas-ganadas-badge">
                    <span class="monedas-ganadas-icon">🪙</span>
                    <span class="monedas-ganadas-txt">+{monedasGanadasEstaPartida} Monedas Áureas</span>
                </div>

                <p class="celebracion-contador">
                    {#if selloRecienGanado}
                        Tu pasaporte: <strong>{sellos.length}</strong> de
                        <strong>3</strong> sellos
                    {:else}
                        Ya has obtenido este sello en tu pasaporte.
                    {/if}
                </p>

                <!-- Voucher del aliado vinculado -->
                {#if aliadoVoucher && selloRecienGanado}
                    <VoucherCard aliado={aliadoVoucher} tipo="celebracion" />
                {/if}

                <div class="celebracion-acciones">
                    <button class="btn-gold" on:click={irAlPasaporte}>
                        <svg
                            class="btn-icono"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path
                                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                            />
                            <circle
                                cx="12"
                                cy="9.5"
                                r="2.5"
                                fill="currentColor"
                                fill-opacity="0.35"
                            />
                            <path d="M12 7.5v4" />
                            <path d="M10 9.5h4" />
                        </svg>
                        <span>Ver mi pasaporte</span>
                    </button>
                    <button class="btn-outline" on:click={verTrivia}>
                        <svg
                            class="btn-icono"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="9.5" />
                            <polygon
                                points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
                                fill="currentColor"
                                fill-opacity="0.35"
                            />
                            <circle
                                cx="12"
                                cy="12"
                                r="1.3"
                                fill="currentColor"
                            />
                        </svg>
                        <span>&nbsp;Desafío minero</span>
                    </button>
                    <button class="btn-outline" on:click={escucharAudio}>
                        <svg
                            class="btn-icono"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <path
                                d="M11 5L6 9H2v6h4l5 4V5z"
                                fill="currentColor"
                                fill-opacity="0.3"
                            />
                            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                            <path d="M18.8 5.2a9.5 9.5 0 0 1 0 13.6" />
                        </svg>
                        <span>&nbsp; Escuchar relato</span>
                    </button>
                </div>
            </div>

            <!-- ─ Fase: FALLIDA ─ -->
        {:else if fase === "fallida"}
            <div class="vista-fase vista-fallida">
                <p class="fallida-icon">😞</p>
                <h2>Mejor suerte mañana</h2>
                <p>
                    Agotaste los intentos de hoy. Regresa mañana para intentarlo
                    de nuevo y obtener tu sello.
                </p>
                <a href="/" class="btn-outline" style="margin-top: 20px;"
                    >Volver al inicio</a
                >
            </div>
        {/if}
    </main>

    <!-- Modal de datos de perfil por etapas (overlay, no desplaza) -->
    <DataForm
        visible={mostrarDataForm}
        paso={pasoDataForm}
        perfilExistente={$userStore.perfil}
        on:save={onPerfilGuardado}
    />
</div>

<style>
    /* ─── Layout principal: 100% del contenedor flex ────────────── */
    .punto-page {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-width: 600px;
        margin: 0 auto;
        padding: 12px 16px;
        box-sizing: border-box;
        overflow: hidden;
    }

    /* ─── Encabezado compacto ────────────────────────────────────── */
    .punto-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--border-dim, rgba(212, 160, 23, 0.12));
        flex-shrink: 0;
    }

    .btn-volver {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--text-muted, #B8A89A);
        text-decoration: none;
        font-size: 0.82rem;
        font-weight: 600;
        padding: 5px 12px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(212, 160, 23, 0.08);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.3));
        transition: all 0.2s ease;
    }
    .btn-volver:hover {
        color: var(--gold-bright, #F2C94C);
        border-color: var(--gold-bright, #F2C94C);
        background: rgba(212, 160, 23, 0.16);
        transform: translateX(-2px);
    }
    .btn-volver-icon {
        width: 17px;
        height: 17px;
        flex-shrink: 0;
    }

    .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .badge-sello-obtenido {
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--success, #4CAF82);
        background: rgba(76, 175, 130, 0.15);
        border: 1px solid rgba(76, 175, 130, 0.35);
        padding: 3px 8px;
        border-radius: var(--radius-full, 9999px);
    }

    .monedas-contador-header {
        font-family: 'Cinzel', serif;
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--gold-bright, #f2c94c);
        background: rgba(242, 201, 76, 0.1);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.35));
        padding: 3px 8px;
        border-radius: var(--radius-full, 9999px);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    }

    .monedas-ganadas-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, rgba(242, 201, 76, 0.18) 0%, rgba(212, 160, 23, 0.28) 100%);
        border: 1px solid var(--gold-bright, #f2c94c);
        border-radius: var(--radius-full, 9999px);
        padding: 4px 12px;
        box-shadow: 0 0 16px rgba(242, 201, 76, 0.35);
        animation: fadeup 0.5s 0.45s both, pulso-oro 2s infinite ease-in-out;
        margin: 2px 0;
    }
    @keyframes pulso-oro {
        0%, 100% { box-shadow: 0 0 10px rgba(242, 201, 76, 0.3); }
        50% { box-shadow: 0 0 20px rgba(242, 201, 76, 0.6); }
    }

    .monedas-ganadas-icon {
        font-size: 1rem;
    }
    .monedas-ganadas-txt {
        font-family: 'Cinzel', serif;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--gold-bright, #f2c94c);
        letter-spacing: 0.5px;
    }

    /* ─── Mini Card del Punto en Fase Audio ─────────────────────── */
    .punto-mini-card {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        max-width: 440px;
        background: var(--bg-card, #1E1008);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.28));
        border-radius: var(--radius-md, 14px);
        padding: 8px 12px;
        box-sizing: border-box;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
        text-align: left;
    }

    .punto-img-mini {
        width: 52px;
        height: 52px;
        object-fit: cover;
        border-radius: 10px;
        flex-shrink: 0;
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.4));
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }

    .punto-mini-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        flex: 1;
    }

    .punto-nombre {
        font-family: 'Cinzel', serif;
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary, #F5EDE4);
        line-height: 1.2;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .punto-desc {
        font-size: 0.78rem;
        color: var(--text-muted, #B8A89A);
        line-height: 1.35;
        margin: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* ─── Zona principal: ocupa el espacio restante ──────────────── */
    .punto-main {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px 0;
        overflow-y: auto;
        /* Transición GPU fluida a 60fps */
        transition: opacity 0.12s ease, transform 0.12s ease;
        will-change: opacity, transform;
        transform: translateZ(0);
    }

    .zona-visible {
        opacity: 1;
        transform: scale(1);
    }

    .zona-oculta {
        opacity: 0;
        transform: scale(0.97);
        pointer-events: none;
    }

    /* ─── Contenedor de vista por fase ──────────────────────────── */
    .vista-fase {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        text-align: center;
    }

    /* ─── Confetti (overlay fijo, sin ocupar espacio de layout) ─── */
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
        0% {
            transform: translateY(0) rotate(0deg) scaleX(1);
            opacity: 1;
        }
        50% {
            transform: translateY(50vh) rotate(360deg) scaleX(-1);
            opacity: 1;
        }
        100% {
            transform: translateY(105vh) rotate(720deg) scaleX(-1);
            opacity: 0;
        }
    }

    /* ─── Sello ganado: celebración ──────────────────────────────── */
    .vista-sello {
        gap: 10px;
        padding: 8px 0;
    }

    .badge-wrapper {
        position: relative;
        width: 140px;
        height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;
    }

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
        to {
            transform: rotate(360deg);
        }
    }

    .insignia-celebracion {
        width: 115px;
        height: 115px;
        object-fit: contain;
        position: relative;
        z-index: 1;
        animation: revelar-insignia 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)
            forwards;
        filter: drop-shadow(0 0 20px rgba(242, 201, 76, 0.6));
    }
    @keyframes revelar-insignia {
        from {
            transform: scale(0) rotate(-20deg);
            opacity: 0;
        }
        to {
            transform: scale(1) rotate(0deg);
            opacity: 1;
        }
    }

    .celebracion-etiqueta {
        font-family: "Cinzel", serif;
        font-size: 1.2rem;
        font-weight: 700;
        letter-spacing: 2px;
        background: linear-gradient(
            135deg,
            var(--gold-bright, #f2c94c),
            var(--gold-mid, #d4a017)
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: fadeup 0.5s 0.4s both;
        margin: 0;
    }
    .celebracion-nombre {
        font-size: 1rem;
        color: var(--text-primary, #f5e6c8);
        font-weight: 500;
        animation: fadeup 0.5s 0.5s both;
        margin: 0;
    }
    .celebracion-contador {
        font-size: 0.88rem;
        color: var(--text-muted, #a08060);
        animation: fadeup 0.5s 0.6s both;
        margin: 0;
    }
    .celebracion-contador strong {
        color: var(--gold-bright, #f2c94c);
    }
    .celebracion-acciones {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 6px;
        animation: fadeup 0.5s 0.7s both;
    }

    @keyframes fadeup {
        from {
            opacity: 0;
            transform: translateY(12px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* ─── Fallida ───────────────────────────────────────────────── */
    .vista-fallida {
        padding: 20px;
        background: var(--bg-card, #1e1008);
        border: 1px solid rgba(224, 82, 82, 0.25);
        border-radius: var(--radius-md, 14px);
        gap: 10px;
    }
    .fallida-icon {
        font-size: 2.5rem;
        margin: 0;
    }
    .vista-fallida h2 {
        font-family: "Cinzel", serif;
        font-size: 1.1rem;
        color: var(--text-primary, #f5e6c8);
        margin: 0;
    }
    .vista-fallida p {
        font-size: 0.88rem;
        color: var(--text-muted, #a08060);
        line-height: 1.55;
        margin: 0;
    }

    /* ─── Botones ────────────────────────────────────────────────── */
    .btn-gold {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: linear-gradient(
            135deg,
            var(--gold-mid, #d4a017),
            var(--gold-bright, #f2c94c)
        );
        color: var(--bg-primary, #12090a);
        border: none;
        border-radius: var(--radius-full, 9999px);
        padding: 12px 26px;
        font-family: "Inter", sans-serif;
        font-weight: 600;
        font-size: 0.92rem;
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
        color: var(--gold-mid, #d4a017);
        border: 1px solid rgba(212, 160, 23, 0.3);
        border-radius: var(--radius-full, 9999px);
        padding: 10px 20px;
        font-family: "Inter", sans-serif;
        font-weight: 500;
        font-size: 0.88rem;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s;
    }
    .btn-outline:hover {
        background: rgba(212, 160, 23, 0.1);
        border-color: var(--gold-bright, #f2c94c);
        color: var(--gold-bright, #f2c94c);
    }

    .btn-icono {
        width: 17px;
        height: 17px;
        flex-shrink: 0;
    }

    /* ─── Responsive: pantallas de baja altura ───────────────────── */
    @media (max-height: 620px) {
        .punto-header {
            padding-bottom: 6px;
        }
        .punto-img-mini {
            width: 44px;
            height: 44px;
        }
        .punto-nombre {
            font-size: 0.95rem;
        }
        .punto-desc {
            -webkit-line-clamp: 1;
        }
        .badge-wrapper {
            width: 100px;
            height: 100px;
        }
        .insignia-celebracion {
            width: 85px;
            height: 85px;
        }
        .aura {
            inset: -10px;
        }
        .aura--lenta {
            inset: -18px;
        }
        .celebracion-etiqueta {
            font-size: 1rem;
        }
    }
</style>
