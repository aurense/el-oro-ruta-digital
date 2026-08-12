<script lang="ts">
    import SelectoresUbicacion from "./SelectoresUbicacion.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let rangoEdad = "";
    let consentimiento = false;
    let ubicacion = { pais: "", estado: "", municipio: "" };

    const rangos = [
        "Menor de 18",
        "18-24",
        "25-34",
        "35-44",
        "45-54",
        "55-64",
        "65+",
    ];

    function manejarCambioUbicacion(
        event: CustomEvent<{ pais: string; estado: string; municipio: string }>,
    ) {
        ubicacion = event.detail;
    }

    function enviar() {
        if (
            !ubicacion.pais ||
            !ubicacion.estado ||
            !ubicacion.municipio ||
            !rangoEdad ||
            !consentimiento
        )
            return;
        dispatch("save", {
            pais: ubicacion.pais,
            estado: ubicacion.estado,
            municipio: ubicacion.municipio,
            rangoEdad,
        });
    }

    $: formularioValido =
        ubicacion.pais &&
        ubicacion.estado &&
        ubicacion.municipio &&
        rangoEdad &&
        consentimiento;
</script>

<div class="overlay">
    <div class="modal">
        <h2>🏅 ¡Primer sello!</h2>
        <p>
            Para guardar tu logro, necesitamos algunos datos anónimos. Podrás
            modificarlos después en tu perfil.
        </p>

        <SelectoresUbicacion on:change={manejarCambioUbicacion} />

        <label>
            Rango de edad:
            <select bind:value={rangoEdad}>
                <option value="">Selecciona...</option>
                {#each rangos as rango}
                    <option value={rango}>{rango}</option>
                {/each}
            </select>
        </label>

        <label class="consent">
            <input type="checkbox" bind:checked={consentimiento} />
            <small
                >Usamos esta información solo para estadísticas turísticas. No
                compartimos tus datos.</small
            >
        </label>

        <button on:click={enviar} disabled={!formularioValido}>
            Guardar y obtener sello
        </button>
    </div>
</div>

<style>
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }
    .modal {
        background: white;
        padding: 25px;
        border-radius: 12px;
        max-width: 420px;
        width: 90%;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
    label {
        display: block;
        margin: 12px 0 5px;
    }
    select,
    input {
        width: 100%;
        padding: 8px;
        margin-top: 4px;
        border: 1px solid #ccc;
        border-radius: 6px;
    }
    .consent {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 15px 0;
    }
    .consent input {
        width: auto;
    }
    button {
        background: #8b5a2b;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        width: 100%;
        font-size: 1rem;
    }
    button:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
</style>
