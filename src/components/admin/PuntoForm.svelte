<script lang="ts">
    import { onMount } from "svelte";
    import { db } from "../../lib/firebase";
    import { doc, getDoc, setDoc } from "firebase/firestore";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let puntoId: string | null = null;

    // Campos
    let nombreES = "",
        descripcionES = "",
        preguntaES = "";
    let opciones = ["", "", "", ""];
    let correctaIndex = 0;
    let audioURL = "",
        imagenMiniaturaURL = "",
        insigniaURL = "";
    let activo = true;
    let cargando = false,
        mensaje = "";

    onMount(async () => {
        if (puntoId) {
            const snap = await getDoc(doc(db, "puntos", puntoId));
            if (snap.exists()) {
                const d = snap.data();
                nombreES = d.nombre?.es || "";
                descripcionES = d.descripcionCorta?.es || "";
                preguntaES = d.trivia?.pregunta?.es || "";
                opciones = (d.trivia?.opciones || []).map(
                    (o: any) => o.texto?.es || "",
                );
                correctaIndex = (d.trivia?.opciones || []).findIndex(
                    (o: any) => o.correcta,
                );
                audioURL = d.audioURL || "";
                imagenMiniaturaURL = d.imagenMiniatura || "";
                insigniaURL = d.insigniaURL || "";
                activo = d.activo ?? true;
            }
        }
    });

    async function guardar() {
        cargando = true;
        mensaje = "";
        const id = puntoId || Date.now().toString(36);
        const data = {
            nombre: { es: nombreES },
            descripcionCorta: { es: descripcionES },
            trivia: {
                pregunta: { es: preguntaES },
                opciones: opciones.map((texto, i) => ({
                    texto: { es: texto },
                    correcta: i === correctaIndex,
                })),
            },
            audioURL,
            imagenMiniatura: imagenMiniaturaURL,
            insigniaURL,
            activo,
            orden: 0,
        };
        try {
            await setDoc(doc(db, "puntos", id), data, { merge: true });
            mensaje = "Punto guardado.";
            dispatch("saved"); // <-- nuevo
        } catch {
            mensaje = "Error al guardar.";
        }
    }
</script>

<form on:submit|preventDefault={guardar}>
    <label>Nombre (español): <input bind:value={nombreES} /></label>
    <label>Descripción: <textarea bind:value={descripcionES} /></label>

    <fieldset>
        <legend>Trivia</legend>
        <label>Pregunta: <input bind:value={preguntaES} /></label>
        {#each opciones as _, i}
            <label
                >Opción {i + 1}: <input bind:value={opciones[i]} />
                <input type="radio" bind:group={correctaIndex} value={i} /> Correcta
            </label>
        {/each}
    </fieldset>

    <label>URL del audio: <input bind:value={audioURL} /></label>
    {#if audioURL}<p>
            Previsualizar: <audio controls src={audioURL}></audio>
        </p>{/if}

    <label>URL de la miniatura: <input bind:value={imagenMiniaturaURL} /></label
    >
    {#if imagenMiniaturaURL}<img
            src={imagenMiniaturaURL}
            width="100"
            alt=""
        />{/if}

    <label>URL de la insignia: <input bind:value={insigniaURL} /></label>
    {#if insigniaURL}<img src={insigniaURL} width="50" alt="" />{/if}

    <label><input type="checkbox" bind:checked={activo} /> Activo</label>

    <button type="submit" disabled={cargando}
        >{cargando ? "Guardando..." : "Guardar"}</button
    >
    {#if mensaje}<p>{mensaje}</p>{/if}
</form>
