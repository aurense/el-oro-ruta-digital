import { writable } from 'svelte/store';

export interface Sello {
    puntoId: string;
    fecha: Date | string;
    origen?: string;
    intentosUsados?: number;
}

export interface CanjeBeneficio {
    fecha: string;        // ISO timestamp
    fechaDia: string;     // YYYY-MM-DD para verificar 1 cortesía por día
    folio: string;        // Ej. "#CANJE-MINERO-8492"
    origen: string;       // "qr_mostrador" | "scanner_pwa" | "manual"
}

export interface SelloAliado {
    fecha: string;
    origen: string;
    ultimoCanje?: CanjeBeneficio;
}

/**
 * Evalúa si el usuario puede canjear el beneficio del aliado hoy (1 cortesía por día).
 */
export function puedeCanjearBeneficioHoy(selloAliado?: SelloAliado): boolean {
    if (!selloAliado?.ultimoCanje?.fechaDia) return true;
    const hoy = new Date().toISOString().split("T")[0];
    return selloAliado.ultimoCanje.fechaDia !== hoy;
}

export interface DatosPerfil {
    nombre?: string;
    pais?: string;
    estado?: string;
    municipio?: string;
    rangoEdad?: string;
    compania?: "Solo" | "Pareja" | "Familia" | "Amigos" | string;
    estadia?: "1 día (ida y vuelta)" | "1 noche" | "Fin de semana (2-3 días)" | "Más de 3 días" | string;
    calificacion?: number;
    consentimiento?: boolean;
    creadoEn?: string;
    actualizadoEn?: string;
}

/**
 * Determina qué paso del onboarding/registro le falta completar al usuario (1, 2, 3 o null si ya terminó).
 */
export function obtenerPasoPendientePerfil(perfil: DatosPerfil | null): 1 | 2 | 3 | null {
    if (!perfil || !perfil.nombre?.trim() || !perfil.pais?.trim() || !perfil.estado?.trim()) {
        return 1;
    }
    // Paso 2: Rango de edad, compañía y municipio (si México)
    const requiereMunicipioMexico = perfil.pais === 'México' && !perfil.municipio?.trim();
    if (!perfil.rangoEdad?.trim() || !perfil.compania?.trim() || requiereMunicipioMexico) {
        return 2;
    }
    // Paso 3: Estadía
    if (!perfil.estadia?.trim()) {
        return 3;
    }
    return null;
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