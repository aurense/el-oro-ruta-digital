<script lang="ts">
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    export let pregunta: string;
    export let opciones: { texto: string; correcta: boolean }[];
    export let puntoId: string;

    const dispatch = createEventDispatcher();

    let intentosRestantes = 3;
    let seleccionada: number | null = null;
    let resultado: "pendiente" | "correcta" | "fallida" = "pendiente";
    let bloqueada = false;

    $: mostrarResultado = resultado !== "pendiente";

    function getClaveHoy(): string {
        const hoy = new Date().toISOString().split("T")[0];
        return `trivia-${puntoId}-${hoy}`;
    }

    onMount(() => {
        const datos = localStorage.getItem(getClaveHoy());
        if (datos) {
            const parsed = JSON.parse(datos);
            intentosRestantes = parsed.intentosRestantes;
            if (parsed.resultado === "correcta") {
                resultado = "correcta";
                bloqueada = true;
                dispatch("success");
            } else if (intentosRestantes <= 0) {
                resultado = "fallida";
                bloqueada = true;
                dispatch("failed");
            }
        }
    });

    function elegirOpcion(indice: number) {
        if (bloqueada || resultado === "correcta") return;
        seleccionada = indice;
        const correcta = opciones[indice].correcta;
        if (correcta) {
            resultado = "correcta";
            bloqueada = true;
            guardarEstado();
            console.log("[Trivia] Correcta, despachando success");
            dispatch("success");
        } else {
            intentosRestantes -= 1;
            if (intentosRestantes <= 0) {
                resultado = "fallida";
                bloqueada = true;
                dispatch("failed");
            }
            guardarEstado();
        }
    }

    function guardarEstado() {
        localStorage.setItem(
            getClaveHoy(),
            JSON.stringify({
                intentosRestantes,
                resultado,
            }),
        );
    }
</script>

<div class="trivia">
    <h3>🎯 Trivia</h3>
    <p>{pregunta}</p>
    <div class="opciones">
        {#each opciones as opcion, i}
            <button
                class:selected={seleccionada === i}
                class:correcta={resultado === "correcta" && opcion.correcta}
                class:incorrecta={resultado === "fallida" &&
                    seleccionada === i &&
                    !opcion.correcta}
                disabled={bloqueada || resultado === "correcta"}
                on:click={() => elegirOpcion(i)}
            >
                {opcion.texto}
            </button>
        {/each}
    </div>
    {#if resultado === "correcta"}
        <p class="mensaje exito">✅ ¡Correcto! Has ganado un sello.</p>
    {:else if resultado === "fallida"}
        <p class="mensaje error">
            ❌ Se acabaron los intentos de hoy. Vuelve mañana.
        </p>
    {:else}
        <p class="intentos">Intentos restantes: {intentosRestantes}</p>
    {/if}
</div>

<style>
    .trivia {
        margin: 20px 0;
        text-align: center;
    }
    .opciones {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 15px 0;
    }
    button {
        padding: 10px;
        border: 2px solid #ccc;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: 0.2s;
    }
    button:hover:not(:disabled) {
        background: #f0e0c0;
    }
    button.selected {
        border-color: #8b5a2b;
    }
    button.correcta {
        background: #c8e6c9;
        border-color: #2e7d32;
    }
    button.incorrecta {
        background: #ffcdd2;
        border-color: #c62828;
    }
    .exito {
        color: #2e7d32;
        font-weight: bold;
    }
    .error {
        color: #c62828;
    }
    .intentos {
        color: #555;
    }
</style>
