<script lang="ts">
    import PuntosList from "./PuntosList.svelte";
    import PuntoForm from "./PuntoForm.svelte";

    let modo: "list" | "edit" = "list";
    let editId: string | null = null;

    function leerQuery() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("edit");
        if (id) {
            modo = "edit";
            editId = id === "nuevo" ? null : id;
        } else {
            modo = "list";
            editId = null;
        }
    }

    // Leer al cargar y al cambiar historial
    import { onMount } from "svelte";
    onMount(() => {
        leerQuery();
        window.addEventListener("popstate", leerQuery);
        return () => window.removeEventListener("popstate", leerQuery);
    });

    function irALista() {
        window.history.pushState({}, "", "/admin/puntos");
        leerQuery();
    }

    function editarPunto(id: string) {
        window.history.pushState({}, "", `/admin/puntos?edit=${id}`);
        leerQuery();
    }

    function nuevoPunto() {
        window.history.pushState({}, "", "/admin/puntos?edit=nuevo");
        leerQuery();
    }
</script>

<nav>
    {#if modo === "list"}
        <button on:click={nuevoPunto}>➕ Crear nuevo punto</button>
    {:else}
        <button on:click={irALista}>← Volver a la lista</button>
    {/if}
</nav>

{#if modo === "list"}
    <PuntosList on:edit={(e) => editarPunto(e.detail.id)} />
{:else}
    <PuntoForm puntoId={editId} on:saved={irALista} />
{/if}
