import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';

// ─── Interfaces de Datos ───────────────────────────────────────────
export interface PerfilTurista {
    pais: string;
    estado: string;
    municipio: string;
    rangoEdad: string;
    creadoEn?: string;
    actualizadoEn?: string;
}

export interface SelloItem {
    puntoId: string;
    fecha: string;
    origen: 'qr' | 'sello' | 'desconocido' | string;
    intentosUsados?: number;
}

export interface VisitaDetalle {
    puntoId: string;
    fecha: string;
    selloObtenido: boolean;
    intentosTrivia: number;
    audioEscuchado: boolean;
    origen: string;
    ultimoAcceso: string;
    acertoTrivia?: boolean;
    vidasRestantes?: number;
}

// ─── Consultas Básicas ─────────────────────────────────────────────
export async function obtenerPunto(id: string) {
    const snap = await getDoc(doc(db, 'puntos', id));
    return snap.exists() ? snap.data() : null;
}

export async function obtenerUsuario(uid: string) {
    const snap = await getDoc(doc(db, 'usuarios', uid));
    return snap.exists() ? snap.data() : null;
}

// ─── Gestión de Perfil de Turista ──────────────────────────────────
export async function guardarDatosUsuario(uid: string, datos: any) {
    const ahora = new Date().toISOString();
    const payload: any = {
        ...datos,
        ultimaActividad: ahora,
    };
    if (datos.perfil) {
        payload.perfil = {
            ...datos.perfil,
            actualizadoEn: ahora,
        };
    }
    await setDoc(doc(db, 'usuarios', uid), payload, { merge: true });
}

export async function guardarPerfilTurista(uid: string, perfil: PerfilTurista) {
    const ahora = new Date().toISOString();
    const userRef = doc(db, 'usuarios', uid);
    
    let creadoEn = ahora;
    try {
        const snap = await getDoc(userRef);
        if (snap.exists() && snap.data().perfil?.creadoEn) {
            creadoEn = snap.data().perfil.creadoEn;
        }
    } catch {
        // Modo offline
    }

    await setDoc(
        userRef,
        {
            perfil: {
                ...perfil,
                creadoEn,
                actualizadoEn: ahora,
            },
            ultimaActividad: ahora,
        },
        { merge: true }
    );
}

// ─── Registro de Sellos (Colección Principal) ───────────────────────
export async function guardarSello(
    uid: string,
    puntoId: string,
    origen: string = 'desconocido',
    opciones?: { intentosUsados?: number }
) {
    const userRef = doc(db, 'usuarios', uid);
    const ahora = new Date().toISOString();
    let sellos: SelloItem[] = [];

    try {
        const snap = await getDoc(userRef);
        if (snap.exists() && Array.isArray(snap.data().sellos)) {
            sellos = snap.data().sellos;
        }
    } catch (e) {
        // Modo offline: inicia vacío
    }

    // Deduplicar: si ya existe el sello para este puntoId, no duplicar
    const indexExistente = sellos.findIndex((s) => s.puntoId === puntoId);
    const nuevoSello: SelloItem = {
        puntoId,
        fecha: ahora,
        origen,
        intentosUsados: opciones?.intentosUsados ?? 1,
    };

    if (indexExistente >= 0) {
        sellos[indexExistente] = {
            ...sellos[indexExistente],
            origen: sellos[indexExistente].origen || origen,
        };
    } else {
        sellos.push(nuevoSello);
    }

    await setDoc(
        userRef,
        {
            sellos,
            ultimaActividad: ahora,
        },
        { merge: true }
    );
}

// ─── Registro Detallado de Visita por Punto ─────────────────────────
export async function guardarVisita(
    uid: string,
    puntoId: string,
    origen: string = 'desconocido',
    metadata?: {
        selloObtenido?: boolean;
        intentosTrivia?: number;
        audioEscuchado?: boolean;
    }
) {
    const ahora = new Date().toISOString();
    const visitaRef = doc(collection(db, 'usuarios', uid, 'visitas'), puntoId);
    
    await setDoc(
        visitaRef,
        {
            puntoId,
            fecha: ahora,
            selloObtenido: metadata?.selloObtenido ?? true,
            intentosTrivia: metadata?.intentosTrivia ?? 1,
            audioEscuchado: metadata?.audioEscuchado ?? true,
            origen,
            ultimoAcceso: ahora,
        },
        { merge: true }
    );
}

// ─── Trazabilidad de Audio Escuchado ────────────────────────────────
export async function registrarAudioEscuchado(
    uid: string,
    puntoId: string,
    origen: string = 'desconocido'
) {
    try {
        const ahora = new Date().toISOString();
        const visitaRef = doc(collection(db, 'usuarios', uid, 'visitas'), puntoId);
        await setDoc(
            visitaRef,
            {
                puntoId,
                audioEscuchado: true,
                ultimoAudioFecha: ahora,
                origen,
                ultimoAcceso: ahora,
            },
            { merge: true }
        );
    } catch (e) {
        console.warn('Registro de audio diferido para sincronización online:', e);
    }
}

// ─── Trazabilidad de Intentos en Trivia ─────────────────────────────
export async function registrarResultadoTrivia(
    uid: string,
    puntoId: string,
    acierto: boolean,
    vidasRestantes: number,
    origen: string = 'desconocido'
) {
    try {
        const ahora = new Date().toISOString();
        const visitaRef = doc(collection(db, 'usuarios', uid, 'visitas'), puntoId);
        await setDoc(
            visitaRef,
            {
                puntoId,
                acertoTrivia: acierto,
                vidasRestantes,
                intentosTrivia: 4 - vidasRestantes,
                ultimoIntentoFecha: ahora,
                origen,
                ultimoAcceso: ahora,
            },
            { merge: true }
        );
    } catch (e) {
        console.warn('Registro de trivia diferido para sincronización online:', e);
    }
}