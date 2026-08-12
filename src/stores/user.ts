import { writable } from 'svelte/store';

export interface Sello {
    puntoId: string;
    fecha: Date;
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
    perfil: DatosPerfil | null;
}

export const userStore = writable<UserState>({
    uid: null,
    sellos: [],
    perfil: null,
});