/**
 * Ranking - Hall of Fame y top 10
 */
import { collection, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

/**
 * Suscribe al ranking ordenado por puntos y actualiza el DOM.
 */
export function loadRanking() {
    const q = query(
        collection(db, "users"),
        orderBy("points", "desc"),
        limit(10)
    );

    onSnapshot(q, (snap) => {
        const top3 = document.getElementById('top3-container');
        const list = document.getElementById('ranking-list');
        top3.innerHTML = '';
        list.innerHTML = '';

        const docs = snap.docs;
        const orders = [1, 0, 2]; // 2º, 1º, 3º en el podium

        orders.forEach((idx) => {
            if (docs[idx]) {
                const d = docs[idx].data();
                const isFirst = idx === 0;
                const div = document.createElement('div');
                div.className = `p-item ${isFirst ? 'first' : ''}`;
                div.innerHTML = `
                    <div class="p-avatar"><img src="${d.avatar}" alt="${d.username}" width="100%"></div>
                    <p>${d.username}</p>
                `;
                top3.appendChild(div);
            }
        });

        docs.slice(3).forEach((docSnap, i) => {
            const d = docSnap.data();
            const row = document.createElement('div');
            row.className = 'ranking-row';
            row.innerHTML = `
                <div class="rank-num">${i + 4}</div>
                <div style="flex-grow:1">${d.username}</div>
                <div>${d.points} PTS</div>
            `;
            list.appendChild(row);
        });
    });
}
