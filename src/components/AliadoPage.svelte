<script lang="ts">
    import { onMount } from "svelte";
    import { userStore } from "../stores/user";
    import type { AliadoData } from "../data/aliados";
    import { guardarSelloAliado, guardarVisitaAliado } from "../lib/db";

    export let aliado: AliadoData;
    export let origen: string = "desconocido";

    let guardando = false;
    let selloRecienGanado = false;
    let errorMensaje = "";
    
    // Animación de confetti
    let confettiPiezas: {
        x: number;
        color: string;
        delay: number;
        duration: number;
        size: number;
    }[] = [];

    $: uid = $userStore.uid;
    $: sellosAliados = $userStore.sellosAliados || {};
    $: yaTieneSello = Boolean(sellosAliados[aliado.id]);
    $: stampData = sellosAliados[aliado.id];

    onMount(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const origenUrl = params.get("origen");
            if (origenUrl) {
                origen = origenUrl;
            }
        }
    });

    async function registrarVisita() {
        if (yaTieneSello || guardando) return;

        if (!uid) {
            errorMensaje = "Iniciando sesión segura en tu dispositivo... Por favor pulsa de nuevo en un segundo.";
            return;
        }

        guardando = true;
        errorMensaje = "";

        const ahora = new Date().toISOString();
        const nuevoSello = { fecha: ahora, origen };

        try {
            // Guardar en Firestore
            await guardarVisitaAliado(uid, aliado.id, origen);
            await guardarSelloAliado(uid, aliado.id, origen);

            // Actualizar store reactivo
            userStore.update((s) => ({
                ...s,
                sellosAliados: {
                    ...s.sellosAliados,
                    [aliado.id]: nuevoSello,
                },
            }));

            activarCelebracion();
        } catch (err) {
            console.warn("Modo offline o error al sincronizar con Firestore:", err);
            // Modo offline resiliente: actualizar store local
            userStore.update((s) => ({
                ...s,
                sellosAliados: {
                    ...s.sellosAliados,
                    [aliado.id]: nuevoSello,
                },
            }));
            activarCelebracion();
        } finally {
            guardando = false;
        }
    }

    function activarCelebracion() {
        selloRecienGanado = true;
        generarConfetti();
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate([80, 40, 80, 40, 200]);
        }
    }

    function generarConfetti() {
        const colores = [
            "#F2C94C",
            "#D4A017",
            "#E07B39",
            "#F5C87A",
            "#FFFFFF",
            "#FFC107",
            "#FF9800",
            "#FFEB3B",
        ];
        confettiPiezas = Array.from({ length: 45 }, () => ({
            x: Math.random() * 100,
            color: colores[Math.floor(Math.random() * colores.length)],
            delay: Math.random() * 0.8,
            duration: 1.5 + Math.random() * 1.3,
            size: 6 + Math.random() * 8,
        }));
    }

    function getCategoriaIcono(cat: string): string {
        const c = cat.toLowerCase();
        if (c.includes("tour") || c.includes("aventura")) return "🚂";
        if (c.includes("restaurante") || c.includes("café") || c.includes("comida")) return "☕";
        if (c.includes("taller") || c.includes("artesanal") || c.includes("artesanía")) return "💎";
        if (c.includes("hotel") || c.includes("hospedaje") || c.includes("descanso")) return "🏨";
        return "✨";
    }

    function getBeneficioBadge(tipo?: string): { label: string; icono: string; colorClass: string } {
        if (tipo === "descuento") return { label: "Descuento exclusivo", icono: "🏷️", colorClass: "badge-descuento" };
        if (tipo === "cortesia") return { label: "Cortesía especial", icono: "🎁", colorClass: "badge-cortesia" };
        return { label: "Beneficio para ti", icono: "⭐", colorClass: "badge-otro" };
    }

    function formatearFecha(isoString?: string): string {
        if (!isoString) return "";
        try {
            const f = new Date(isoString);
            return f.toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        } catch {
            return isoString;
        }
    }
</script>

<!-- Confetti de celebración -->
{#if (selloRecienGanado || yaTieneSello) && confettiPiezas.length > 0}
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

<div class="aliado-page">
    <!-- Barra superior de navegación rápida -->
    <header class="top-nav">
        <a href="/" class="btn-volver" title="Volver al pasaporte">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Pasaporte El Oro</span>
        </a>
        <div class="origen-tag">
            {#if origen === "qr"}
                <span class="tag-qr">📷 Escaneado por QR</span>
            {:else if origen === "sello"}
                <span class="tag-sello">📖 Pasaporte</span>
            {:else}
                <span class="tag-directo">🤝 Aliado Comercial</span>
            {/if}
        </div>
    </header>

    <!-- Hero Card con Logo y Datos Principales -->
    <div class="hero-card">
        <div class="logo-container">
            <img src={aliado.imagenLogo} alt={aliado.nombre} class="aliado-logo" />
            <div class="categoria-flotante">
                <span>{getCategoriaIcono(aliado.categoria)} {aliado.categoria}</span>
            </div>
        </div>

        <div class="hero-info">
            <span class="coleccion-badge">Colección {aliado.coleccion.toUpperCase()}</span>
            <h1 class="aliado-nombre">{aliado.nombre}</h1>
            <p class="aliado-desc">{aliado.descripcionCorta}</p>
        </div>
    </div>

    <!-- Tarjeta de Beneficio / Recompensa (Si existe) -->
    {#if aliado.beneficio}
        {@const badge = getBeneficioBadge(aliado.beneficio.tipo)}
        <div class="beneficio-card">
            <div class="beneficio-header">
                <span class="beneficio-pill {badge.colorClass}">
                    <i>{badge.icono}</i> {badge.label}
                </span>
                {#if aliado.beneficio.vigencia}
                    <span class="beneficio-vigencia">{aliado.beneficio.vigencia}</span>
                {/if}
            </div>
            <p class="beneficio-detalle">{aliado.beneficio.detalle}</p>
            <div class="beneficio-footer">
                <span class="beneficio-tip">💡 Muestra tu sello digital en el establecimiento para hacerlo válido</span>
            </div>
        </div>
    {/if}

    <!-- Sección de Sello & Acción -->
    <div class="sello-section card">
        <div class="insignia-preview-wrapper">
            {#if yaTieneSello || selloRecienGanado}
                <div class="aura aura--activa" aria-hidden="true"></div>
                <div class="aura aura--lenta" aria-hidden="true"></div>
            {/if}
            <img
                src={aliado.insigniaURL}
                alt="Insignia {aliado.nombre}"
                class="insignia-img {yaTieneSello || selloRecienGanado ? 'obtenida' : 'bloqueada'}"
            />
            {#if yaTieneSello || selloRecienGanado}
                <span class="sello-check" title="Sello obtenido">✓</span>
            {/if}
        </div>

        {#if yaTieneSello || selloRecienGanado}
            <!-- Estado: Sello Ya Obtenido -->
            <div class="estado-obtenido">
                <p class="etiqueta-obtenido">
                    {selloRecienGanado ? "¡FELICIDADES! SELLO OBTENIDO" : "SELLO REGISTRADO"}
                </p>
                <h3 class="mensaje-exito">
                    {selloRecienGanado ? "Has ganado la insignia de este aliado" : "Ya tienes este sello en tu pasaporte"}
                </h3>
                {#if stampData?.fecha}
                    <p class="fecha-registro">
                        Registrado el <strong>{formatearFecha(stampData.fecha)}</strong>
                        {#if stampData.origen === "qr"}
                            (vía código QR en el local)
                        {/if}
                    </p>
                {/if}

                <div class="acciones-post-registro">
                    <a href="/" class="btn-gold">
                        <svg class="btn-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            <circle cx="12" cy="9.5" r="2.5" fill="currentColor" fill-opacity="0.35" />
                        </svg>
                        <span>Ver mi pasaporte</span>
                    </a>
                </div>
            </div>
        {:else}
            <!-- Estado: Pendiente de Registro -->
            <div class="estado-pendiente">
                <p class="invitacion-registro">
                    Visita este establecimiento en El Oro, apoya el comercio local y colecciona su sello oficial.
                </p>

                {#if errorMensaje}
                    <div class="alerta-error">
                        <span>⚠️ {errorMensaje}</span>
                    </div>
                {/if}

                <button
                    class="btn-gold btn-registrar"
                    on:click={registrarVisita}
                    disabled={guardando}
                >
                    {#if guardando}
                        <span class="spinner"></span>
                        <span>Registrando visita...</span>
                    {:else}
                        <svg class="btn-icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span>Registrar visita</span>
                    {/if}
                </button>
                <p class="nota-sin-costo">⚡ Registro digital instantáneo • No requiere audio</p>
            </div>
        {/if}
    </div>
</div>

<style>
    .aliado-page {
        max-width: 520px;
        margin: 0 auto;
        padding: 8px 4px 60px;
    }

    /* ─── Top Nav ─────────────────────────────────────────────────── */
    .top-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding: 4px 6px;
    }

    .btn-volver {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--text-muted);
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 500;
        padding: 6px 12px;
        border-radius: var(--radius-full);
        background: rgba(212, 160, 23, 0.06);
        border: 1px solid var(--border-dim);
        transition: all 0.2s ease;
    }
    .btn-volver:hover {
        color: var(--gold-bright);
        border-color: var(--border-gold);
        background: rgba(212, 160, 23, 0.12);
        transform: translateX(-2px);
    }

    .origen-tag span {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: var(--radius-full);
        letter-spacing: 0.3px;
    }
    .tag-qr {
        background: rgba(76, 175, 130, 0.15);
        color: var(--success);
        border: 1px solid rgba(76, 175, 130, 0.35);
    }
    .tag-sello, .tag-directo {
        background: rgba(212, 160, 23, 0.12);
        color: var(--gold-mid);
        border: 1px solid var(--border-gold);
    }

    /* ─── Hero Card ───────────────────────────────────────────────── */
    .hero-card {
        background: var(--bg-card);
        border: 1px solid var(--border-gold);
        border-radius: var(--radius-lg, 22px);
        overflow: hidden;
        margin-bottom: 18px;
        box-shadow: var(--shadow-card);
        display: flex;
        flex-direction: column;
    }

    .logo-container {
        position: relative;
        width: 100%;
        height: 200px;
        background: #150b07;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        border-bottom: 1px solid var(--border-dim);
    }

    .aliado-logo {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6));
    }

    .categoria-flotante {
        position: absolute;
        top: 14px;
        right: 14px;
        background: rgba(18, 9, 10, 0.85);
        backdrop-filter: blur(8px);
        border: 1px solid var(--border-gold);
        padding: 5px 12px;
        border-radius: var(--radius-full);
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--gold-bright);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .hero-info {
        padding: 20px 20px 22px;
        text-align: center;
    }

    .coleccion-badge {
        display: inline-block;
        font-family: 'Cinzel', serif;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: var(--amber-light);
        background: rgba(224, 123, 57, 0.15);
        border: 1px solid rgba(224, 123, 57, 0.3);
        padding: 3px 10px;
        border-radius: var(--radius-full);
        margin-bottom: 10px;
    }

    .aliado-nombre {
        font-family: 'Cinzel', serif;
        font-size: 1.45rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.25;
        margin-bottom: 10px;
    }

    .aliado-desc {
        font-size: 0.92rem;
        color: var(--text-muted);
        line-height: 1.6;
        margin: 0;
    }

    /* ─── Beneficio Card ──────────────────────────────────────────── */
    .beneficio-card {
        background: linear-gradient(145deg, rgba(44, 26, 14, 0.85) 0%, rgba(30, 16, 8, 0.95) 100%);
        border: 1px solid rgba(242, 201, 76, 0.4);
        border-radius: var(--radius-md, 14px);
        padding: 16px 18px;
        margin-bottom: 18px;
        position: relative;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(242, 201, 76, 0.05);
    }

    .beneficio-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        flex-wrap: wrap;
    }

    .beneficio-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 4px 10px;
        border-radius: var(--radius-full);
    }
    .badge-descuento {
        background: rgba(242, 201, 76, 0.2);
        color: var(--gold-bright);
        border: 1px solid var(--gold-mid);
    }
    .badge-cortesia {
        background: rgba(76, 175, 130, 0.2);
        color: var(--success);
        border: 1px solid rgba(76, 175, 130, 0.4);
    }
    .badge-otro {
        background: rgba(224, 123, 57, 0.2);
        color: var(--amber-light);
        border: 1px solid rgba(224, 123, 57, 0.4);
    }

    .beneficio-vigencia {
        font-size: 0.75rem;
        color: var(--text-muted);
        font-weight: 500;
    }

    .beneficio-detalle {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        line-height: 1.45;
        margin-bottom: 10px;
    }

    .beneficio-footer {
        border-top: 1px dashed rgba(212, 160, 23, 0.25);
        padding-top: 8px;
    }

    .beneficio-tip {
        font-size: 0.78rem;
        color: var(--gold-mid);
        font-style: italic;
    }

    /* ─── Sello Section ───────────────────────────────────────────── */
    .sello-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 26px 20px;
        gap: 16px;
        border: 1px solid var(--border-gold);
    }

    .insignia-preview-wrapper {
        position: relative;
        width: 140px;
        height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .aura {
        position: absolute;
        inset: -14px;
        border-radius: 50%;
        background: conic-gradient(
            transparent 20%,
            rgba(242, 201, 76, 0.5) 40%,
            rgba(224, 123, 57, 0.4) 60%,
            transparent 80%
        );
        animation: girar-aura 3.5s linear infinite;
    }
    .aura--lenta {
        inset: -22px;
        background: conic-gradient(
            transparent 40%,
            rgba(242, 201, 76, 0.2) 60%,
            transparent 80%
        );
        animation: girar-aura 6s linear infinite reverse;
    }
    @keyframes girar-aura {
        to {
            transform: rotate(360deg);
        }
    }

    .insignia-img {
        width: 115px;
        height: 115px;
        object-fit: contain;
        position: relative;
        z-index: 1;
        transition: all 0.4s ease;
    }
    .insignia-img.bloqueada {
        filter: grayscale(100%) opacity(0.35);
    }
    .insignia-img.obtenida {
        filter: drop-shadow(0 0 16px rgba(242, 201, 76, 0.65));
        animation: pop-insignia 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes pop-insignia {
        0% { transform: scale(0.6) rotate(-15deg); opacity: 0; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }

    .sello-check {
        position: absolute;
        bottom: 6px;
        right: 6px;
        z-index: 2;
        background: var(--success);
        color: #fff;
        font-weight: 700;
        font-size: 0.9rem;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        border: 2px solid var(--bg-card);
    }

    /* ─── Estados ─────────────────────────────────────────────────── */
    .estado-obtenido, .estado-pendiente {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        width: 100%;
    }

    .etiqueta-obtenido {
        font-family: 'Cinzel', serif;
        font-size: 1.15rem;
        font-weight: 700;
        letter-spacing: 1.5px;
        background: linear-gradient(135deg, var(--gold-bright), var(--gold-mid));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
    }

    .mensaje-exito {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
    }

    .fecha-registro {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin: 0;
    }
    .fecha-registro strong {
        color: var(--gold-bright);
    }

    .acciones-post-registro {
        margin-top: 8px;
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .invitacion-registro {
        font-size: 0.92rem;
        color: var(--text-muted);
        line-height: 1.5;
        max-width: 400px;
        margin: 0;
    }

    .alerta-error {
        background: rgba(224, 82, 82, 0.15);
        border: 1px solid rgba(224, 82, 82, 0.4);
        color: #ff9999;
        font-size: 0.85rem;
        padding: 8px 14px;
        border-radius: var(--radius-sm);
        margin: 4px 0;
    }

    .btn-registrar {
        width: 100%;
        max-width: 320px;
        padding: 14px 28px;
        font-size: 1rem;
        gap: 10px;
        margin-top: 4px;
    }

    .btn-icono {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
    }

    .nota-sin-costo {
        font-size: 0.78rem;
        color: var(--text-dim);
        margin-top: 2px;
    }

    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(18, 9, 10, 0.3);
        border-top-color: var(--bg-primary);
        border-radius: 50%;
        animation: girar-spinner 0.8s linear infinite;
    }
    @keyframes girar-spinner {
        to { transform: rotate(360deg); }
    }

    /* ─── Confetti ────────────────────────────────────────────────── */
    .confetti-container {
        position: fixed;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 999;
    }
    .confetti-pieza {
        position: absolute;
        top: -12px;
        border-radius: 2px;
        opacity: 0;
        animation: caer-confetti linear forwards;
    }
    @keyframes caer-confetti {
        0% { transform: translateY(0) rotate(0deg) scaleX(1); opacity: 1; }
        50% { transform: translateY(50vh) rotate(360deg) scaleX(-1); opacity: 1; }
        100% { transform: translateY(105vh) rotate(720deg) scaleX(-1); opacity: 0; }
    }
</style>
