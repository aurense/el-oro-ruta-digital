import { writable } from 'svelte/store';

export interface Sello {
    puntoId: string;
    fecha: Date | string;
    origen?: string;
    intentosUsados?: number;
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
    monedas: number;
    cargando: boolean;
}

const STORAGE_KEY = 'pasaporte_user_cache_v1';

function cargarCacheInicial(): UserState {
    if (typeof window === 'undefined') {
        return {
            uid: null,
            sellos: [],
            sellosAliados: {},
            perfil: null,
            monedas: 0,
            cargando: true,
        };
    }

    try {
        const item = localStorage.getItem(STORAGE_KEY);
        if (item) {
            const data = JSON.parse(item);
            const sellosList = Array.isArray(data.sellos)
                ? data.sellos.map((s: any) => ({
                      ...s,
                      fecha: s.fecha ? new Date(s.fecha) : new Date(),
                  }))
                : [];
            return {
                uid: data.uid || null,
                sellos: sellosList,
                sellosAliados: data.sellosAliados || {},
                perfil: data.perfil || null,
                monedas: typeof data.monedas === 'number' ? data.monedas : sellosList.length * 40,
                cargando: false,
            };
        }
    } catch (e) {
        console.warn('[Store] Error al leer cache local:', e);
    }

    return {
        uid: null,
        sellos: [],
        sellosAliados: {},
        perfil: null,
        monedas: 0,
        cargando: true,
    };
}

export const userStore = writable<UserState>(cargarCacheInicial());

// Sincronizar automáticamente hacia localStorage en cada cambio
if (typeof window !== 'undefined') {
    userStore.subscribe((state) => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    uid: state.uid,
                    sellos: state.sellos,
                    sellosAliados: state.sellosAliados,
                    perfil: state.perfil,
                    monedas: state.monedas || 0,
                })
            );
        } catch (e) {
            console.warn('[Store] Error al guardar cache local:', e);
        }
    });
}