import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Lista de UIDs permitidos (sincronizada manualmente con las reglas)
const ADMIN_UIDS = ['XXMmhV4uRChh6qHW5c2HhqX9xQA3'];

export function esAdminLocal(uid: string): boolean {
    return ADMIN_UIDS.includes(uid);
}

export async function loginAdmin(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!esAdminLocal(cred.user.uid)) {
        await auth.signOut();
        throw new Error('No eres administrador');
    }
    return cred.user;
}