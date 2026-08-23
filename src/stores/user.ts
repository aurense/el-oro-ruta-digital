import { writable } from 'svelte/store';

export interface Sello {
    puntoId: string;
    fecha: Date;
}

export interface SelloAliado {
    fecha: string;
    origen: string;
}

export interface DatosPerfil {
    pais: string;
    estado: string;
    municipio: string;
    rangoEdad: string;
}

export interface UserState {
    uid: string | null;
    sellos: Sello[];
    sellosAliados: Record<string, SelloAliado>;
    perfil: DatosPerfil | null;
}

export const userStore = writable<UserState>({
    uid: null,
    sellos: [],
    sellosAliados: {},
    perfil: null,
});