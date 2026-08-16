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
    /* ─── Overlay ────────────────────────────────────────────────── */
    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(10, 5, 2, 0.80);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 16px;
    }

    /* ─── Panel del modal ────────────────────────────────────────── */
    .modal {
        background: linear-gradient(160deg, #1E1008 0%, #2A1A0A 100%);
        border: 1px solid rgba(212, 160, 23, 0.40);
        border-radius: 22px;
        padding: 28px 24px 24px;
        max-width: 420px;
        width: 100%;
        box-shadow:
            0 0 0 1px rgba(212, 160, 23, 0.06),
            0 24px 60px rgba(0, 0, 0, 0.7),
            0 0 48px rgba(212, 160, 23, 0.06);
        animation: entrar-modal 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes entrar-modal {
        from { opacity: 0; transform: scale(0.88) translateY(16px); }
        to   { opacity: 1; transform: scale(1)    translateY(0); }
    }

    /* ─── Encabezado ─────────────────────────────────────────────── */
    .modal h2 {
        font-family: 'Cinzel', serif;
        font-size: 1.15rem;
        font-weight: 700;
        margin: 0 0 8px;
        background: linear-gradient(135deg, #F2C94C, #D4A017);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    .modal > p {
        font-size: 0.82rem;
        color: #A08060;
        line-height: 1.6;
        margin: 0 0 18px;
    }

    /* ─── Labels ─────────────────────────────────────────────────── */
    label {
        display: block;
        margin: 14px 0 0;
        font-size: 0.8rem;
        color: #A08060;
        font-weight: 500;
    }

    /* ─── Select ─────────────────────────────────────────────────── */
    select {
        display: block;
        width: 100%;
        margin-top: 6px;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(212, 160, 23, 0.22);
        border-radius: 10px;
        color: #F5E6C8;
        font-family: 'Inter', sans-serif;
        font-size: 0.875rem;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23A08060' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        padding-right: 32px;
        transition: border-color 0.2s;
    }
    select:focus {
        outline: none;
        border-color: rgba(212, 160, 23, 0.55);
        box-shadow: 0 0 0 3px rgba(212, 160, 23, 0.08);
    }
    select option {
        background: #1E1008;
        color: #F5E6C8;
    }

    /* ─── Checkbox de consentimiento ─────────────────────────────── */
    .consent {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin: 18px 0 20px;
        cursor: pointer;
    }
    .consent input[type="checkbox"] {
        width: 18px;
        height: 18px;
        min-width: 18px;
        margin-top: 1px;
        accent-color: #D4A017;
        cursor: pointer;
        border-radius: 4px;
    }
    .consent small {
        font-size: 0.76rem;
        color: #A08060;
        line-height: 1.5;
    }

    /* ─── Botón CTA ──────────────────────────────────────────────── */
    button[type="button"],
    button:not([type]) {
        width: 100%;
        padding: 13px;
        border-radius: 999px;
        border: none;
        background: linear-gradient(135deg, #D4A017, #F2C94C);
        color: #12090A;
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 16px rgba(212, 160, 23, 0.35);
        margin-top: 4px;
    }
    button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(212, 160, 23, 0.5);
    }
    button:active:not(:disabled) {
        transform: translateY(0);
    }
    button:disabled {
        background: rgba(255, 255, 255, 0.07);
        color: #6B5040;
        border: 1px solid rgba(212, 160, 23, 0.12);
        box-shadow: none;
        cursor: not-allowed;
    }
</style>
