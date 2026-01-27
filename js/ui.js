/**
 * UI - Vistas, navegación, avatares, menú social
 */

/**
 * Cambia la vista activa y actualiza la nav.
 * @param {string} viewId - ID del div .view
 * @param {HTMLElement} [navEl] - Elemento .nav-item activo
 */
export function showView(viewId, navEl) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(viewId);
    if (view) view.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    if (navEl) navEl.classList.add('active');
}

/**
 * Alterna el menú flotante de redes (WhatsApp / Discord).
 */
export function toggleSocialMenu() {
    document.getElementById('social-menu').classList.toggle('active');
}

/**
 * Expone showView y toggleSocialMenu en window para onclick en HTML.
 */
export function exposeGlobalHandlers() {
    window.showView = showView;
    window.toggleSocialMenu = toggleSocialMenu;
}

/**
 * Renderiza la grilla de avatares y devuelve un getter del avatar seleccionado.
 * @param {HTMLElement} container - Contenedor (ej. #avatarSelector)
 * @returns {() => string} Función que devuelve la URL del avatar seleccionado
 */
export function initAvatarGrid(container) {
    let selected = '';
    for (let i = 1; i <= 25; i++) {
        const url = `https://api.dicebear.com/7.x/bottts/svg?seed=gamer${i}`;
        const img = document.createElement('img');
        img.src = url;
        img.className = 'avatar-item';
        img.alt = `Avatar ${i}`;
        img.onclick = () => {
            document.querySelectorAll('.avatar-item').forEach(el => el.classList.remove('selected'));
            img.classList.add('selected');
            selected = url;
        };
        container.appendChild(img);
    }
    return () => selected;
}
