/**
 * ZONA GAMER | Live Arena - Punto de entrada
 */
import { auth, onAuthStateChanged, signOut, register, login, getUserData } from "./auth.js";
import { loadTournament } from "./tournament.js";
import { loadRanking } from "./ranking.js";
import { showView, toggleSocialMenu, exposeGlobalHandlers, initAvatarGrid } from "./ui.js";

exposeGlobalHandlers();

let isLogin = false;
const getSelectedAvatar = initAvatarGrid(document.getElementById('avatarSelector'));

// ---------- Auth state ----------
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userData = await getUserData(user.uid);
        if (!userData) return;

        document.getElementById('view-auth').classList.remove('active');
        document.getElementById('view-home').classList.add('active');
        document.getElementById('main-nav').style.display = 'flex';
        document.getElementById('social-menu').style.display = 'flex';

        document.getElementById('welcome-user').textContent = `¡HOLA, ${userData.username}!`;
        document.getElementById('my-username').textContent = userData.username;
        document.getElementById('my-points').textContent = `${userData.points} PTS`;
        document.getElementById('my-avatar-large').innerHTML = `
            <img src="${userData.avatar}" width="100" alt="Avatar" 
                 style="border-radius:50%; border:2px solid var(--primary); box-shadow: 0 0 15px var(--primary);">
        `;

        loadTournament(user.uid);
        loadRanking();
    } else {
        const menu = document.getElementById('social-menu');
        if (menu) menu.style.display = 'none';
    }
});

// ---------- Botón registro / login ----------
document.getElementById('btn-main-auth').addEventListener('click', async () => {
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;

    if (isLogin) {
        try {
            await login(email, pass);
        } catch (e) {
            alert('Error al ingresar');
        }
        return;
    }

    const username = document.getElementById('reg-user').value.trim();
    const avatar = getSelectedAvatar();
    if (!avatar || !username) {
        alert('Completa usuario y elige un avatar.');
        return;
    }
    try {
        await register(email, pass, username, avatar);
    } catch (e) {
        alert(e?.message ?? 'Error al crear cuenta');
    }
});

// ---------- Toggle registro / iniciar sesión ----------
document.getElementById('toggle-auth-text').addEventListener('click', () => {
    isLogin = !isLogin;
    document.getElementById('auth-title').textContent = isLogin ? 'INICIAR SESIÓN' : 'REGISTRO DE PILOTO';
    document.getElementById('register-fields').style.display = isLogin ? 'none' : 'block';
    document.getElementById('avatar-section').style.display = isLogin ? 'none' : 'block';
    document.getElementById('btn-main-auth').textContent = isLogin ? 'ENTRAR' : 'CREAR CUENTA';
});

// ---------- Logout ----------
document.getElementById('btn-logout').addEventListener('click', () => {
    signOut(auth).then(() => location.reload());
});
