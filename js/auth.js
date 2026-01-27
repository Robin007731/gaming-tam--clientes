/**
 * Auth - Registro, login, logout y estado de sesión
 */
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth, db } from "./firebase.js";

export { auth, onAuthStateChanged, signOut };

/**
 * Registra un nuevo usuario y guarda perfil en Firestore.
 * @param {string} email
 * @param {string} password
 * @param {string} username
 * @param {string} avatarUrl
 */
export async function register(email, password, username, avatarUrl) {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", res.user.uid), {
        username,
        avatar: avatarUrl,
        points: 0
    });
}

/**
 * Inicia sesión con email y contraseña.
 * @param {string} email
 * @param {string} password
 */
export async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Obtiene los datos del usuario desde Firestore.
 * @param {string} uid
 * @returns {Promise<Object>}
 */
export async function getUserData(uid) {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
}
