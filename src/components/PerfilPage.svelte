<script lang="ts">
    import { userStore } from "../stores/user";
    import { guardarDatosUsuario } from "../lib/db";
    import SelectoresUbicacion from "./SelectoresUbicacion.svelte";

    let editando = false;
    let guardando = false;
    let mensaje = "";

    let ubicacion = { pais: "", estado: "", municipio: "" };
    let rangoEdad = "";
    const rangos = [
        "Menor de 18",
        "18-24",
        "25-34",
        "35-44",
        "45-54",
        "55-64",
        "65+",
    ];

    $: if ($userStore.perfil) {
        ubicacion = {
            pais: $userStore.perfil.pais || "",
            estado: $userStore.perfil.estado || "",
            municipio: $userStore.perfil.municipio || "",
        };
        rangoEdad = $userStore.perfil.rangoEdad || "";
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
        if (
            !ubicacion.pais ||
            !ubicacion.estado ||
            !ubicacion.municipio ||
            !rangoEdad
        ) {
            mensaje = "Por favor completa todos los campos.";
            return;
        }
        guardando = true;
        try {
            const datosPerfil = {
                pais: ubicacion.pais,
                estado: ubicacion.estado,
                municipio: ubicacion.municipio,
                rangoEdad,
            };
            await guardarDatosUsuario($userStore.uid!, { perfil: datosPerfil });
            userStore.update((s) => ({ ...s, perfil: datosPerfil }));
            editando = false;
            mensaje = "Datos actualizados correctamente.";
        } catch (e) {
            mensaje = "Error al guardar los cambios. Intenta de nuevo.";
        } finally {
            guardando = false;
        }
    }

    function cancelarEdicion() {
        // Restaurar valores originales del store
        if ($userStore.perfil) {
            ubicacion = {
                pais: $userStore.perfil.pais || "",
                estado: $userStore.perfil.estado || "",
                municipio: $userStore.perfil.municipio || "",
            };
            rangoEdad = $userStore.perfil.rangoEdad || "";
        }
        editando = false;
        mensaje = "";
    }
</script>

<div class="perfil">
    <h2>👤 Mi perfil</h2>
    <p class="aviso-privacidad">
        🔒 <strong>Aviso de privacidad:</strong> La información que proporcionas
        se utiliza únicamente con fines estadísticos para mejorar la experiencia
        turística de El Oro. No compartimos tus datos con terceros.
    </p>

    {#if !$userStore.perfil && !editando}
        <p class="vacio">
            Aún no has registrado tus datos. Se te pedirán al obtener tu primer
            sello.
        </p>
    {:else}
        {#if !editando}
            <!-- Vista de solo lectura -->
            <dl class="datos">
                <dt>País</dt>
                <dd>{ubicacion.pais}</dd>
                <dt>Estado</dt>
                <dd>{ubicacion.estado}</dd>
                <dt>Municipio</dt>
                <dd>{ubicacion.municipio}</dd>
                <dt>Rango de edad</dt>
                <dd>{rangoEdad}</dd>
            </dl>
            <button class="btn-editar" on:click={iniciarEdicion}
                >✏️ Editar datos</button
            >
        {:else}
            <!-- Formulario de edición -->
            <div class="formulario">
                <SelectoresUbicacion
                    paisInicial={ubicacion.pais}
                    estadoInicial={ubicacion.estado}
                    municipioInicial={ubicacion.municipio}
                    on:change={manejarCambioUbicacion}
                />

                <label>
                    Rango de edad:
                    <select bind:value={rangoEdad}>
                        <option value="">Selecciona...</option>
                        {#each rangos as rango}
                            <option value={rango}>{rango}</option>
                        {/each}
                    </select>
                </label>

                <div class="acciones">
                    <button
                        class="btn-guardar"
                        on:click={guardarCambios}
                        disabled={guardando}
                    >
                        {guardando ? "Guardando..." : "💾 Guardar cambios"}
                    </button>
                    <button
                        class="btn-cancelar"
                        on:click={cancelarEdicion}
                        disabled={guardando}
                    >
                        ❌ Cancelar
                    </button>
                </div>
            </div>
        {/if}
        {#if mensaje}
            <p class="mensaje" class:error={mensaje.includes("Error")}>
                {mensaje}
            </p>
        {/if}
    {/if}
</div>

<style>
    .perfil {
        max-width: 500px;
        margin: 30px auto;
        padding: 20px;
    }
    .aviso-privacidad {
        background: #f0f4f8;
        padding: 12px;
        border-radius: 8px;
        font-size: 0.9rem;
        color: #333;
        margin-bottom: 25px;
    }
    .vacio {
        text-align: center;
        color: #666;
    }
    dl.datos {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 8px 12px;
        margin: 20px 0;
    }
    dt {
        font-weight: bold;
        color: #555;
    }
    dd {
        margin: 0;
    }
    .btn-editar {
        background: none;
        border: 1px solid #8b5a2b;
        color: #8b5a2b;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.9rem;
    }
    .formulario {
        margin-top: 15px;
    }
    .formulario label {
        display: block;
        margin-top: 12px;
    }
    select {
        width: 100%;
        padding: 8px;
        margin-top: 4px;
        border: 1px solid #ccc;
        border-radius: 6px;
    }
    .acciones {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }
    .btn-guardar,
    .btn-cancelar {
        padding: 10px 18px;
        border: none;
        border-radius: 20px;
        cursor: pointer;
    }
    .btn-guardar {
        background: #8b5a2b;
        color: white;
    }
    .btn-guardar:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
    .btn-cancelar {
        background: #eee;
        color: #333;
    }
    .mensaje {
        text-align: center;
        margin-top: 15px;
        color: #2e7d32;
    }
    .mensaje.error {
        color: #c62828;
    }
</style>
