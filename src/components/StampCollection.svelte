<script lang="ts">
    import StampBadge from "./StampBadge.svelte";
    import { userStore } from "../stores/user";
    import type { PuntoData } from "../data/puntos";

    export let puntos: PuntoData[];

    // En Svelte, nos podemos suscribir al store directamente en el template con $userStore
    $: sellos = $userStore.sellos;
</script>

<div class="pasaporte">
    <h2>🎒 Mi Pasaporte</h2>
    <p class="contador">{sellos.length} / {puntos.length} sellos</p>
    <div class="grid">
        {#each puntos as punto}
            {@const obtenida = sellos.some((s) => s.puntoId === punto.id)}
            <StampBadge
                imagen={punto.insigniaURL}
                nombre={punto.nombre}
                {obtenida}
            />
        {/each}
    </div>
    {#if sellos.length === puntos.length}
        <p class="completado">🎉 ¡Has completado todos los sellos!</p>
    {/if}
</div>

<style>
    .pasaporte {
        max-width: 600px;
        margin: 20px auto;
        padding: 15px;
    }
    .contador {
        text-align: center;
        color: #666;
        margin-bottom: 10px;
    }
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 16px;
        margin-top: 20px;
    }
    .completado {
        text-align: center;
        font-weight: bold;
        color: #8b5a2b;
        margin-top: 25px;
        font-size: 1.2rem;
    }
</style>
