<script lang="ts">
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import { db } from "../../lib/firebase";
    import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

    const dispatch = createEventDispatcher();

    let puntos: any[] = [];
    let cargando = true;

    async function cargar() {
        const snap = await getDocs(collection(db, "puntos"));
        puntos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        cargando = false;
    }

    async function eliminar(id: string) {
        if (confirm("¿Eliminar este punto?")) {
            await deleteDoc(doc(db, "puntos", id));
            puntos = puntos.filter((p) => p.id !== id);
        }
    }

    onMount(cargar);
</script>

{#if cargando}
    <p>Cargando...</p>
{:else}
    <table>
        <thead><tr><th>Nombre</th><th>Activo</th><th>Acciones</th></tr></thead>
        <tbody>
            {#each puntos as punto}
                <tr>
                    <td>{punto.nombre?.es || punto.id}</td>
                    <td>{punto.activo ? "Sí" : "No"}</td>
                    <td>
                        <button
                            on:click={() => dispatch("edit", { id: punto.id })}
                            >✏️ Editar</button
                        >
                        <button on:click={() => eliminar(punto.id)}
                            >🗑️ Eliminar</button
                        >
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}
