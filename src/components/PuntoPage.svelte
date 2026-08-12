<script lang="ts">
    import { onMount } from "svelte";
    import AudioPlayer from "./AudioPlayer.svelte";
    import Trivia from "./Trivia.svelte";
    import DataForm from "./DataForm.svelte";
    import { userStore } from "../stores/user";
    import {
        guardarDatosUsuario,
        guardarVisita,
        guardarSello,
    } from "../lib/db";

    export let punto: {
        id: string;
        nombre: string;
        descripcionCorta: string;
        imagenMiniatura: string;
        audioURL: string;
        duracion: number;
        trivia: {
            pregunta: string;
            opciones: { texto: string; correcta: boolean }[];
        };
        insigniaURL: string;
    };

    let fase: "audio" | "trivia" | "selloGanado" | "fallida" = "audio";
    let mostrarDataForm = false;
    let datosPerfilGuardados = false;
    let perfilLocal = $userStore.perfil;

    $: uid = $userStore.uid;
    $: perfil = $userStore.perfil;
    $: sellos = $userStore.sellos;
    $: console.log(
        "[Store] sellos:",
        $userStore.sellos,
        "perfil:",
        $userStore.perfil,
    );

    function onAudioEnded() {
        fase = "trivia";
    }

    function onTriviaSuccess() {
        console.log(
            "[PuntoPage] Trivia success. uid:",
            uid,
            "sellos:",
            sellos,
            "perfil:",
            perfil,
        );
        if (sellos.length === 0 && !perfil) {
            mostrarDataForm = true;
        } else {
            guardarSelloLocal();
        }
    }

    function onTriviaFailed() {
        fase = "fallida";
    }

    async function onPerfilGuardado(
        event: CustomEvent<{
            pais: string;
            estado: string;
            municipio: string;
            rangoEdad: string;
        }>,
    ) {
        const datos = event.detail;
        try {
            await guardarDatosUsuario(uid!, { perfil: datos });
            userStore.update((s) => ({ ...s, perfil: datos }));
            mostrarDataForm = false;
            datosPerfilGuardados = true;
            guardarSelloLocal();
        } catch (e) {
            alert("Error al guardar los datos. Intenta de nuevo.");
        }
    }

    async function guardarSelloLocal() {
        if (!uid) return;
        try {
            await guardarSello(uid, punto.id);
            userStore.update((s) => ({
                ...s,
                sellos: [...s.sellos, { puntoId: punto.id, fecha: new Date() }],
            }));
            fase = "selloGanado";
        } catch (e) {
            // Si falla por offline, igual actualizamos el store localmente para que la UI refleje el sello
            userStore.update((s) => ({
                ...s,
                sellos: [...s.sellos, { puntoId: punto.id, fecha: new Date() }],
            }));
            fase = "selloGanado";
            console.warn(
                "El sello se guardará en el servidor cuando vuelva la conexión.",
                e,
            );
        }
    }
</script>

<div class="punto-page">
    <img src={punto.imagenMiniatura} alt={punto.nombre} class="miniatura" />
    <h1>{punto.nombre}</h1>
    <p>{punto.descripcionCorta}</p>

    {#if fase === "audio"}
        <AudioPlayer
            audioURL={punto.audioURL}
            duracion={punto.duracion}
            on:ended={onAudioEnded}
        />
    {:else if fase === "trivia"}
        <Trivia
            pregunta={punto.trivia.pregunta}
            opciones={punto.trivia.opciones}
            puntoId={punto.id}
            on:success={onTriviaSuccess}
            on:failed={onTriviaFailed}
        />
    {:else if fase === "selloGanado"}
        <div class="sello-exito">
            <img src={punto.insigniaURL} alt="Sello" class="insignia" />
            <h2>¡Sello obtenido!</h2>
            <p>Tu pasaporte tiene {sellos.length} sello(s).</p>
        </div>
    {:else if fase === "fallida"}
        <p>
            No has conseguido el sello hoy. Vuelve mañana para intentarlo de
            nuevo.
        </p>
    {/if}

    {#if mostrarDataForm}
        <DataForm on:save={onPerfilGuardado} />
    {/if}
</div>

<style>
    .punto-page {
        max-width: 500px;
        margin: 20px auto;
        padding: 15px;
        text-align: center;
    }
    .miniatura {
        width: 100%;
        border-radius: 12px;
        margin-bottom: 15px;
    }
    .insignia {
        width: 120px;
        height: 120px;
        object-fit: contain;
        margin: 10px auto;
    }
</style>
