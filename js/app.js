import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
        import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, onSnapshot, runTransaction, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyAh6MqrL2KvhTfeXpEYvRNvKP-6vApMnAg",
            authDomain: "zona-gamer-live.firebaseapp.com",
            projectId: "zona-gamer-live",
            storageBucket: "zona-gamer-live.firebasestorage.app",
            messagingSenderId: "458669601177",
            appId: "1:458669601177:web:9b45b6f259d8b1aa9ee308"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        let isLogin = false;
        let selectedAvatar = "";

        // Lógica de Menú Social
        window.toggleSocialMenu = () => document.getElementById('social-menu').classList.toggle('active');
        window.hideNotif = () => document.getElementById('ds-notif').style.display = 'none';

        const grid = document.getElementById('avatarSelector');
        for (let i = 1; i <= 25; i++) {
            const url = `https://api.dicebear.com/7.x/bottts/svg?seed=gamer${i}`;
            const img = document.createElement('img');
            img.src = url; img.className = 'avatar-item';
            img.onclick = () => {
                document.querySelectorAll('.avatar-item').forEach(el => el.classList.remove('selected'));
                img.classList.add('selected');
                selectedAvatar = url;
            };
            grid.appendChild(img);
        }

        async function loadTournament(userId) {
            const tRef = doc(db, "tournaments", "torneo_01");
            onSnapshot(tRef, (snap) => {
                if (!snap.exists()) return;
                const data = snap.data();
                document.getElementById('t-name').innerText = data.nombre;
                document.getElementById('t-slots').innerText = `CUPOS: ${data.inscritos.length} / ${data.total_cupos}`;
                document.getElementById('t-date').innerText = `HORA: ${data.hora}`;
                const btn = document.getElementById('btn-join-tournament');
                const status = document.getElementById('join-status');
                if (data.inscritos.includes(userId)) {
                    btn.style.display = "none"; status.style.display = "block";
                } else {
                    status.style.display = "none"; btn.style.display = "block";
                    btn.disabled = data.inscritos.length >= data.total_cupos;
                    btn.innerText = btn.disabled ? "CUPO LLENO" : "POSTULARSE";
                    btn.onclick = () => handleJoin(userId);
                }
            });
        }

        async function handleJoin(userId) {
            const tRef = doc(db, "tournaments", "torneo_01");
            try {
                await runTransaction(db, async (transaction) => {
                    const tSnap = await transaction.get(tRef);
                    const data = tSnap.data();
                    if (data.inscritos.length >= data.total_cupos) throw "Torneo lleno";
                    transaction.update(tRef, { inscritos: arrayUnion(userId) });
                });
                alert("¡Postulación exitosa!");
            } catch (e) { alert(e); }
        }

        document.getElementById('btn-main-auth').onclick = async () => {
            const email = document.getElementById('reg-email').value;
            const pass = document.getElementById('reg-pass').value;
            if (isLogin) {
                try { await signInWithEmailAndPassword(auth, email, pass); } catch(e) { alert("Error al ingresar"); }
            } else {
                const user = document.getElementById('reg-user').value;
                if (!selectedAvatar || !user) return alert("Faltan datos");
                try {
                    const res = await createUserWithEmailAndPassword(auth, email, pass);
                    await setDoc(doc(db, "users", res.user.uid), { username: user, avatar: selectedAvatar, points: 0 });
                } catch(e) { alert(e.message); }
            }
        };

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const uDoc = await getDoc(doc(db, "users", user.uid));
                const userData = uDoc.data();
                document.getElementById('view-auth').classList.remove('active');
                document.getElementById('view-home').classList.add('active');
                document.getElementById('main-nav').style.display = 'flex';
                document.getElementById('social-menu').style.display = 'flex'; // Muestra menú social
                document.getElementById('welcome-user').innerText = `¡HOLA, ${userData.username}!`;
                document.getElementById('my-username').innerText = userData.username;
                document.getElementById('my-points').innerText = `${userData.points} PTS`;
                document.getElementById('my-avatar-large').innerHTML = `<img src="${userData.avatar}" width="100" style="border-radius:50%; border:2px solid var(--primary);">`;
                loadTournament(user.uid);
                loadRanking();
            } else {
                document.getElementById('social-menu').style.display = 'none';
                document.getElementById('social-menu').classList.remove('active');
            }
        });

        function loadRanking() {
            const q = query(collection(db, "users"), orderBy("points", "desc"), limit(10));
            onSnapshot(q, (snap) => {
                const top3 = document.getElementById('top3-container');
                const list = document.getElementById('ranking-list');
                top3.innerHTML = ""; list.innerHTML = "";
                const orders = [1, 0, 2];
                orders.forEach(i => {
                    if (snap.docs[i]) {
                        const d = snap.docs[i].data();
                        top3.innerHTML += `<div class="p-item ${i==0?'first':''}"><div class="p-avatar"><img src="${d.avatar}" width="100%"></div><p>${d.username}</p></div>`;
                    }
                });
                snap.docs.slice(3).forEach((doc, idx) => {
                    const d = doc.data();
                    list.innerHTML += `<div class="ranking-row"><div class="rank-num">${idx+4}</div><div style="flex-grow:1">${d.username}</div><div>${d.points} PTS</div></div>`;
                });
            });
        }

        window.showView = (id, el) => {
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            if(el) el.classList.add('active');
        };

        document.getElementById('toggle-auth-text').onclick = () => {
            isLogin = !isLogin;
            document.getElementById('auth-title').innerText = isLogin ? "LOGIN" : "REGISTRO";
            document.getElementById('register-fields').style.display = isLogin ? "none" : "block";
            document.getElementById('avatar-section').style.display = isLogin ? "none" : "block";
            document.getElementById('btn-main-auth').innerText = isLogin ? "ENTRAR" : "CREAR CUENTA";
        };

        document.getElementById('btn-logout').onclick = () => signOut(auth).then(() => location.reload());
