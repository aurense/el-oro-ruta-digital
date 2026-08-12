import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function obtenerEstadisticas() {
    const usuariosSnap = await getDocs(collection(db, 'usuarios'));
    const puntosSnap = await getDocs(collection(db, 'puntos'));

    const nombres: Record<string, string> = {};
    puntosSnap.forEach(d => nombres[d.id] = d.data().nombre?.es || d.id);

    let totalVisitas = 0;
    const conteoPuntos: Record<string, number> = {};
    const conteoOrigen: Record<string, number> = {};
    const conteoEdad: Record<string, number> = {};

    usuariosSnap.forEach(doc => {
        const data = doc.data();
        if (data.perfil?.pais) conteoOrigen[data.perfil.pais] = (conteoOrigen[data.perfil.pais] || 0) + 1;
        if (data.perfil?.rangoEdad) conteoEdad[data.perfil.rangoEdad] = (conteoEdad[data.perfil.rangoEdad] || 0) + 1;
        (data.sellos || []).forEach((s: any) => {
            totalVisitas++;
            conteoPuntos[s.puntoId] = (conteoPuntos[s.puntoId] || 0) + 1;
        });
    });

    const porPunto = Object.entries(conteoPuntos).map(([id, total]) => ({
        puntoId: id, nombre: nombres[id] || id, total
    }));
    return {
        totalVisitas,
        porPunto,
        porOrigen: Object.entries(conteoOrigen).map(([pais, total]) => ({ pais, total })),
        porEdad: Object.entries(conteoEdad).map(([rango, total]) => ({ rango, total }))
    };
}