<script lang="ts">
    export let imagen: string; // URL de la insignia
    export let nombre: string;
    export let obtenida: boolean;
</script>

<div class="badge" class:obtenida>
    <img src={imagen} alt={nombre} class:gris={!obtenida} />
    <span class="nombre">{nombre}</span>
</div>

<style>
    .badge {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 12px;
        border-radius: 12px;
        background: #f9f6f0;
        transition: transform 0.2s;
    }
    .badge.obtenida {
        background: #fff9e6;
        box-shadow: 0 2px 8px rgba(139, 90, 43, 0.2);
    }
    img {
        width: 80px;
        height: 80px;
        object-fit: contain;
        transition: filter 0.3s;
    }
    img.gris {
        filter: grayscale(100%);
        opacity: 0.4;
    }
    .nombre {
        font-size: 0.9rem;
        color: #555;
        text-align: center;
    }
</style>
