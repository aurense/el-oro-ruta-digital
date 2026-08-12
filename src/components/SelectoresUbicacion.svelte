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
    .selectores label {
        display: block;
        margin: 12px 0;
    }
    select,
    input {
        width: 100%;
        padding: 8px;
        margin-top: 4px;
        border: 1px solid #ccc;
        border-radius: 6px;
    }
</style>
