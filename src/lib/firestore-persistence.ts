import { db } from './firebase';
import { enableIndexedDbPersistence } from 'firebase/firestore';

export function habilitarPersistenciaOffline() {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            // Varias pestañas abiertas: solo una puede tener persistencia
            console.warn('Persistencia offline no disponible (varias pestañas abiertas)');
        } else if (err.code === 'unimplemented') {
            // El navegador no soporta IndexedDB
            console.warn('Persistencia offline no soportada por el navegador');
        } else {
            console.error('Error al habilitar persistencia offline:', err);
        }
    });
}