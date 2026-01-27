/**
 * Firebase - Configuración e inicialización
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAh6MqrL2KvhTfeXpEYvRNvKP-6vApMnAg",
    authDomain: "zona-gamer-live.firebaseapp.com",
    projectId: "zona-gamer-live",
    storageBucket: "zona-gamer-live.firebasestorage.app",
    messagingSenderId: "458669601177",
    appId: "1:458669601177:web:9b45b6f259d8b1aa9ee308"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
