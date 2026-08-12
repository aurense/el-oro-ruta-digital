import { auth } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export async function iniciarSesionAnonima() {
    try {
        const cred = await signInAnonymously(auth);
        return cred.user;
    } catch (error) {
        console.error('Error en inicio anónimo:', error);
        return null;
    }
}

export function escucharAuth(callback: (uid: string | null) => void) {
    return onAuthStateChanged(auth, (user) => {
        callback(user ? user.uid : null);
    });
}