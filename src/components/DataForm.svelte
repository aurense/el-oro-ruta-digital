<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import SelectoresUbicacion from "./SelectoresUbicacion.svelte";

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
        ) {
            return;
        }
        dispatch("save", {
            pais: ubicacion.pais,
            estado: ubicacion.estado,
            municipio: ubicacion.municipio,
            rangoEdad,
        });
    }

    $: formularioValido =
        Boolean(ubicacion.pais) &&
        Boolean(ubicacion.estado) &&
        Boolean(ubicacion.municipio) &&
        Boolean(rangoEdad) &&
        consentimiento;
</script>

<div
    class="dataform-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dataform-titulo"
>
    <div class="dataform-panel">
        <!-- Encabezado con insignia / medalla -->
        <div class="dataform-header">
            <div class="dataform-icono-wrap">
                <svg
                    class="dataform-emblema"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <circle
                        cx="12"
                        cy="8.5"
                        r="5.5"
                        fill="rgba(242, 201, 76, 0.25)"
                    />
                    <path d="M12 6v5" />
                    <path d="M9.5 8.5h5" />
                    <path d="M8.2 13.5L6 22l6-3 6 3-2.2-8.5" />
                </svg>
            </div>
            <h2 id="dataform-titulo" class="dataform-titulo">¡Primer Sello Minero!</h2>
            <p class="dataform-subtitulo">
                Para registrar tu visita y sellar tu pasaporte, cuéntanos un poco sobre tu origen.
            </p>
        </div>

        <!-- Formulario -->
        <div class="dataform-cuerpo">
            <SelectoresUbicacion on:change={manejarCambioUbicacion} />

            <label class="campo-label">
                <span>Rango de edad:</span>
                <select bind:value={rangoEdad}>
                    <option value="">Selecciona tu rango de edad</option>
                    {#each rangos as rango}
                        <option value={rango}>{rango}</option>
                    {/each}
                </select>
            </label>

            <label class="consent">
                <input type="checkbox" bind:checked={consentimiento} />
                <small>
                    Usamos esta información únicamente con fines estadísticos para el turismo en El Oro. No recopilamos datos personales.
                </small>
            </label>
        </div>

        <!-- Acción -->
        <button
            class="btn-guardar"
            on:click={enviar}
            disabled={!formularioValido}
            type="button"
        >
            <svg
                class="btn-check-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Guardar y desbloquear sello</span>
        </button>
    </div>
</div>

<style>
    /* ─── Overlay garantizado para producción / móviles ───────────── */
    .dataform-overlay {
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(10, 5, 2, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        box-sizing: border-box;
    }

    /* ─── Panel central ──────────────────────────────────────────── */
    .dataform-panel {
        position: relative;
        z-index: 2;
        background: linear-gradient(
            160deg,
            var(--bg-card, #1e1008) 0%,
            #2a1a0a 100%
        );
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.35));
        border-radius: var(--radius-lg, 22px);
        padding: 24px 20px 22px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-width: min(92vw, 440px);
        width: 100%;
        max-height: min(90vh, 650px);
        overflow-y: auto;
        box-sizing: border-box;
        box-shadow:
            0 0 0 1px rgba(212, 160, 23, 0.08),
            0 24px 60px rgba(0, 0, 0, 0.8),
            0 0 50px rgba(212, 160, 23, 0.1);
        animation: entrar-modal 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    @keyframes entrar-modal {
        from {
            opacity: 0;
            transform: scale(0.92) translateY(16px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }

    /* ─── Encabezado ─────────────────────────────────────────────── */
    .dataform-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        border-bottom: 1px solid var(--border-dim, rgba(212, 160, 23, 0.12));
        padding-bottom: 12px;
    }
    .dataform-icono-wrap {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: rgba(212, 160, 23, 0.12);
        border: 1px solid var(--border-gold, rgba(212, 160, 23, 0.35));
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 8px;
        color: var(--gold-bright, #f2c94c);
        box-shadow: 0 0 16px rgba(212, 160, 23, 0.2);
    }
    .dataform-emblema {
        width: 26px;
        height: 26px;
    }
    .dataform-titulo {
        font-family: "Cinzel", serif;
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0 0 6px;
        background: linear-gradient(
            135deg,
            var(--gold-bright, #f2c94c),
            var(--gold-mid, #d4a017)
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: 0.5px;
    }
    .dataform-subtitulo {
        font-size: 0.82rem;
        color: var(--text-muted, #a08060);
        line-height: 1.5;
        margin: 0;
        padding: 0 4px;
    }

    /* ─── Cuerpo del Formulario ──────────────────────────────────── */
    .dataform-cuerpo {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .campo-label {
        display: flex;
        flex-direction: column;
        gap: 5px;
        font-size: 0.82rem;
        color: var(--text-muted, #a08060);
        font-weight: 500;
    }

    /* ─── Selects ────────────────────────────────────────────────── */
    select {
        width: 100%;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.22));
        border-radius: 10px;
        color: var(--text-primary, #f5e6c8);
        font-family: "Inter", system-ui, sans-serif;
        font-size: 0.88rem;
        cursor: pointer;
        outline: none;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4A017' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 12px center;
        padding-right: 32px;
        transition: all 0.2s ease;
        box-sizing: border-box;
    }
    select:focus {
        border-color: var(--gold-mid, #d4a017);
        box-shadow: 0 0 0 3px rgba(212, 160, 23, 0.12);
        background: rgba(255, 255, 255, 0.07);
    }
    select option {
        background: #1e1008;
        color: #f5e6c8;
    }

    /* ─── Checkbox de consentimiento ─────────────────────────────── */
    .consent {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-top: 4px;
        cursor: pointer;
        padding: 8px 10px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--border-dim, rgba(212, 160, 23, 0.1));
        box-sizing: border-box;
    }
    .consent input[type="checkbox"] {
        width: 17px;
        height: 17px;
        min-width: 17px;
        margin-top: 2px;
        accent-color: var(--gold-mid, #d4a017);
        cursor: pointer;
        border-radius: 4px;
    }
    .consent small {
        font-size: 0.75rem;
        color: var(--text-muted, #a08060);
        line-height: 1.4;
    }

    /* ─── Botón Guardar ──────────────────────────────────────────── */
    .btn-guardar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        padding: 13px 20px;
        border-radius: var(--radius-full, 9999px);
        border: none;
        background: linear-gradient(
            135deg,
            var(--gold-mid, #d4a017),
            var(--gold-bright, #f2c94c)
        );
        color: var(--bg-primary, #12090a);
        font-family: "Inter", sans-serif;
        font-weight: 700;
        font-size: 0.92rem;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 4px 16px rgba(212, 160, 23, 0.35);
        margin-top: 4px;
        box-sizing: border-box;
    }
    .btn-guardar:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(212, 160, 23, 0.55);
    }
    .btn-guardar:active:not(:disabled) {
        transform: translateY(0);
    }
    .btn-guardar:disabled {
        background: rgba(255, 255, 255, 0.06);
        color: var(--text-dim, #6b5040);
        border: 1px solid rgba(212, 160, 23, 0.12);
        box-shadow: none;
        cursor: not-allowed;
    }
    .btn-check-icon {
        width: 17px;
        height: 17px;
    }
</style>
