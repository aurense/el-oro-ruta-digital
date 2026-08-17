<script lang="ts">
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    export let paisInicial: string = "";
    export let estadoInicial: string = "";
    export let municipioInicial: string = "";

    const dispatch = createEventDispatcher();

    // Lista corta de países frecuentes (puedes ajustarla según datos reales de visitantes)
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

    // Datos de México (se cargan igual que antes)
    let estadosMexico: { nombre: string; municipios_url: string }[] = [];
    let municipiosActuales: string[] = [];

    let paisSeleccionado: string = "";
    let paisManual: string = ""; // solo cuando paisSeleccionado === 'Otro'
    let estadoSeleccionado: string = "";
    let municipioSeleccionado: string = "";
    let estadoOtro: string = "";
    let municipioOtro: string = "";

    $: actualizarPadre();

    function actualizarPadre() {
        const paisFinal =
            paisSeleccionado === "Otro" ? paisManual : paisSeleccionado;
        const datos = {
            pais: paisFinal,
            estado:
                paisSeleccionado === "México" ? estadoSeleccionado : estadoOtro,
            municipio:
                paisSeleccionado === "México"
                    ? municipioSeleccionado
                    : municipioOtro,
        };
        dispatch("change", datos);
    }

    onMount(async () => {
        // Precargar estados de México
        try {
            const resp = await fetch("/data/estados-mexico.json");
            if (resp.ok) estadosMexico = await resp.json();
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
    });

    async function cargarMunicipios(estadoNombre: string) {
        const estadoObj = estadosMexico.find((e) => e.nombre === estadoNombre);
        if (!estadoObj) return;
        try {
            const resp = await fetch(estadoObj.municipios_url);
            if (resp.ok) municipiosActuales = await resp.json();
            else municipiosActuales = [];
        } catch (e) {
            municipiosActuales = [];
        }
        // Mantener selección si corresponde
        if (municipioInicial && municipiosActuales.includes(municipioInicial)) {
            municipioSeleccionado = municipioInicial;
        } else {
            municipioSeleccionado = "";
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
        if (paisSeleccionado === "México") {
            // estadosMexico ya cargados
        }
    }

    async function onEstadoChange(event: Event) {
        estadoSeleccionado = (event.target as HTMLSelectElement).value;
        municipioSeleccionado = "";
        if (estadoSeleccionado) {
            await cargarMunicipios(estadoSeleccionado);
        }
    }
</script>

<div class="selectores">
    <!-- País -->
    <label>
        País:
        <select value={paisSeleccionado} on:change={onPaisChange}>
            <option value="">Selecciona un país</option>
            {#each paisesFrecuentes as p}
                <option value={p}>{p}</option>
            {/each}
        </select>
    </label>

    {#if paisSeleccionado === "Otro"}
        <label>
            Especifica tu país:
            <input
                type="text"
                bind:value={paisManual}
                on:input={actualizarPadre}
                placeholder="Ej. Italia"
            />
        </label>
    {/if}

    {#if paisSeleccionado === "México"}
        <!-- Estado -->
        <label>
            Estado:
            <select value={estadoSeleccionado} on:change={onEstadoChange}>
                <option value="">Selecciona un estado</option>
                {#each estadosMexico as e}
                    <option value={e.nombre}>{e.nombre}</option>
                {/each}
            </select>
        </label>

        <!-- Municipio -->
        {#if estadoSeleccionado}
            <label>
                Municipio:
                <select
                    bind:value={municipioSeleccionado}
                    on:change={actualizarPadre}
                >
                    <option value="">Selecciona un municipio</option>
                    {#each municipiosActuales as m}
                        <option value={m}>{m}</option>
                    {/each}
                </select>
            </label>
        {/if}
    {:else if paisSeleccionado && paisSeleccionado !== "Otro"}
        <!-- País predefinido que no es México -->
        <label>
            Estado / Provincia:
            <input
                type="text"
                bind:value={estadoOtro}
                on:input={actualizarPadre}
                placeholder="Ej. California"
            />
        </label>
        <label>
            Ciudad / Municipio:
            <input
                type="text"
                bind:value={municipioOtro}
                on:input={actualizarPadre}
                placeholder="Ej. Los Ángeles"
            />
        </label>
    {:else if paisSeleccionado === "Otro" && paisManual}
        <!-- Si se escribió manualmente el país, mostramos campos de texto para estado y ciudad -->
        <label>
            Estado / Provincia:
            <input
                type="text"
                bind:value={estadoOtro}
                on:input={actualizarPadre}
                placeholder="Región"
            />
        </label>
        <label>
            Ciudad / Municipio:
            <input
                type="text"
                bind:value={municipioOtro}
                on:input={actualizarPadre}
                placeholder="Ciudad"
            />
        </label>
    {/if}
</div>

<style>
    .selectores {
        display: flex;
        flex-direction: column;
        gap: 10px;
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
    select,
    input[type="text"] {
        width: 100%;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.22));
        border-radius: 10px;
        color: var(--text-primary, #F5E6C8);
        font-family: 'Inter', system-ui, sans-serif;
        font-size: 0.88rem;
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
        background-position: right 12px center;
        padding-right: 32px;
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
        box-shadow: 0 0 0 3px rgba(212, 160, 23, 0.12);
        background: rgba(255, 255, 255, 0.07);
    }
</style>
