<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { userStore, obtenerPasoPendientePerfil, puedeCanjearBeneficioHoy } from "../stores/user";
    import type { DatosPerfil, CanjeBeneficio } from "../stores/user";
    import type { AliadoData } from "../data/aliados";
    import {
        guardarDatosUsuario,
        guardarSelloAliado,
        guardarVisitaAliado,
        guardarCanjeAliado,
    } from "../lib/db";
    import DataForm from "./DataForm.svelte";
    import QRScannerModal from "./QRScannerModal.svelte";

    export let aliado: AliadoData;
    export let origen: string = "desconocido";

    let guardando = false;
    let selloRecienGanado = false;
    let canjeRecienRealizado = false;
    let errorMensaje = "";
    let mostrarDataForm = false;
    let pasoDataForm: 1 | 2 | 3 = 1;
    let accionPendienteDespuesPerfil: "visita" | "canje" | null = null;
    let metodoCanjePendiente = "manual";

    let mostrarScanner = false;
    let relojEnVivo = "";
    let relojTimer: any = null;

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
    $: stampAliado = sellosAliados[aliado.id];
    $: yaTieneSello = Boolean(stampAliado);
    $: stampData = stampAliado;
    $: puedeCanjear = puedeCanjearBeneficioHoy(stampAliado);
    $: ultimoCanje = stampAliado?.ultimoCanje;

    onMount(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const origenUrl = params.get("origen");
            if (origenUrl) {
                origen = origenUrl;
            }

            // Escaneo directo de QR físico de cortesía en local (?canje=qr)
            if (params.get("canje") === "qr") {
                origen = "qr";
                iniciarFlujoCanje("qr_fisico");
            } else if (params.get("canjear") === "1" && puedeCanjear) {
                mostrarScanner = true;
            }
        }

        iniciarRelojEnVivo();
    });

    onDestroy(() => {
        if (relojTimer) {
            clearInterval(relojTimer);
            relojTimer = null;
        }
    });

    function iniciarRelojEnVivo() {
        actualizarHoraReloj();
        if (!relojTimer) {
            relojTimer = setInterval(actualizarHoraReloj, 1000);
        }
    }

    function actualizarHoraReloj() {
        const ahora = new Date();
        relojEnVivo = ahora.toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    }

    function iniciarFlujoCanje(metodo: string = "manual") {
        if (!puedeCanjear && !canjeRecienRealizado) {
            return;
        }

        const pasoPendiente = obtenerPasoPendientePerfil($userStore.perfil);
        if (pasoPendiente !== null) {
            pasoDataForm = pasoPendiente;
            accionPendienteDespuesPerfil = "canje";
            metodoCanjePendiente = metodo;
            mostrarDataForm = true;
            return;
        }

        ejecutarCanjeMostrador(metodo);
    }

    async function ejecutarCanjeMostrador(metodo: string) {
        guardando = true;
        errorMensaje = "";

        const ahora = new Date().toISOString();
        const fechaDia = ahora.slice(0, 10);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const folio = `CANJE-${aliado.id.slice(0, 4).toUpperCase()}-${randomNum}`;

        const nuevoCanje: CanjeBeneficio = {
            fecha: ahora,
            fechaDia,
            folio,
            metodo: metodo === "qr_fisico" || metodo === "scanner_camara" ? "qr" : "manual",
        };

        const nuevoSello = {
            fecha: stampAliado?.fecha || ahora,
            origen: stampAliado?.origen || (metodo.startsWith("qr") ? "qr" : origen),
            ultimoCanje: nuevoCanje,
        };

        const monedasGanadas = yaTieneSello ? 0 : 20;

        // 1. Actualización optimista inmediata en userStore (+20 Monedas si es primer sello)
        userStore.update((s) => ({
            ...s,
            monedas: (s.monedas || 0) + monedasGanadas,
            sellosAliados: {
                ...s.sellosAliados,
                [aliado.id]: nuevoSello,
            },
        }));

        canjeRecienRealizado = true;
        if (!yaTieneSello) {
            selloRecienGanado = true;
        }

        activarCelebracion();

        // 2. Sincronización en segundo plano con Firestore (fire-and-forget)
        if (uid) {
            guardarCanjeAliado(uid, aliado.id, nuevoCanje).catch((err) =>
                console.warn("[AliadoPage] Error sync canje:", err),
            );

            if (!yaTieneSello) {
                guardarVisitaAliado(uid, aliado.id, nuevoSello.origen).catch((err) =>
                    console.warn("[AliadoPage] Error sync visita:", err),
                );
                guardarSelloAliado(uid, aliado.id, nuevoSello.origen).catch((err) =>
                    console.warn("[AliadoPage] Error sync sello:", err),
                );
            }
        }

        guardando = false;
    }

    async function registrarVisita() {
        if (yaTieneSello || guardando) return;

        const pasoPendiente = obtenerPasoPendientePerfil($userStore.perfil);
        if (pasoPendiente !== null) {
            pasoDataForm = pasoPendiente;
            accionPendienteDespuesPerfil = "visita";
            mostrarDataForm = true;
            return;
        }

        await completarRegistroVisita();
    }

    async function completarRegistroVisita() {
        guardando = true;
        errorMensaje = "";

        const ahora = new Date().toISOString();
        const nuevoSello = {
            fecha: ahora,
            origen,
            ultimoCanje: stampAliado?.ultimoCanje,
        };

        // 1. Actualización optimista inmediata en userStore (+20 Monedas de Aliado)
        userStore.update((s) => ({
            ...s,
            monedas: (s.monedas || 0) + 20,
            sellosAliados: {
                ...s.sellosAliados,
                [aliado.id]: nuevoSello,
            },
        }));

        activarCelebracion();

        // 2. Sincronización en segundo plano con Firestore (fire-and-forget)
        if (uid) {
            guardarVisitaAliado(uid, aliado.id, origen).catch((err) =>
                console.warn("[AliadoPage] Error sync visita:", err),
            );
            guardarSelloAliado(uid, aliado.id, origen).catch((err) =>
                console.warn("[AliadoPage] Error sync sello:", err),
            );
        }

        guardando = false;
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

            if (accionPendienteDespuesPerfil === "canje") {
                await ejecutarCanjeMostrador(metodoCanjePendiente);
            } else {
                await completarRegistroVisita();
            }
            accionPendienteDespuesPerfil = null;
        } catch (e) {
            alert("Error al guardar los datos. Intenta de nuevo.");
        }
    }

    function onScanQR(e: CustomEvent<{ codigo: string }>) {
        mostrarScanner = false;
        const codigo = e.detail.codigo;

        // Validar que el código sea de este aliado o genérico oficial
        if (codigo.includes(aliado.id) || codigo.startsWith("simulado:") || codigo.includes("canje=qr")) {
            iniciarFlujoCanje("scanner_camara");
        } else {
            alert(`El código escaneado no corresponde a las cortesías de ${aliado.nombre}.`);
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
        confettiPiezas = Array.from({ length: 36 }, () => ({
            x: Math.random() * 100,
            color: colores[Math.floor(Math.random() * colores.length)],
            delay: Math.random() * 0.6,
            duration: 1.4 + Math.random() * 1.0,
            size: 6 + Math.random() * 6,
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
        if (tipo === "descuento") return { label: "Descuento", icono: "🏷️", colorClass: "badge-descuento" };
        if (tipo === "cortesia") return { label: "Cortesía", icono: "🎁", colorClass: "badge-cortesia" };
        return { label: "Beneficio", icono: "⭐", colorClass: "badge-otro" };
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

    function formatearHora(isoString?: string): string {
        if (!isoString) return "";
        try {
            const f = new Date(isoString);
            return f.toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "";
        }
    }
</script>

<!-- Confetti de celebración -->
{#if (selloRecienGanado || canjeRecienRealizado) && confettiPiezas.length > 0}
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
    <!-- ─── Barra Superior de Navegación ────────────────────────── -->
    <header class="top-nav">
        <a href="/" class="btn-volver" title="Volver al pasaporte">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Pasaporte</span>
        </a>
        <div class="top-nav-right">
            <span class="monedas-contador" title="Tus Monedas Áureas">🪙 {$userStore.monedas || 0}</span>
            <div class="origen-tag">
                {#if origen === "qr"}
                    <span class="tag-qr">📷 QR en Local</span>
                {:else if origen === "sello"}
                    <span class="tag-sello">📖 Pasaporte</span>
                {:else}
                    <span class="tag-directo">🤝 Aliado</span>
                {/if}
            </div>
        </div>
    </header>

    <!-- ─── Tarjeta Hero Compacta ──────────────────────────────── -->
    <section class="hero-card">
        <div class="hero-header-row">
            <div class="logo-wrap">
                <img src={aliado.imagenLogo} alt={aliado.nombre} class="aliado-logo" />
            </div>
            <div class="hero-title-col">
                <div class="pills-row">
                    <span class="categoria-pill">
                        {getCategoriaIcono(aliado.categoria)} {aliado.categoria}
                    </span>
                    <span class="coleccion-pill">{aliado.coleccion.toUpperCase()}</span>
                </div>
                <h1 class="aliado-nombre">{aliado.nombre}</h1>
            </div>
        </div>
        <p class="aliado-desc">{aliado.descripcionCorta}</p>
    </section>

    <!-- ─── Tarjeta de Beneficio / Recompensa (Voucher o Comprobante en Vivo) ── -->
    {#if aliado.beneficio}
        {@const badge = getBeneficioBadge(aliado.beneficio.tipo)}
        
        {#if !puedeCanjear && ultimoCanje}
            <!-- ─── COMPROBANTE DINÁMICO EN VIVO PARA CAJA (Anti-Capturas) ─── -->
            <section class="comprobante-card">
                <div class="comprobante-header">
                    <div class="comprobante-badge-live">
                        <span class="pulse-dot-green"></span>
                        <span>CANJE EN VIVO</span>
                    </div>
                    <span class="folio-text">Folio: <strong>{ultimoCanje.folio}</strong></span>
                </div>

                <div class="reloj-dinamico-box">
                    <span class="reloj-label">RELOJ OFICIAL EN VIVO</span>
                    <span class="reloj-hora">{relojEnVivo}</span>
                    <span class="reloj-subtext">Verificado en mostrador • El Oro, Méx.</span>
                </div>

                <div class="comprobante-detalle">
                    <p class="beneficio-detalle-canjeado">{aliado.beneficio.detalle}</p>
                    <p class="comprobante-info-line">
                        Canjeado hoy a las <strong>{formatearHora(ultimoCanje.fecha)} hrs</strong> 
                        ({ultimoCanje.metodo === "qr" ? "vía QR de caja" : "validación en mostrador"})
                    </p>
                </div>

                <div class="comprobante-footer">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" class="shield-icon">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <polyline points="9 12 11 14 15 10"/>
                    </svg>
                    <span>Presenta esta pantalla activa al cajero para recibir tu cortesía.</span>
                </div>
            </section>
        {:else}
            <!-- ─── TICKET DE BENEFICIO DISPONIBLE CON BOTÓN DE ESCÁNER ─── -->
            <section class="beneficio-card">
                <div class="beneficio-top">
                    <span class="beneficio-pill {badge.colorClass}">
                        <i>{badge.icono}</i> {badge.label}
                    </span>
                    <div class="estado-disponible-tag">
                        <span class="pulse-dot-green"></span>
                        <span>Disponible hoy</span>
                    </div>
                </div>

                <p class="beneficio-detalle">{aliado.beneficio.detalle}</p>

                <div class="canje-acciones-box">
                    <button class="btn-canjear-qr" on:click={() => (mostrarScanner = true)} disabled={guardando}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                            <rect x="7" y="7" width="10" height="10" rx="2" />
                        </svg>
                        <span>📷 Canjear en caja con QR</span>
                    </button>
                    <button class="btn-validar-manual" on:click={() => iniciarFlujoCanje("manual")} disabled={guardando}>
                        <span>¿Cámara sin soporte? Validar en mostrador</span>
                    </button>
                </div>

                <div class="beneficio-footer">
                    <span class="beneficio-tip">💡 Escanea el QR oficial en el acrílico de caja para validar tu cortesía</span>
                </div>
            </section>
        {/if}
    {/if}

    <!-- ─── Sección de Insignia & Estado de Sello del Pasaporte ───────────── -->
    <section class="sello-card">
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
            <!-- Estado: Sello Obtenido -->
            <div class="estado-box">
                <span class="etiqueta-obtenido">
                    {selloRecienGanado ? "¡SELLO DESBLOQUEADO!" : "SELLO REGISTRADO"}
                </span>
                {#if selloRecienGanado}
                    <div class="monedas-bono-badge">
                        <span>🪙 +20 Monedas de Aliado</span>
                    </div>
                {/if}
                <p class="mensaje-exito">
                    {selloRecienGanado ? "Has ganado la insignia de este aliado" : "Insignia registrada en tu pasaporte"}
                </p>
                {#if stampData?.fecha}
                    <p class="fecha-registro">
                        Registrado el <strong>{formatearFecha(stampData.fecha)}</strong>
                        {#if stampData.origen === "qr"}
                            (vía QR en el local)
                        {/if}
                    </p>
                {/if}

                <div class="acciones-row">
                    <a href="/" class="btn-gold btn-full">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                        <span>Ver mi pasaporte</span>
                    </a>
                </div>
            </div>
        {:else}
            <!-- Estado: Pendiente de Registro -->
            <div class="estado-box">
                <p class="invitacion-registro">
                    Visita este establecimiento en El Oro, apoya el comercio local y desbloquea su sello oficial.
                </p>

                {#if errorMensaje}
                    <div class="alerta-error">
                        <span>⚠️ {errorMensaje}</span>
                    </div>
                {/if}

                <button
                    class="btn-gold btn-full btn-registrar"
                    on:click={registrarVisita}
                    disabled={guardando}
                >
                    {#if guardando}
                        <span class="spinner"></span>
                        <span>Registrando...</span>
                    {:else}
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span>Registrar visita (+20 Monedas)</span>
                    {/if}
                </button>
                <p class="nota-sin-costo">⚡ Registro instantáneo al canjear tu cortesía o pulsar el botón</p>
            </div>
        {/if}
    </section>

    <!-- Modal de escáner QR de caja -->
    <QRScannerModal
        visible={mostrarScanner}
        aliadoId={aliado.id}
        aliadoNombre={aliado.nombre}
        on:scan={onScanQR}
        on:close={() => (mostrarScanner = false)}
    />

    <!-- Modal de datos de perfil multietapa -->
    <DataForm
        visible={mostrarDataForm}
        paso={pasoDataForm}
        perfilExistente={$userStore.perfil}
        on:save={onPerfilGuardado}
    />
</div>

<style>
    /* ─── Layout General Flexbox ─────────────────────────────────── */
    .aliado-page {
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 460px;
        margin: 0 auto;
        padding: 4px 6px 40px;
        box-sizing: border-box;
    }

    /* ─── Top Nav ─────────────────────────────────────────────────── */
    .top-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 2px;
    }

    .top-nav-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .monedas-contador {
        font-family: 'Cinzel', serif;
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--gold-bright, #F2C94C);
        background: rgba(242, 201, 76, 0.1);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.35));
        padding: 3px 8px;
        border-radius: var(--radius-full, 999px);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    }

    .monedas-bono-badge {
        font-family: 'Cinzel', serif;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--gold-bright, #F2C94C);
        background: linear-gradient(135deg, rgba(242, 201, 76, 0.18) 0%, rgba(212, 160, 23, 0.28) 100%);
        border: 1px solid var(--gold-bright, #F2C94C);
        padding: 3px 10px;
        border-radius: var(--radius-full, 999px);
        box-shadow: 0 0 10px rgba(242, 201, 76, 0.35);
        animation: pop-insignia 0.4s ease forwards;
        margin: 2px 0;
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
        border-radius: var(--radius-full, 999px);
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

    .origen-tag span {
        font-size: 0.72rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: var(--radius-full, 999px);
        letter-spacing: 0.3px;
    }
    .tag-qr {
        background: rgba(76, 175, 130, 0.15);
        color: var(--success, #4CAF82);
        border: 1px solid rgba(76, 175, 130, 0.35);
    }
    .tag-sello, .tag-directo {
        background: rgba(212, 160, 23, 0.12);
        color: var(--gold-mid, #D4A017);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.3));
    }

    /* ─── Hero Card ───────────────────────────────────────────────── */
    .hero-card {
        background: var(--bg-card, #1E1008);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.3));
        border-radius: var(--radius-md, 16px);
        padding: 14px 16px;
        box-shadow: var(--shadow-card, 0 4px 16px rgba(0,0,0,0.4));
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .hero-header-row {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .logo-wrap {
        width: 56px;
        height: 56px;
        flex-shrink: 0;
        border-radius: 12px;
        background: #140a06;
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.4));
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }

    .aliado-logo {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    .hero-title-col {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .pills-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
    }

    .categoria-pill {
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--gold-bright, #F2C94C);
        background: rgba(242, 201, 76, 0.1);
        border: 1px solid rgba(242, 201, 76, 0.25);
        padding: 2px 8px;
        border-radius: var(--radius-full, 999px);
    }

    .coleccion-pill {
        font-family: 'Cinzel', serif;
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 1px;
        color: var(--amber-light, #F5C87A);
        background: rgba(224, 123, 57, 0.12);
        padding: 2px 6px;
        border-radius: var(--radius-full, 999px);
    }

    .aliado-nombre {
        font-family: 'Cinzel', serif;
        font-size: 1.18rem;
        font-weight: 700;
        color: var(--text-primary, #F5EDE4);
        line-height: 1.2;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .aliado-desc {
        font-size: 0.85rem;
        color: var(--text-muted, #B8A89A);
        line-height: 1.45;
        margin: 0;
    }

    /* ─── Beneficio Card (Voucher) ────────────────────────────────── */
    .beneficio-card {
        background: linear-gradient(145deg, rgba(44, 26, 14, 0.85) 0%, rgba(30, 16, 8, 0.95) 100%);
        border: 1px solid rgba(242, 201, 76, 0.4);
        border-radius: var(--radius-md, 14px);
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35), inset 0 0 16px rgba(242, 201, 76, 0.04);
    }

    .beneficio-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
    }

    .beneficio-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        padding: 3px 8px;
        border-radius: var(--radius-full, 999px);
    }
    .badge-descuento {
        background: rgba(242, 201, 76, 0.2);
        color: var(--gold-bright, #F2C94C);
        border: 1px solid var(--gold-mid, #D4A017);
    }
    .badge-cortesia {
        background: rgba(76, 175, 130, 0.2);
        color: var(--success, #4CAF82);
        border: 1px solid rgba(76, 175, 130, 0.4);
    }
    .badge-otro {
        background: rgba(224, 123, 57, 0.2);
        color: var(--amber-light, #F5C87A);
        border: 1px solid rgba(224, 123, 57, 0.4);
    }

    .estado-disponible-tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.72rem;
        font-weight: 700;
        color: #4CAF82;
        background: rgba(76, 175, 130, 0.12);
        border: 1px solid rgba(76, 175, 130, 0.3);
        padding: 2px 8px;
        border-radius: 999px;
    }

    .pulse-dot-green {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4CAF82;
        box-shadow: 0 0 6px #4CAF82;
        animation: pulsoVerde 1.5s infinite;
    }
    @keyframes pulsoVerde {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.3; transform: scale(0.8); }
    }

    .beneficio-detalle {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--gold-bright, #F2C94C);
        line-height: 1.35;
        margin: 0;
    }

    .canje-acciones-box {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 2px;
    }

    .btn-canjear-qr {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 12px 16px;
        background: linear-gradient(135deg, #F2C94C 0%, #D4A017 100%);
        color: #1A0D00;
        font-family: 'Cinzel', serif;
        font-size: 0.9rem;
        font-weight: 700;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(212, 160, 23, 0.35);
        transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-canjear-qr:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(242, 201, 76, 0.5);
    }
    .btn-canjear-qr:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-validar-manual {
        background: none;
        border: none;
        color: var(--text-muted, #B8A89A);
        font-size: 0.74rem;
        cursor: pointer;
        text-decoration: underline;
        padding: 2px 0;
        transition: color 0.2s;
    }
    .btn-validar-manual:hover {
        color: var(--gold-bright, #F2C94C);
    }

    .beneficio-footer {
        border-top: 1px dashed rgba(212, 160, 23, 0.2);
        padding-top: 6px;
    }

    .beneficio-tip {
        font-size: 0.74rem;
        color: var(--text-muted, #B8A89A);
        font-style: italic;
    }

    /* ─── Comprobante Dinámico en Vivo (Seguridad Cajero) ────────── */
    .comprobante-card {
        background: linear-gradient(145deg, #1A0F07 0%, #26150B 100%);
        border: 2px solid #4CAF82;
        border-radius: var(--radius-md, 16px);
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(76, 175, 130, 0.25);
        position: relative;
        overflow: hidden;
    }

    .comprobante-card::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 200%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #4CAF82, transparent);
        animation: shimmerTop 3s infinite linear;
    }
    @keyframes shimmerTop {
        to { transform: translateX(50%); }
    }

    .comprobante-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .comprobante-badge-live {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(76, 175, 130, 0.2);
        border: 1px solid #4CAF82;
        color: #4CAF82;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        padding: 3px 9px;
        border-radius: 999px;
    }

    .folio-text {
        font-family: 'Cinzel', serif;
        font-size: 0.76rem;
        color: var(--gold-bright, #F2C94C);
    }

    .reloj-dinamico-box {
        background: #110703;
        border: 1px solid rgba(76, 175, 130, 0.35);
        border-radius: 12px;
        padding: 10px 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.6);
    }

    .reloj-label {
        font-size: 0.65rem;
        letter-spacing: 0.08em;
        color: #4CAF82;
        font-weight: 700;
    }

    .reloj-hora {
        font-family: 'Cinzel', monospace;
        font-size: 1.6rem;
        font-weight: 800;
        letter-spacing: 2px;
        color: #FFFFFF;
        text-shadow: 0 0 10px rgba(76, 175, 130, 0.5);
    }

    .reloj-subtext {
        font-size: 0.68rem;
        color: var(--text-dim, #7A6A5E);
    }

    .comprobante-detalle {
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: center;
    }

    .beneficio-detalle-canjeado {
        font-size: 0.98rem;
        font-weight: 700;
        color: var(--gold-bright, #F2C94C);
        margin: 0;
    }

    .comprobante-info-line {
        font-size: 0.75rem;
        color: var(--text-muted, #B8A89A);
        margin: 0;
    }
    .comprobante-info-line strong {
        color: #FFFFFF;
    }

    .comprobante-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border-top: 1px dashed rgba(76, 175, 130, 0.3);
        padding-top: 8px;
        font-size: 0.72rem;
        color: #4CAF82;
        font-weight: 600;
        text-align: center;
    }
    .shield-icon {
        flex-shrink: 0;
    }

    /* ─── Sello Card ──────────────────────────────────────────────── */
    .sello-card {
        background: var(--bg-card, #1E1008);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.3));
        border-radius: var(--radius-md, 16px);
        padding: 16px 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 12px;
        box-shadow: var(--shadow-card, 0 4px 16px rgba(0,0,0,0.4));
    }

    .insignia-preview-wrapper {
        position: relative;
        width: 100px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .aura {
        position: absolute;
        inset: -10px;
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
        inset: -16px;
        background: conic-gradient(
            transparent 40%,
            rgba(242, 201, 76, 0.2) 60%,
            transparent 80%
        );
        animation: girar-aura 6s linear infinite reverse;
    }
    @keyframes girar-aura {
        to { transform: rotate(360deg); }
    }

    .insignia-img {
        width: 82px;
        height: 82px;
        object-fit: contain;
        position: relative;
        z-index: 1;
        transition: all 0.35s ease;
    }
    .insignia-img.bloqueada {
        filter: grayscale(100%) opacity(0.35);
    }
    .insignia-img.obtenida {
        filter: drop-shadow(0 0 12px rgba(242, 201, 76, 0.6));
        animation: pop-insignia 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes pop-insignia {
        0% { transform: scale(0.6) rotate(-15deg); opacity: 0; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }

    .sello-check {
        position: absolute;
        bottom: 4px;
        right: 4px;
        z-index: 2;
        background: var(--success, #4CAF82);
        color: #fff;
        font-weight: 700;
        font-size: 0.8rem;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
        border: 2px solid var(--bg-card, #1E1008);
    }

    .estado-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        width: 100%;
    }

    .etiqueta-obtenido {
        font-family: 'Cinzel', serif;
        font-size: 0.98rem;
        font-weight: 700;
        letter-spacing: 1px;
        color: var(--gold-bright, #F2C94C);
        margin: 0;
    }

    .mensaje-exito {
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-primary, #F5EDE4);
        margin: 0;
    }

    .fecha-registro {
        font-size: 0.78rem;
        color: var(--text-dim, #7A6A5E);
        margin: 0;
    }
    .fecha-registro strong {
        color: var(--gold-bright, #F2C94C);
    }

    .invitacion-registro {
        font-size: 0.82rem;
        color: var(--text-muted, #B8A89A);
        line-height: 1.4;
        margin: 0;
    }

    .alerta-error {
        background: rgba(224, 82, 82, 0.15);
        border: 1px solid rgba(224, 82, 82, 0.4);
        color: #ff9999;
        font-size: 0.78rem;
        padding: 6px 10px;
        border-radius: var(--radius-sm, 6px);
        margin: 2px 0;
    }

    .acciones-row {
        width: 100%;
        margin-top: 4px;
    }

    .btn-full {
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 11px 16px;
        font-size: 0.9rem;
        font-weight: 700;
        box-sizing: border-box;
    }

    .btn-icon {
        width: 17px;
        height: 17px;
        flex-shrink: 0;
    }

    .nota-sin-costo {
        font-size: 0.72rem;
        color: var(--text-dim, #7A6A5E);
        margin: 2px 0 0;
    }

    .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(18, 9, 10, 0.3);
        border-top-color: var(--bg-primary, #12090A);
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
        top: -10px;
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
