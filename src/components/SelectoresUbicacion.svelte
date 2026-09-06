<script lang="ts">
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    export let paisInicial: string = "México";
    export let estadoInicial: string = "";
    export let municipioInicial: string = "";
    export let modo: "completo" | "solo-pais-estado" | "solo-municipio" = "completo";

    const dispatch = createEventDispatcher();

    // Lista corta de países frecuentes
    const paisesFrecuentes = [
        "México",
        "Estados Unidos",
        "Canadá",
        "Colombia",
        "Argentina",
        "España",
        "Francia",
        "Alemania",
        "Japón",
        "Otro", // siempre al final
    ];

    // Datos de México
    let estadosMexico: { nombre: string; municipios_url: string }[] = [];
    let municipiosActuales: string[] = [];

    let paisSeleccionado: string = paisInicial || "México";
    let paisManual: string = ""; // solo cuando paisSeleccionado === 'Otro'
    let estadoSeleccionado: string = estadoInicial || "";
    let municipioSeleccionado: string = municipioInicial || "";
    let estadoOtro: string = estadoInicial || "";
    let municipioOtro: string = municipioInicial || "";

    $: if (paisInicial && paisInicial !== paisSeleccionado) {
        if (paisesFrecuentes.includes(paisInicial)) {
            paisSeleccionado = paisInicial;
        } else {
            paisSeleccionado = "Otro";
            paisManual = paisInicial;
        }
    }

    $: if (estadoInicial && estadoInicial !== estadoSeleccionado) {
        estadoSeleccionado = estadoInicial;
        if (paisSeleccionado === "México") {
            cargarMunicipios(estadoInicial);
        } else {
            estadoOtro = estadoInicial;
        }
    }

    $: if (municipioInicial && municipioInicial !== municipioSeleccionado) {
        municipioSeleccionado = municipioInicial;
        municipioOtro = municipioInicial;
    }

    // Reactividad explícita para que Svelte siempre re-emita cambios en cualquier input/select
    $: {
        const _p = paisSeleccionado;
        const _pm = paisManual;
        const _e = estadoSeleccionado;
        const _eo = estadoOtro;
        const _m = municipioSeleccionado;
        const _mo = municipioOtro;
        const _modo = modo;
        actualizarPadre();
    }

    function actualizarPadre() {
        const paisFinal =
            paisSeleccionado === "Otro" ? paisManual.trim() : paisSeleccionado;
        const datos = {
            pais: paisFinal,
            estado:
                paisSeleccionado === "México"
                    ? estadoSeleccionado.trim()
                    : estadoOtro.trim(),
            municipio:
                modo === "solo-pais-estado"
                    ? ""
                    : paisSeleccionado === "México"
                      ? municipioSeleccionado.trim()
                      : municipioOtro.trim(),
        };
        dispatch("change", datos);
    }

    function getPlaceholderCiudad(pais: string): string {
        switch (pais) {
            case "Estados Unidos":
                return "Ej. Los Ángeles, Chicago, Houston, Miami...";
            case "Canadá":
                return "Ej. Toronto, Montreal, Vancouver...";
            case "España":
                return "Ej. Madrid, Barcelona, Sevilla, Valencia...";
            case "Colombia":
                return "Ej. Bogotá, Medellín, Cali, Cartagena...";
            case "Argentina":
                return "Ej. Buenos Aires, Córdoba, Rosario...";
            case "Francia":
                return "Ej. París, Lyon, Marsella, Burdeos...";
            case "Alemania":
                return "Ej. Berlín, Múnich, Fráncfort...";
            case "Japón":
                return "Ej. Tokio, Kioto, Osaka...";
            default:
                return "Ej. Ciudad, provincia o región de origen";
        }
    }

    onMount(async () => {
        // Precargar estados de México
        try {
            const resp = await fetch("/data/estados-mexico.json");
            if (resp.ok) {
                estadosMexico = await resp.json();
                if (estadoSeleccionado && paisSeleccionado === "México") {
                    await cargarMunicipios(estadoSeleccionado);
                }
            }
        } catch (e) {
            console.warn("No se pudieron cargar los estados de México");
        }

        // Establecer valores iniciales desde props
        if (paisInicial) {
            if (paisesFrecuentes.includes(paisInicial)) {
                paisSeleccionado = paisInicial;
            } else {
                paisSeleccionado = "Otro";
                paisManual = paisInicial;
            }
            if (paisInicial === "México" && estadoInicial) {
                estadoSeleccionado = estadoInicial;
                await cargarMunicipios(estadoInicial);
                municipioSeleccionado = municipioInicial;
            } else if (paisInicial !== "México") {
                estadoOtro = estadoInicial;
                municipioOtro = municipioInicial;
            }
        }

        // Emisión inicial para que el padre tenga el país por defecto
        actualizarPadre();
    });

    async function cargarMunicipios(estadoNombre: string) {
        if (!estadosMexico || estadosMexico.length === 0) {
            try {
                const resp = await fetch("/data/estados-mexico.json");
                if (resp.ok) estadosMexico = await resp.json();
            } catch (e) {
                console.warn("Error cargando estados:", e);
            }
        }
        const estadoObj = estadosMexico.find((e) => e.nombre === estadoNombre);
        if (!estadoObj) return;
        try {
            const resp = await fetch(estadoObj.municipios_url);
            if (resp.ok) municipiosActuales = await resp.json();
            else municipiosActuales = [];
        } catch (e) {
            municipiosActuales = [];
        }
        if (municipioInicial && municipiosActuales.includes(municipioInicial)) {
            municipioSeleccionado = municipioInicial;
        }
    }

    function onPaisChange(event: Event) {
        paisSeleccionado = (event.target as HTMLSelectElement).value;
        estadoSeleccionado = "";
        municipioSeleccionado = "";
        estadoOtro = "";
        municipioOtro = "";
        if (paisSeleccionado !== "Otro") {
            paisManual = "";
        }
        actualizarPadre();
    }

    async function onEstadoChange(event: Event) {
        estadoSeleccionado = (event.target as HTMLSelectElement).value;
        municipioSeleccionado = "";
        actualizarPadre();
        if (estadoSeleccionado && paisSeleccionado === "México") {
            await cargarMunicipios(estadoSeleccionado);
        }
    }

    function onMunicipioChange(event: Event) {
        municipioSeleccionado = (event.target as HTMLSelectElement).value;
        actualizarPadre();
    }
</script>

<div class="selectores">
    {#if modo !== "solo-municipio"}
        <!-- Selector de País -->
        <label>
            <span>País de origen:</span>
            <select bind:value={paisSeleccionado} on:change={onPaisChange}>
                <option value="">Selecciona un país</option>
                {#each paisesFrecuentes as p}
                    <option value={p}>{p}</option>
                {/each}
            </select>
        </label>

        {#if paisSeleccionado === "Otro"}
            <label>
                <span>Especifica tu país:</span>
                <input
                    type="text"
                    bind:value={paisManual}
                    on:input={actualizarPadre}
                    placeholder="Ej. Italia, Chile, Costa Rica, etc."
                />
            </label>
        {/if}

        {#if paisSeleccionado === "México"}
            <!-- Estado (solo para México) -->
            <label>
                <span>Estado:</span>
                <select bind:value={estadoSeleccionado} on:change={onEstadoChange}>
                    <option value="">Selecciona un estado</option>
                    {#each estadosMexico as e}
                        <option value={e.nombre}>{e.nombre}</option>
                    {/each}
                </select>
            </label>
        {:else if paisSeleccionado}
            <!-- Ciudad o Región de origen para visitantes internacionales -->
            <label>
                <span>Ciudad o Región de origen:</span>
                <input
                    type="text"
                    bind:value={estadoOtro}
                    on:input={actualizarPadre}
                    placeholder={getPlaceholderCiudad(paisSeleccionado === "Otro" ? paisManual : paisSeleccionado)}
                />
            </label>
        {/if}
    {/if}

    {#if modo !== "solo-pais-estado"}
        <!-- Municipio (solo aplica si el país es México) -->
        {#if paisSeleccionado === "México"}
            {#if estadoSeleccionado}
                <label>
                    <span>Municipio o Alcaldía:</span>
                    <select
                        bind:value={municipioSeleccionado}
                        on:change={onMunicipioChange}
                    >
                        <option value="">Selecciona tu municipio</option>
                        {#each municipiosActuales as m}
                            <option value={m}>{m}</option>
                        {/each}
                    </select>
                </label>
            {:else if modo === "solo-municipio"}
                <p class="nota-estado">Por favor indica tu estado primero.</p>
            {/if}
        {/if}
    {/if}
</div>

<style>
    .selectores {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .selectores label {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 0.82rem;
        color: var(--text-muted, #A08060);
        font-weight: 500;
        margin: 0;
    }
    .nota-estado {
        font-size: 0.8rem;
        color: var(--text-dim, #6B5040);
        font-style: italic;
    }
    select,
    input[type="text"] {
        width: 100%;
        padding: 11px 13px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.22));
        border-radius: 10px;
        color: var(--text-primary, #F5E6C8);
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        outline: none;
        box-sizing: border-box;
    }
    select {
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4A017' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 14px center;
        padding-right: 36px;
    }
    select option {
        background: #1E1008;
        color: #F5E6C8;
    }
    input[type="text"]::placeholder {
        color: var(--text-dim, #6B5040);
    }
    select:focus,
    input[type="text"]:focus {
        border-color: var(--gold-mid, #D4A017);
        box-shadow: 0 0 0 3px rgba(212, 160, 23, 0.15);
        background: rgba(255, 255, 255, 0.07);
    }
</style>
