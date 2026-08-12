<script lang="ts">
    import { loginAdmin } from "../../lib/adminAuth";
    let email = "",
        password = "",
        error = "",
        loading = false;
    async function handleLogin() {
        error = "";
        loading = true;
        try {
            await loginAdmin(email, password);
            window.location.href = "/admin";
        } catch (e: any) {
            error = e.message || "Credenciales inválidas.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="login-container">
    <h2>Acceso de administrador</h2>
    <form on:submit|preventDefault={handleLogin}>
        <label>Email: <input type="email" bind:value={email} /></label>
        <label
            >Contraseña: <input type="password" bind:value={password} /></label
        >
        <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
        </button>
    </form>
    {#if error}
        <p class="error">{error}</p>
    {/if}
</div>

<style>
    .login-container {
        max-width: 300px;
        margin: 40px auto;
    }
    label {
        display: block;
        margin: 10px 0;
    }
    input {
        width: 100%;
        padding: 8px;
    }
    button {
        margin-top: 15px;
        width: 100%;
        padding: 10px;
        background: #8b5a2b;
        color: white;
        border: none;
    }
    .error {
        color: red;
        margin-top: 10px;
    }
</style>
