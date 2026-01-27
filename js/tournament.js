/**
 * Tournament - Carga torneo actual y postulación
 */
import { doc, onSnapshot, runTransaction, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

const TOURNAMENT_ID = "torneo_01";
const tRef = () => doc(db, "tournaments", TOURNAMENT_ID);

/**
 * Suscribe a cambios del torneo y actualiza el DOM.
 * @param {string} userId - UID del usuario logueado
 */
export function loadTournament(userId) {
    onSnapshot(tRef(), (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        const btn = document.getElementById('btn-join-tournament');
        const status = document.getElementById('join-status');

        document.getElementById('t-name').textContent = data.nombre;
        document.getElementById('t-slots').textContent = `CUPOS: ${data.inscritos?.length ?? 0} / ${data.total_cupos}`;
        document.getElementById('t-date').textContent = `HORA: ${data.hora ?? '--'}`;

        const inscribed = (data.inscritos || []).includes(userId);
        if (inscribed) {
            btn.style.display = 'none';
            status.style.display = 'block';
        } else {
            status.style.display = 'none';
            btn.style.display = 'block';
            const full = (data.inscritos?.length ?? 0) >= data.total_cupos;
            btn.disabled = full;
            btn.textContent = full ? 'CUPO LLENO' : 'POSTULARSE';
            btn.onclick = () => handleJoin(userId);
        }
    });
}

/**
 * Postula al usuario al torneo.
 * @param {string} userId
 */
export async function handleJoin(userId) {
    try {
        await runTransaction(db, async (transaction) => {
            const tSnap = await transaction.get(tRef());
            const data = tSnap.data();
            if (!data) throw new Error('Torneo no encontrado');
            if ((data.inscritos?.length ?? 0) >= data.total_cupos) throw new Error('Torneo lleno');
            transaction.update(tRef(), { inscritos: arrayUnion(userId) });
        });
        alert('¡Postulación exitosa!');
    } catch (e) {
        alert(e?.message ?? e);
    }
}
