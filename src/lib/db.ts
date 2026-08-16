import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, arrayUnion } from 'firebase/firestore';

// Obtener datos de un punto (solo para administración, no se usa en el MVP aún)
export async function obtenerPunto(id: string) {
    const snap = await getDoc(doc(db, 'puntos', id));
    return snap.exists() ? snap.data() : null;
}

// Guardar/actualizar datos del usuario (perfil y/o sellos)
export async function guardarDatosUsuario(uid: string, datos: any) {
    // setDoc con merge: true crea el documento si no existe o actualiza campos
    await setDoc(doc(db, 'usuarios', uid), datos, { merge: true });
}

// Obtener el documento completo del usuario
export async function obtenerUsuario(uid: string) {
    const snap = await getDoc(doc(db, 'usuarios', uid));
    return snap.exists() ? snap.data() : null;
}

export async function guardarSello(uid: string, puntoId: string, origen: string = 'desconocido') {
    const userRef = doc(db, 'usuarios', uid);
    // Intentamos obtener los sellos existentes. Si no existe el documento o falla (offline),
    // empezamos con un array vacío.
    let sellos: any[] = [];
    try {
        const snap = await getDoc(userRef);
        if (snap.exists() && snap.data().sellos) {
            sellos = snap.data().sellos;
        }
    } catch (e) {
        // Si estamos offline y el documento no existe localmente, simplemente iniciamos vacío
    }
    // Agregamos el nuevo sello incluyendo el origen
    sellos.push({
        puntoId,
        fecha: new Date().toISOString(),
        origen,
    });
    // Guardamos todo el array (merge: true no borra el campo perfil si existe)
    await setDoc(userRef, { sellos }, { merge: true });
}

export async function guardarVisita(uid: string, puntoId: string, origen: string = 'desconocido') {
    const visitaRef = doc(collection(db, 'usuarios', uid, 'visitas'), puntoId);
    await setDoc(visitaRef, {
        fecha: new Date(),
        selloObtenido: true,
        intentosTrivia: 0, // podemos actualizar si queremos
        ultimoIntento: new Date(),
        origen,
    }, { merge: true });
}