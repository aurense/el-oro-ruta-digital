<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import SelectoresUbicacion from "./SelectoresUbicacion.svelte";
    import type { DatosPerfil } from "../stores/user";

    export let visible: boolean = true;
    export let paso: 1 | 2 | 3 = 1;
    export let perfilExistente: DatosPerfil | null = null;

    const dispatch = createEventDispatcher();

    // ─── Estado Paso 1 ───────────────────────────────────────────────
    let nombre = perfilExistente?.nombre || "";
    let ubicacion = {
        pais: perfilExistente?.pais || "México",
        estado: perfilExistente?.estado || "",
        municipio: perfilExistente?.municipio || "",
    };
    let consentimiento = perfilExistente?.consentimiento ?? false;

    // ─── Estado Paso 2 ───────────────────────────────────────────────
    let rangoEdad = perfilExistente?.rangoEdad || "";
    let compania = perfilExistente?.compania || "";
    const rangosEdad = [
        "Menor de 18",
        "18-24",
        "25-34",
        "35-44",
        "45-54",
        "55-64",
        "65+",
    ];
    const opcionesCompania = [
        { id: "Solo", label: "Solo", icono: "👤" },
        { id: "Pareja", label: "En pareja", icono: "👫" },
        { id: "Familia", label: "En familia", icono: "👨‍👩‍👧" },
        { id: "Amigos", label: "Con amigos", icono: "👥" },
    ];

    // ─── Estado Paso 3 ───────────────────────────────────────────────
    let estadia = perfilExistente?.estadia || "";
    let nombreDiploma = perfilExistente?.nombre || nombre || "";
    let calificacion = perfilExistente?.calificacion || 5;

    const opcionesEstadia = [
        { id: "1 día (ida y vuelta)", label: "Solo por el día", detalle: "Ida y vuelta", icono: "⏱️" },
        { id: "1 noche", label: "1 noche", detalle: "Hospedaje local", icono: "🌙" },
        { id: "Fin de semana (2-3 días)", label: "Fin de semana", detalle: "2 a 3 días", icono: "🏕️" },
        { id: "Más de 3 días", label: "Estadía larga", detalle: "Más de 3 días", icono: "🏔️" },
    ];

    $: if (perfilExistente) {
        if (!nombre && perfilExistente.nombre) nombre = perfilExistente.nombre;
        if (!nombreDiploma && (perfilExistente.nombre || nombre)) {
            nombreDiploma = perfilExistente.nombre || nombre;
        }
        if (perfilExistente.pais) ubicacion.pais = perfilExistente.pais;
        if (perfilExistente.estado) ubicacion.estado = perfilExistente.estado;
        if (perfilExistente.municipio) ubicacion.municipio = perfilExistente.municipio;
        if (perfilExistente.rangoEdad) rangoEdad = perfilExistente.rangoEdad;
        if (perfilExistente.compania) compania = perfilExistente.compania;
        if (perfilExistente.estadia) estadia = perfilExistente.estadia;
    }

    function manejarCambioUbicacion(
        event: CustomEvent<{ pais: string; estado: string; municipio: string }>,
    ) {
        ubicacion = { ...event.detail };
    }

    // ─── Validaciones reactivas ──────────────────────────────────────
    $: validoPaso1 =
        Boolean(nombre && nombre.trim().length >= 2) &&
        Boolean(ubicacion && ubicacion.pais && ubicacion.pais.trim()) &&
        Boolean(ubicacion && ubicacion.estado && ubicacion.estado.trim()) &&
        Boolean(consentimiento);

    $: validoPaso2 =
        Boolean(rangoEdad) &&
        Boolean(compania) &&
        (ubicacion?.pais !== "México" || Boolean(ubicacion?.municipio && ubicacion.municipio.trim()));

    $: validoPaso3 =
        Boolean(estadia) &&
        Boolean(nombreDiploma && nombreDiploma.trim().length >= 2);

    $: formularioValido =
        paso === 1 ? validoPaso1 : paso === 2 ? validoPaso2 : validoPaso3;

    function enviar() {
        if (!formularioValido) return;

        if (paso === 1) {
            dispatch("save", {
                paso: 1,
                datos: {
                    nombre: nombre.trim(),
                    pais: ubicacion.pais,
                    estado: ubicacion.estado,
                    consentimiento,
                },
            });
        } else if (paso === 2) {
            dispatch("save", {
                paso: 2,
                datos: {
                    municipio: ubicacion.municipio,
                    rangoEdad,
                    compania,
                },
            });
        } else if (paso === 3) {
            dispatch("save", {
                paso: 3,
                datos: {
                    nombre: nombreDiploma.trim(),
                    estadia,
                    calificacion,
                },
            });
        }
    }
</script>

{#if visible}
    <div
        class="dataform-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dataform-titulo"
    >
        <div class="dataform-panel">
            <!-- Indicador de etapa RPG -->
            <div class="etapa-badge">
                <span class="etapa-pips">
                    <span class="pip activo"></span>
                    <span class="pip" class:activo={paso >= 2}></span>
                    <span class="pip" class:activo={paso >= 3}></span>
                </span>
                <span class="etapa-texto">Paso {paso} de 3</span>
            </div>

            <!-- Encabezado con emblema temático -->
            <div class="dataform-header">
                <div class="dataform-icono-wrap">
                    {#if paso === 1}
                        <!-- Emblema de Pico y Medalla -->
                        <svg class="dataform-emblema" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <circle cx="12" cy="8.5" r="5.5" fill="rgba(242, 201, 76, 0.25)" />
                            <path d="M12 6v5" />
                            <path d="M9.5 8.5h5" />
                            <path d="M8.2 13.5L6 22l6-3 6 3-2.2-8.5" />
                        </svg>
                    {:else if paso === 2}
                        <!-- Emblema de Censo y Gremio -->
                        <svg class="dataform-emblema" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" fill="rgba(242, 201, 76, 0.25)" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    {:else}
                        <!-- Emblema de Cédula de Honor / Diploma -->
                        <svg class="dataform-emblema" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="rgba(242, 201, 76, 0.28)" />
                        </svg>
                    {/if}
                </div>

                {#if paso === 1}
                    <h2 id="dataform-titulo" class="dataform-titulo">Credencial de Explorador</h2>
                    <p class="dataform-subtitulo">
                        ¡Tu primer sello en El Oro! Cuéntanos tu nombre y de dónde nos visitas para expedir tu pasaporte.
                    </p>
                {:else if paso === 2}
                    <h2 id="dataform-titulo" class="dataform-titulo">Censo del Gremio Aurense</h2>
                    <p class="dataform-subtitulo">
                        ¡Avanzas con honores! Completa tu registro de viajero para enriquecer la memoria de la Villa.
                    </p>
                {:else}
                    <h2 id="dataform-titulo" class="dataform-titulo">Cédula de Honor</h2>
                    <p class="dataform-subtitulo">
                        Último paso para validar tu récord y preparar tu Diploma de Gran Ciudadano Aurense.
                    </p>
                {/if}
            </div>

            <!-- Formulario dinámico por paso -->
            <div class="dataform-cuerpo">
                {#if paso === 1}
                    <!-- ─── PASO 1: Nombre + País/Estado + Consentimiento ─── -->
                    <label class="campo-label">
                        <span>¿Cómo te llamas? (Nombre de explorador):</span>
                        <input
                            type="text"
                            bind:value={nombre}
                            placeholder="Ej. Sofía Hernández"
                            class="input-texto"
                            maxlength="45"
                            autocomplete="name"
                        />
                    </label>

                    <SelectoresUbicacion
                        modo="solo-pais-estado"
                        paisInicial={ubicacion.pais}
                        estadoInicial={ubicacion.estado}
                        on:change={manejarCambioUbicacion}
                    />

                    <div class="consentimiento-bloque">
                        <label class="checkbox-label" for="consentimiento-check">
                            <input
                                id="consentimiento-check"
                                type="checkbox"
                                bind:checked={consentimiento}
                            />
                            <span class="checkbox-custom" aria-hidden="true"></span>
                            <span class="checkbox-texto">
                                Autorizo el uso de estos datos estadísticos de forma anónima para la promoción turística de El Oro.
                            </span>
                        </label>
                    </div>

                {:else if paso === 2}
                    <!-- ─── PASO 2: Municipio (solo México) + Rango de Edad + Compañía ─── -->
                    {#if ubicacion.pais === "México"}
                        <div class="estado-origen-chip">
                            📍 Estado registrado: <strong>{ubicacion.estado || "México"}</strong>
                        </div>
                        <SelectoresUbicacion
                            modo="solo-municipio"
                            paisInicial={ubicacion.pais}
                            estadoInicial={ubicacion.estado}
                            municipioInicial={ubicacion.municipio}
                            on:change={manejarCambioUbicacion}
                        />
                    {:else}
                        <div class="estado-origen-chip">
                            🌍 Origen registrado: <strong>{ubicacion.estado ? `${ubicacion.estado}, ${ubicacion.pais}` : ubicacion.pais}</strong>
                        </div>
                    {/if}

                    <label class="campo-label">
                        <span>Rango de edad:</span>
                        <select bind:value={rangoEdad} class="input-select">
                            <option value="">Selecciona tu rango de edad</option>
                            {#each rangosEdad as r}
                                <option value={r}>{r}</option>
                            {/each}
                        </select>
                    </label>

                    <div class="campo-label">
                        <span>¿Con quién nos visitas?</span>
                        <div class="chips-grid">
                            {#each opcionesCompania as comp}
                                <button
                                    type="button"
                                    class="chip-btn"
                                    class:chip-activo={compania === comp.id}
                                    on:click={() => (compania = comp.id)}
                                >
                                    <span class="chip-icono">{comp.icono}</span>
                                    <span class="chip-label">{comp.label}</span>
                                </button>
                            {/each}
                        </div>
                    </div>

                {:else}
                    <!-- ─── PASO 3: Estadía + Confirmación de Nombre + Calificación ─── -->
                    <div class="campo-label">
                        <span>¿Cuánto tiempo estarás en El Oro?</span>
                        <div class="estadia-grid">
                            {#each opcionesEstadia as opt}
                                <button
                                    type="button"
                                    class="estadia-card"
                                    class:estadia-activo={estadia === opt.id}
                                    on:click={() => (estadia = opt.id)}
                                >
                                    <span class="estadia-icono">{opt.icono}</span>
                                    <div class="estadia-info">
                                        <span class="estadia-titulo">{opt.label}</span>
                                        <span class="estadia-sub">{opt.detalle}</span>
                                    </div>
                                </button>
                            {/each}
                        </div>
                    </div>

                    <label class="campo-label">
                        <span>Nombre oficial para tu Diploma de Honor:</span>
                        <input
                            type="text"
                            bind:value={nombreDiploma}
                            placeholder="Nombre como aparecerá en el diploma"
                            class="input-texto"
                            maxlength="50"
                        />
                        <span class="campo-ayuda">Se imprimirá en letras doradas en tu Cédula de Gran Ciudadano.</span>
                    </label>

                    <div class="campo-label calificacion-bloque">
                        <span>¿Qué te ha parecido la experiencia en El Oro?</span>
                        <div class="estrellas-wrap">
                            {#each [1, 2, 3, 4, 5] as estrella}
                                <button
                                    type="button"
                                    class="estrella-btn"
                                    class:estrella-activa={estrella <= calificacion}
                                    on:click={() => (calificacion = estrella)}
                                    aria-label="{estrella} estrellas"
                                >
                                    ★
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Botón de acción -->
            <div class="dataform-footer">
                <button
                    class="btn-continuar"
                    disabled={!formularioValido}
                    on:click={enviar}
                >
                    {#if paso === 1}
                        Grabar Credencial y Reclamar Sello ⛏️
                    {:else if paso === 2}
                        Actualizar Censo y Reclamar Sello ✨
                    {:else}
                        Consagrar Datos y Reclamar Sello 🏆
                    {/if}
                </button>
                {#if !formularioValido && paso === 1}
                    <p class="pista-bloqueo">
                        {#if !nombre || nombre.trim().length < 2}
                            ✏️ Ingresa tu nombre (mínimo 2 letras)
                        {:else if !ubicacion?.pais || !ubicacion?.estado}
                            📍 Selecciona tu {ubicacion?.pais === 'México' ? 'estado' : 'ciudad'} de procedencia
                        {:else if !consentimiento}
                            ☑️ Marca la casilla de autorización para continuar
                        {/if}
                    </p>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    /* Overlay modal oscuro */
    .dataform-overlay {
        position: fixed;
        inset: 0;
        background: rgba(10, 4, 3, 0.88);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        box-sizing: border-box;
        animation: fadeIn 0.25s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    /* Panel contenedor */
    .dataform-panel {
        background: linear-gradient(175deg, #251307 0%, #170904 100%);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.35));
        border-radius: 20px;
        padding: 22px 20px;
        width: 100%;
        max-width: 440px;
        max-height: 90dvh;
        overflow-y: auto;
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.75), 0 0 24px rgba(212, 160, 23, 0.15);
        color: var(--text-primary, #F5E6C8);
        display: flex;
        flex-direction: column;
        gap: 16px;
        position: relative;
    }

    /* Indicador de etapas */
    .etapa-badge {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 6px;
        border-bottom: 1px solid rgba(212, 160, 23, 0.12);
    }
    .etapa-pips {
        display: flex;
        gap: 6px;
        align-items: center;
    }
    .pip {
        width: 24px;
        height: 4px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
    }
    .pip.activo {
        background: var(--gold-bright, #F2C94C);
        box-shadow: 0 0 8px rgba(242, 201, 76, 0.6);
    }
    .etapa-texto {
        font-family: 'Inter', sans-serif;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--gold-bright, #F2C94C);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    /* Encabezado */
    .dataform-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 8px;
    }
    .dataform-icono-wrap {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(242, 201, 76, 0.2) 0%, rgba(212, 160, 23, 0.05) 70%);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.4));
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 16px rgba(212, 160, 23, 0.2);
    }
    .dataform-emblema {
        width: 28px;
        height: 28px;
        color: var(--gold-bright, #F2C94C);
    }
    .dataform-titulo {
        font-family: 'Cinzel', serif;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--gold-bright, #F2C94C);
        margin: 0;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
    }
    .dataform-subtitulo {
        font-family: 'Inter', sans-serif;
        font-size: 0.84rem;
        color: var(--text-muted, #A08060);
        margin: 0;
        line-height: 1.4;
    }

    /* Cuerpo del formulario */
    .dataform-cuerpo {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .campo-label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.84rem;
        color: var(--text-muted, #A08060);
        font-weight: 500;
    }

    .input-texto,
    .input-select {
        width: 100%;
        padding: 11px 13px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.22));
        border-radius: 10px;
        color: var(--text-primary, #F5E6C8);
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 0.92rem;
        transition: all 0.2s ease;
        outline: none;
        box-sizing: border-box;
    }
    .input-texto:focus,
    .input-select:focus {
        border-color: var(--gold-mid, #D4A017);
        box-shadow: 0 0 0 3px rgba(212, 160, 23, 0.15);
        background: rgba(255, 255, 255, 0.07);
    }
    .input-texto::placeholder {
        color: var(--text-dim, #6B5040);
    }
    .input-select {
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4A017' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 14px center;
        padding-right: 36px;
    }
    .input-select option {
        background: #1E1008;
        color: #F5E6C8;
    }

    .campo-ayuda {
        font-size: 0.75rem;
        color: var(--text-dim, #6B5040);
        font-style: italic;
    }

    .estado-origen-chip {
        font-size: 0.8rem;
        padding: 7px 12px;
        background: rgba(212, 160, 23, 0.1);
        border: 1px solid rgba(212, 160, 23, 0.2);
        border-radius: 8px;
        color: var(--amber-light, #F5C87A);
    }

    /* Chips de Acompañamiento */
    .chips-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }
    .chip-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(212, 160, 23, 0.18);
        border-radius: 10px;
        color: var(--text-primary, #F5E6C8);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
    }
    .chip-btn:hover {
        background: rgba(212, 160, 23, 0.1);
        border-color: var(--gold-mid, #D4A017);
    }
    .chip-btn.chip-activo {
        background: rgba(242, 201, 76, 0.18);
        border-color: var(--gold-bright, #F2C94C);
        box-shadow: 0 0 10px rgba(242, 201, 76, 0.2);
    }
    .chip-icono {
        font-size: 1.15rem;
    }
    .chip-label {
        font-size: 0.85rem;
        font-weight: 500;
    }

    /* Cards de Estadía */
    .estadia-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }
    .estadia-card {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 10px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(212, 160, 23, 0.18);
        border-radius: 10px;
        color: var(--text-primary, #F5E6C8);
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
    }
    .estadia-card:hover {
        background: rgba(212, 160, 23, 0.1);
        border-color: var(--gold-mid, #D4A017);
    }
    .estadia-card.estadia-activo {
        background: rgba(242, 201, 76, 0.18);
        border-color: var(--gold-bright, #F2C94C);
        box-shadow: 0 0 10px rgba(242, 201, 76, 0.2);
    }
    .estadia-icono {
        font-size: 1.15rem;
    }
    .estadia-info {
        display: flex;
        flex-direction: column;
    }
    .estadia-titulo {
        font-size: 0.8rem;
        font-weight: 600;
    }
    .estadia-sub {
        font-size: 0.7rem;
        color: var(--text-muted, #A08060);
    }

    /* Calificación con estrellas */
    .calificacion-bloque {
        align-items: center;
        text-align: center;
        margin-top: 4px;
    }
    .estrellas-wrap {
        display: flex;
        gap: 8px;
        justify-content: center;
        margin-top: 4px;
    }
    .estrella-btn {
        background: transparent;
        border: none;
        font-size: 1.8rem;
        color: rgba(255, 255, 255, 0.15);
        cursor: pointer;
        transition: transform 0.15s, color 0.15s;
        line-height: 1;
        padding: 2px 4px;
    }
    .estrella-btn:hover {
        transform: scale(1.2);
    }
    .estrella-btn.estrella-activa {
        color: var(--gold-bright, #F2C94C);
        text-shadow: 0 0 12px rgba(242, 201, 76, 0.6);
    }

    /* Checkbox de consentimiento */
    .consentimiento-bloque {
        margin-top: 2px;
    }
    .checkbox-label {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        cursor: pointer;
        font-size: 0.78rem;
        color: var(--text-muted, #A08060);
        line-height: 1.35;
        position: relative;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
    }
    .checkbox-label input {
        position: absolute;
        opacity: 0;
        width: 1px;
        height: 1px;
        margin: -1px;
        pointer-events: none;
    }
    .checkbox-custom {
        width: 18px;
        height: 18px;
        border-radius: 5px;
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.4));
        background: rgba(255, 255, 255, 0.05);
        flex-shrink: 0;
        margin-top: 1px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    .checkbox-label input:checked + .checkbox-custom {
        background: var(--gold-bright, #F2C94C);
        border-color: var(--gold-bright, #F2C94C);
        box-shadow: 0 0 8px rgba(242, 201, 76, 0.5);
    }
    .checkbox-label input:checked + .checkbox-custom::after {
        content: "✓";
        color: #12090A;
        font-weight: 900;
        font-size: 0.75rem;
    }

    .pista-bloqueo {
        margin-top: 8px;
        text-align: center;
        font-size: 0.76rem;
        color: var(--amber-light, #F5C87A);
        background: rgba(212, 160, 23, 0.08);
        border: 1px solid rgba(212, 160, 23, 0.15);
        padding: 5px 10px;
        border-radius: 8px;
        animation: fadeIn 0.2s ease;
    }

    /* Footer y botón */
    .dataform-footer {
        margin-top: 6px;
    }
    .btn-continuar {
        width: 100%;
        padding: 13px 18px;
        background: linear-gradient(135deg, #F2C94C 0%, #D4A017 100%);
        border: none;
        border-radius: 12px;
        color: #1A0D00;
        font-family: 'Cinzel', serif;
        font-size: 0.92rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 18px rgba(212, 160, 23, 0.35);
        transition: all 0.2s ease;
    }
    .btn-continuar:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(242, 201, 76, 0.5);
    }
    .btn-continuar:active:not(:disabled) {
        transform: translateY(0);
    }
    .btn-continuar:disabled {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.25);
        box-shadow: none;
        cursor: not-allowed;
    }
</style>
