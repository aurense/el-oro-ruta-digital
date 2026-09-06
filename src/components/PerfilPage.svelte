<script lang="ts">
    import { userStore } from "../stores/user";
    import { guardarDatosUsuario } from "../lib/db";
    import type { DatosPerfil } from "../stores/user";
    import SelectoresUbicacion from "./SelectoresUbicacion.svelte";

    let editando = false;
    let guardando = false;
    let mensaje = "";

    let nombre = "";
    let ubicacion = { pais: "", estado: "", municipio: "" };
    let rangoEdad = "";
    let compania = "";
    let estadia = "";
    let calificacion = 5;

    const rangos = [
        "Menor de 18",
        "18-24",
        "25-34",
        "35-44",
        "45-54",
        "55-64",
        "65+",
    ];

    const opcionesCompania = [
        "Solo",
        "En pareja",
        "En familia",
        "Con amigos",
    ];

    const opcionesEstadia = [
        "1 día (ida y vuelta)",
        "1 noche",
        "Fin de semana (2-3 días)",
        "Más de 3 días",
    ];

    $: if ($userStore.perfil) {
        nombre = $userStore.perfil.nombre || "";
        ubicacion = {
            pais: $userStore.perfil.pais || "",
            estado: $userStore.perfil.estado || "",
            municipio: $userStore.perfil.municipio || "",
        };
        rangoEdad = $userStore.perfil.rangoEdad || "";
        compania = $userStore.perfil.compania || "";
        estadia = $userStore.perfil.estadia || "";
        calificacion = $userStore.perfil.calificacion || 5;
    }

    function iniciarEdicion() {
        editando = true;
        mensaje = "";
    }

    function manejarCambioUbicacion(
        event: CustomEvent<{ pais: string; estado: string; municipio: string }>,
    ) {
        ubicacion = event.detail;
    }

    async function guardarCambios() {
        if (!nombre.trim() || !ubicacion.pais || !ubicacion.estado) {
            mensaje = "Por favor ingresa al menos tu nombre, país y estado.";
            return;
        }
        guardando = true;
        try {
            const perfilActualizado: DatosPerfil = {
                ...($userStore.perfil || {}),
                nombre: nombre.trim(),
                pais: ubicacion.pais,
                estado: ubicacion.estado,
                municipio: ubicacion.municipio,
                rangoEdad,
                compania,
                estadia,
                calificacion,
                actualizadoEn: new Date().toISOString(),
            };
            if ($userStore.uid) {
                await guardarDatosUsuario($userStore.uid, { perfil: perfilActualizado });
            }
            userStore.update((s) => ({ ...s, perfil: perfilActualizado }));
            editando = false;
            mensaje = "¡Tus datos han sido actualizados correctamente!";
        } catch (e) {
            mensaje = "Error al guardar los cambios. Intenta de nuevo.";
        } finally {
            guardando = false;
        }
    }

    function cancelarEdicion() {
        if ($userStore.perfil) {
            nombre = $userStore.perfil.nombre || "";
            ubicacion = {
                pais: $userStore.perfil.pais || "",
                estado: $userStore.perfil.estado || "",
                municipio: $userStore.perfil.municipio || "",
            };
            rangoEdad = $userStore.perfil.rangoEdad || "";
            compania = $userStore.perfil.compania || "";
            estadia = $userStore.perfil.estadia || "";
            calificacion = $userStore.perfil.calificacion || 5;
        }
        editando = false;
        mensaje = "";
    }
</script>

<div class="perfil">
    <!-- Header del Perfil -->
    <div class="perfil-top-bar">
        <a href="/" class="btn-regresar" title="Volver al pasaporte">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Pasaporte</span>
        </a>
        <span class="monedas-badge">🪙 {$userStore.monedas || 0} Monedas</span>
    </div>

    <div class="perfil-card">
        <div class="avatar-wrap">
            <div class="avatar-ring">
                <span class="avatar-icon">🏛️</span>
            </div>
            <h1 class="perfil-titulo">{nombre || "Explorador Aurense"}</h1>
            <p class="perfil-subtitulo">Credencial de Explorador Oficial</p>
        </div>

        {#if !$userStore.perfil && !editando}
            <div class="vacio-box">
                <p class="vacio-texto">
                    Aún no has registrado tus datos. Se te solicitarán de manera automática al obtener tus primeros sellos en monumentos o comercios aliados.
                </p>
                <a href="/" class="btn-ir-mapa">Explorar la Ruta 🗺️</a>
            </div>
        {:else}
            {#if !editando}
                <!-- Vista de Resumen -->
                <div class="datos-lista">
                    <div class="dato-fila">
                        <span class="dato-label">Nombre oficial:</span>
                        <span class="dato-valor">{nombre || "Sin registrar"}</span>
                    </div>
                    <div class="dato-fila">
                        <span class="dato-label">Origen:</span>
                        <span class="dato-valor">
                            {[ubicacion.municipio, ubicacion.estado, ubicacion.pais].filter(Boolean).join(", ") || "Sin registrar"}
                        </span>
                    </div>
                    {#if rangoEdad}
                        <div class="dato-fila">
                            <span class="dato-label">Rango de edad:</span>
                            <span class="dato-valor">{rangoEdad}</span>
                        </div>
                    {/if}
                    {#if compania}
                        <div class="dato-fila">
                            <span class="dato-label">Acompañamiento:</span>
                            <span class="dato-valor">{compania}</span>
                        </div>
                    {/if}
                    {#if estadia}
                        <div class="dato-fila">
                            <span class="dato-label">Estadía en El Oro:</span>
                            <span class="dato-valor">{estadia}</span>
                        </div>
                    {/if}
                    {#if calificacion}
                        <div class="dato-fila">
                            <span class="dato-label">Experiencia:</span>
                            <span class="dato-valor estrellas-texto">{"★".repeat(calificacion)}</span>
                        </div>
                    {/if}
                </div>

                <div class="acciones-centro">
                    <button class="btn-editar" on:click={iniciarEdicion}>
                        ✏️ Modificar mis datos
                    </button>
                </div>
            {:else}
                <!-- Formulario de Edición -->
                <div class="formulario">
                    <label class="campo">
                        <span>Nombre completo:</span>
                        <input type="text" bind:value={nombre} class="input-form" placeholder="Tu nombre" />
                    </label>

                    <SelectoresUbicacion
                        modo="completo"
                        paisInicial={ubicacion.pais}
                        estadoInicial={ubicacion.estado}
                        municipioInicial={ubicacion.municipio}
                        on:change={manejarCambioUbicacion}
                    />

                    <label class="campo">
                        <span>Rango de edad:</span>
                        <select bind:value={rangoEdad} class="input-form">
                            <option value="">Selecciona...</option>
                            {#each rangos as rango}
                                <option value={rango}>{rango}</option>
                            {/each}
                        </select>
                    </label>

                    <label class="campo">
                        <span>¿Con quién nos visitas?</span>
                        <select bind:value={compania} class="input-form">
                            <option value="">Selecciona...</option>
                            {#each opcionesCompania as comp}
                                <option value={comp}>{comp}</option>
                            {/each}
                        </select>
                    </label>

                    <label class="campo">
                        <span>Tiempo de estadía:</span>
                        <select bind:value={estadia} class="input-form">
                            <option value="">Selecciona...</option>
                            {#each opcionesEstadia as opt}
                                <option value={opt}>{opt}</option>
                            {/each}
                        </select>
                    </label>

                    <div class="acciones-form">
                        <button class="btn-guardar" on:click={guardarCambios} disabled={guardando}>
                            {guardando ? "Guardando..." : "💾 Guardar cambios"}
                        </button>
                        <button class="btn-cancelar" on:click={cancelarEdicion} disabled={guardando}>
                            Cancelar
                        </button>
                    </div>
                </div>
            {/if}

            {#if mensaje}
                <p class="mensaje-alerta" class:error={mensaje.includes("Error")}>
                    {mensaje}
                </p>
            {/if}
        {/if}
    </div>

    <p class="aviso-privacidad">
        🔒 <strong>Aviso de Privacidad:</strong> Tu información se almacena con cifrado y se utiliza exclusivamente con fines estadísticos para la mejora de los servicios turísticos de El Oro, Estado de México.
    </p>
</div>

<style>
    .perfil {
        max-width: 480px;
        margin: 0 auto;
        padding: 16px 14px 40px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        color: var(--text-primary, #F5E6C8);
    }

    .perfil-top-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .btn-regresar {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: var(--text-muted, #A08060);
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 600;
        padding: 6px 14px;
        border-radius: var(--radius-full, 999px);
        background: rgba(212, 160, 23, 0.08);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.3));
        transition: all 0.2s ease;
    }
    .btn-regresar:hover {
        background: rgba(212, 160, 23, 0.16);
        color: var(--gold-bright, #F2C94C);
    }

    .monedas-badge {
        font-family: 'Cinzel', serif;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--gold-bright, #F2C94C);
        background: rgba(242, 201, 76, 0.12);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.35));
        padding: 4px 10px;
        border-radius: 999px;
    }

    .perfil-card {
        background: linear-gradient(175deg, #251307 0%, #170904 100%);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.3));
        border-radius: 20px;
        padding: 24px 20px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
        gap: 18px;
    }

    .avatar-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 6px;
    }
    .avatar-ring {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(242, 201, 76, 0.25) 0%, rgba(212, 160, 23, 0.05) 70%);
        border: 2px solid var(--gold-bright, #F2C94C);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 20px rgba(242, 201, 76, 0.25);
    }
    .avatar-icon {
        font-size: 1.8rem;
    }
    .perfil-titulo {
        font-family: 'Cinzel', serif;
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--gold-bright, #F2C94C);
        margin: 0;
    }
    .perfil-subtitulo {
        font-size: 0.8rem;
        color: var(--text-muted, #A08060);
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .vacio-box {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        padding: 16px 0;
    }
    .vacio-texto {
        font-size: 0.88rem;
        color: var(--text-muted, #A08060);
        line-height: 1.5;
    }
    .btn-ir-mapa {
        padding: 10px 20px;
        background: linear-gradient(135deg, #F2C94C 0%, #D4A017 100%);
        color: #1A0D00;
        text-decoration: none;
        font-family: 'Cinzel', serif;
        font-weight: 700;
        font-size: 0.88rem;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(212, 160, 23, 0.35);
    }

    .datos-lista {
        display: flex;
        flex-direction: column;
        gap: 10px;
        border-top: 1px solid rgba(212, 160, 23, 0.15);
        border-bottom: 1px solid rgba(212, 160, 23, 0.15);
        padding: 14px 0;
    }
    .dato-fila {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.88rem;
    }
    .dato-label {
        color: var(--text-muted, #A08060);
        font-weight: 500;
    }
    .dato-valor {
        color: var(--text-primary, #F5E6C8);
        font-weight: 600;
        text-align: right;
    }
    .estrellas-texto {
        color: var(--gold-bright, #F2C94C);
        letter-spacing: 2px;
        font-size: 1.05rem;
    }

    .acciones-centro {
        display: flex;
        justify-content: center;
    }
    .btn-editar {
        background: rgba(212, 160, 23, 0.12);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.4));
        color: var(--gold-bright, #F2C94C);
        padding: 9px 20px;
        border-radius: 999px;
        cursor: pointer;
        font-size: 0.88rem;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    .btn-editar:hover {
        background: rgba(212, 160, 23, 0.25);
        transform: translateY(-1px);
    }

    .formulario {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .campo {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 0.82rem;
        color: var(--text-muted, #A08060);
        font-weight: 500;
    }
    .input-form {
        width: 100%;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.22));
        border-radius: 10px;
        color: var(--text-primary, #F5E6C8);
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 0.9rem;
        outline: none;
        box-sizing: border-box;
    }
    .input-form:focus {
        border-color: var(--gold-mid, #D4A017);
        box-shadow: 0 0 0 3px rgba(212, 160, 23, 0.15);
    }
    select.input-form {
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4A017' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 14px center;
        padding-right: 36px;
    }
    select.input-form option {
        background: #1E1008;
        color: #F5E6C8;
    }

    .acciones-form {
        display: flex;
        gap: 10px;
        margin-top: 8px;
    }
    .btn-guardar,
    .btn-cancelar {
        flex: 1;
        padding: 11px 16px;
        border-radius: 12px;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
    }
    .btn-guardar {
        background: linear-gradient(135deg, #F2C94C 0%, #D4A017 100%);
        color: #1A0D00;
        box-shadow: 0 4px 12px rgba(212, 160, 23, 0.3);
    }
    .btn-cancelar {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-muted, #A08060);
    }

    .mensaje-alerta {
        text-align: center;
        font-size: 0.85rem;
        color: var(--success, #4CAF82);
        margin: 0;
    }
    .mensaje-alerta.error {
        color: var(--error, #E05252);
    }

    .aviso-privacidad {
        font-size: 0.76rem;
        color: var(--text-dim, #6B5040);
        line-height: 1.4;
        text-align: center;
        padding: 0 10px;
    }
</style>
