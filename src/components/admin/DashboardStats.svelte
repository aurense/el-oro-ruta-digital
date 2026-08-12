<script lang="ts">
    import { onMount } from "svelte";
    import { obtenerEstadisticas } from "../../lib/stats";
    let datos = null,
        error = "";
    onMount(async () => {
        try {
            datos = await obtenerEstadisticas();
        } catch {
            error = "Error al cargar.";
        }
    });
</script>

<div>
    {#if error}<p class="error">{error}</p>{/if}
    {#if datos}
        <h3>Visitas totales: {datos.totalVisitas}</h3>
        <h4>Por punto</h4>
        <ul>
            {#each datos.porPunto as p}<li>{p.nombre}: {p.total}</li>{/each}
        </ul>
        <h4>Origen</h4>
        <ul>
            {#each datos.porOrigen as o}<li>{o.pais}: {o.total}</li>{/each}
        </ul>
        <h4>Edad</h4>
        <ul>
            {#each datos.porEdad as e}<li>{e.rango}: {e.total}</li>{/each}
        </ul>
    {/if}
</div>

<style>
    .error {
        color: red;
    }
</style>
