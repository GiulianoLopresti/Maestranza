// ============================================
// COMPONENTE NAVBAR
// Maestranza Unidos S.A.
// ============================================

/**
 * Componente de barra de navegación superior
 * Incluye: toggle sidebar, título, notificaciones, usuario
 */
class Navbar {
    
    /**
     * Renderiza la navbar
     * @param {string} titulo - Título de la página actual
     * @returns {string} - HTML de la navbar
     */
    static render(titulo = 'Dashboard') {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return '';
        
        const notificaciones = this.getNotificacionesNoLeidas();
        const totalNoLeidas = notificaciones.length;
        const badgeText = totalNoLeidas > 9 ? '9+' : totalNoLeidas;
        const badgeHTML = totalNoLeidas > 0 ? `<span class="badge">${badgeText}</span>` : '';
        
        return `
            <nav class="navbar">
                <div class="navbar-left">
                    <button class="navbar-toggle" id="sidebarToggle" title="Toggle Sidebar">
                        <i class="fas fa-bars"></i>
                    </button>
                    <h1 class="navbar-title">${escaparHTML(titulo)}</h1>
                </div>
                
                <div class="navbar-right">
                    <!-- Notificaciones -->
                    <button class="navbar-icon-btn" id="notificacionesBtn" title="Notificaciones">
                        <i class="fas fa-bell"></i>
                        ${badgeHTML}
                    </button>
                    
                    <!-- Usuario -->
                    <button class="navbar-user" id="userMenuBtn">
                        <div class="navbar-user-avatar">
                            ${this.getInitials(currentUser.nombre)}
                        </div>
                        <div class="navbar-user-info">
                            <span class="navbar-user-name">${escaparHTML(currentUser.nombre)}</span>
                            <span class="navbar-user-role">${escaparHTML(currentUser.rol)}</span>
                        </div>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </nav>
        `;
    }
    
    /**
     * Inicializa los event listeners de la navbar
     */
    static init() {
        // Toggle sidebar
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        // Botón de notificaciones
        const notifBtn = document.getElementById('notificacionesBtn');
        if (notifBtn) {
            notifBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleNotificaciones();
            });
        }
        
        // Menú de usuario
        const userBtn = document.getElementById('userMenuBtn');
        if (userBtn) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserMenu();
            });
        }
        
        // Cerrar dropdowns al hacer clic fuera
        document.addEventListener('click', () => {
            this.closeAllDropdowns();
        });
    }
    
    /**
     * Toggle del sidebar
     */
    static toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const main = document.querySelector('.dashboard-main');
        
        if (sidebar && main) {
            // En móvil
            if (window.innerWidth <= 992) {
                sidebar.classList.toggle('mobile-open');
            } else {
                // En desktop
                sidebar.classList.toggle('collapsed');
                main.classList.toggle('sidebar-collapsed');
                
                // Guardar preferencia
                const isCollapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('sidebar_collapsed', isCollapsed);
            }
        }
    }
    
    /**
     * Toggle del panel de notificaciones
     */
    static toggleNotificaciones() {
        this.closeUserMenu();
        
        // Verificar si ya existe el panel
        let panel = document.getElementById('notificacionesPanel');
        
        if (panel) {
            panel.remove();
            return;
        }
        
        // Crear panel
        panel = document.createElement('div');
        panel.id = 'notificacionesPanel';
        panel.className = 'dropdown-panel';
        panel.innerHTML = this.renderNotificaciones();
        
        // Posicionar
        const btn = document.getElementById('notificacionesBtn');
        const rect = btn.getBoundingClientRect();
        panel.style.position = 'fixed';
        panel.style.top = (rect.bottom + 10) + 'px';
        panel.style.right = '20px';
        
        document.body.appendChild(panel);
        
        // Prevenir cierre al hacer clic dentro
        panel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Event listeners para acciones
        this.initNotificacionesListeners();
    }
    
    /**
     * Toggle del menú de usuario
     */
    static toggleUserMenu() {
        this.closeNotificaciones();
        
        let menu = document.getElementById('userMenu');
        
        if (menu) {
            menu.remove();
            return;
        }
        
        // Crear menú
        menu = document.createElement('div');
        menu.id = 'userMenu';
        menu.className = 'dropdown-panel';
        menu.innerHTML = this.renderUserMenu();
        
        // Posicionar
        const btn = document.getElementById('userMenuBtn');
        const rect = btn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = (rect.bottom + 10) + 'px';
        menu.style.right = '20px';
        
        document.body.appendChild(menu);
        
        // Prevenir cierre al hacer clic dentro
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Event listeners
        this.initUserMenuListeners();
    }
    
    /**
     * Renderiza el panel de notificaciones
     * @returns {string}
     */
    static renderNotificaciones() {
        const notificaciones = this.getNotificacionesNoLeidas();
        
        if (notificaciones.length === 0) {
            return `
                <div class="dropdown-header">
                    <h3>Notificaciones</h3>
                </div>
                <div class="dropdown-body">
                    <div class="empty-state">
                        <i class="fas fa-bell-slash empty-state-icon"></i>
                        <p>No tienes notificaciones nuevas</p>
                    </div>
                </div>
            `;
        }
        
        const notifHTML = notificaciones.slice(0, 5).map(notif => `
            <div class="notif-item" data-id="${notif.id}">
                <div class="notif-icon ${this.getNotifClass(notif.tipo_notificacion)}">
                    <i class="fas ${getIconoNotificacion(notif.tipo_notificacion)}"></i>
                </div>
                <div class="notif-content">
                    <div class="notif-title">${escaparHTML(notif.titulo)}</div>
                    <div class="notif-message">${escaparHTML(truncarTexto(notif.mensaje, 60))}</div>
                    <div class="notif-time">${formatearFechaRelativa(notif.creado_en)}</div>
                </div>
                <button class="notif-close" data-id="${notif.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        return `
            <div class="dropdown-header">
                <h3>Notificaciones</h3>
                <button class="btn-text" id="marcarTodasLeidas">Marcar todas como leídas</button>
            </div>
            <div class="dropdown-body">
                ${notifHTML}
            </div>
            <div class="dropdown-footer">
                <button class="btn-text" id="verTodasNotif">Ver todas las notificaciones</button>
            </div>
        `;
    }
    
    /**
     * Renderiza el menú de usuario
     * @returns {string}
     */
    static renderUserMenu() {
        const currentUser = AuthService.getCurrentUser();
        
        return `
            <div class="dropdown-header">
                <div class="user-menu-header">
                    <div class="navbar-user-avatar" style="width: 48px; height: 48px; font-size: 1.25rem;">
                        ${this.getInitials(currentUser.nombre)}
                    </div>
                    <div>
                        <div class="user-menu-name">${escaparHTML(currentUser.nombre)}</div>
                        <div class="user-menu-email">${escaparHTML(currentUser.email)}</div>
                    </div>
                </div>
            </div>
            <div class="dropdown-body">
                <button class="dropdown-item" id="miPerfilBtn">
                    <i class="fas fa-user"></i>
                    <span>Mi Perfil</span>
                </button>
                <button class="dropdown-item" id="configuracionBtn">
                    <i class="fas fa-cog"></i>
                    <span>Configuración</span>
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item text-danger" id="cerrarSesionBtn">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        `;
    }
    
    /**
     * Inicializa listeners del panel de notificaciones
     */
    static initNotificacionesListeners() {
        // Marcar todas como leídas
        const marcarBtn = document.getElementById('marcarTodasLeidas');
        if (marcarBtn) {
            marcarBtn.addEventListener('click', () => {
                const currentUser = AuthService.getCurrentUser();
                NotificacionStorage.marcarTodasComoLeidas(currentUser.id);
                Toast.success('Notificaciones marcadas como leídas');
                this.closeNotificaciones();
                this.updateNotificationBadge();
            });
        }
        
        // Cerrar notificación individual
        for (const btn of document.querySelectorAll('.notif-close')) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = Number.parseInt(btn.dataset.id);
                NotificacionStorage.marcarComoLeida(id);
                btn.closest('.notif-item').remove();
                this.updateNotificationBadge();
                
                // Si no quedan más, cerrar panel
                const remaining = document.querySelectorAll('.notif-item').length;
                if (remaining === 0) {
                    this.closeNotificaciones();
                }
            });
        }
        
        // Ver todas
        const verTodas = document.getElementById('verTodasNotif');
        if (verTodas) {
            verTodas.addEventListener('click', () => {
                // Navegar a página de notificaciones (próximamente)
                console.log('Navegando a notificaciones...');
                this.closeNotificaciones();
            });
        }
    }
    
    /**
     * Inicializa listeners del menú de usuario
     */
    static initUserMenuListeners() {
        // Mi perfil
        const perfilBtn = document.getElementById('miPerfilBtn');
        if (perfilBtn) {
            perfilBtn.addEventListener('click', () => {
                console.log('Navegando a perfil...');
                this.closeUserMenu();
            });
        }
        
        // Configuración
        const configBtn = document.getElementById('configuracionBtn');
        if (configBtn) {
            configBtn.addEventListener('click', () => {
                console.log('Navegando a configuración...');
                this.closeUserMenu();
            });
        }
        
        // Cerrar sesión
        const logoutBtn = document.getElementById('cerrarSesionBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.closeUserMenu();
                App.handleLogout();
            });
        }
    }
    
    /**
     * Cierra todos los dropdowns
     */
    static closeAllDropdowns() {
        this.closeNotificaciones();
        this.closeUserMenu();
    }
    
    /**
     * Cierra el panel de notificaciones
     */
    static closeNotificaciones() {
        const panel = document.getElementById('notificacionesPanel');
        if (panel) panel.remove();
    }
    
    /**
     * Cierra el menú de usuario
     */
    static closeUserMenu() {
        const menu = document.getElementById('userMenu');
        if (menu) menu.remove();
    }
    
    /**
     * Actualiza el badge de notificaciones
     */
    static updateNotificationBadge() {
        const notificaciones = this.getNotificacionesNoLeidas();
        const badge = document.querySelector('#notificacionesBtn .badge');
        const btn = document.getElementById('notificacionesBtn');
        
        if (notificaciones.length > 0) {
            const count = notificaciones.length > 9 ? '9+' : notificaciones.length;
            if (badge) {
                badge.textContent = count;
            } else if (btn) {
                const newBadge = document.createElement('span');
                newBadge.className = 'badge';
                newBadge.textContent = count;
                btn.appendChild(newBadge);
            }
        } else if (badge) {
            badge.remove();
        }
    }
    
    /**
     * Obtiene las notificaciones no leídas del usuario actual
     * @returns {Array}
     */
    static getNotificacionesNoLeidas() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return [];
        
        return NotificacionStorage.getNoLeidas(currentUser.id);
    }
    
    /**
     * Obtiene las iniciales de un nombre
     * @param {string} nombre
     * @returns {string}
     */
    static getInitials(nombre) {
        if (!nombre) return '??';
        const parts = nombre.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return nombre.substring(0, 2).toUpperCase();
    }
    
    /**
     * Obtiene la clase CSS según el tipo de notificación
     * @param {string} tipo
     * @returns {string}
     */
    static getNotifClass(tipo) {
        switch (tipo) {
            case TIPOS_NOTIFICACION.STOCK_CRITICO:
                return 'danger';
            case TIPOS_NOTIFICACION.STOCK_BAJO:
                return 'warning';
            case TIPOS_NOTIFICACION.SOLICITUD_LISTA:
                return 'success';
            case TIPOS_NOTIFICACION.INCIDENCIA:
                return 'warning';
            default:
                return 'info';
        }
    }
}

// Agregar estilos para los dropdowns
const dropdownStyles = document.createElement('style');
dropdownStyles.textContent = `
    .dropdown-panel {
        background: var(--white);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xl);
        border: 1px solid var(--gray-200);
        min-width: 320px;
        max-width: 400px;
        max-height: 500px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        z-index: 10000;
        animation: slideIn 0.2s ease;
    }
    
    .dropdown-header {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--gray-200);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .dropdown-header h3 {
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        color: var(--dark-slate);
        margin: 0;
    }
    
    .dropdown-body {
        flex: 1;
        overflow-y: auto;
        max-height: 400px;
    }
    
    .dropdown-footer {
        padding: 0.75rem 1.25rem;
        border-top: 1px solid var(--gray-200);
        text-align: center;
    }
    
    .btn-text {
        background: none;
        border: none;
        color: var(--primary-green);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }
    
    .btn-text:hover {
        background: rgba(0, 104, 74, 0.1);
    }
    
    /* Notificaciones */
    .notif-item {
        display: flex;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--gray-100);
        transition: background var(--transition-fast);
    }
    
    .notif-item:hover {
        background: var(--gray-50);
    }
    
    .notif-item:last-child {
        border-bottom: none;
    }
    
    .notif-icon {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-lg);
        flex-shrink: 0;
        font-size: 1rem;
    }
    
    .notif-icon.success {
        background: rgba(19, 170, 82, 0.1);
        color: var(--success);
    }
    
    .notif-icon.warning {
        background: rgba(255, 167, 38, 0.1);
        color: var(--warning);
    }
    
    .notif-icon.danger {
        background: rgba(239, 83, 80, 0.1);
        color: var(--danger);
    }
    
    .notif-icon.info {
        background: rgba(41, 182, 246, 0.1);
        color: var(--info);
    }
    
    .notif-content {
        flex: 1;
        min-width: 0;
    }
    
    .notif-title {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--dark-slate);
        margin-bottom: 0.25rem;
    }
    
    .notif-message {
        font-size: var(--font-size-sm);
        color: var(--gray-600);
        line-height: 1.4;
        margin-bottom: 0.25rem;
    }
    
    .notif-time {
        font-size: var(--font-size-xs);
        color: var(--gray-500);
    }
    
    .notif-close {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: var(--gray-500);
        cursor: pointer;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
        transition: all var(--transition-fast);
    }
    
    .notif-close:hover {
        background: var(--gray-200);
        color: var(--gray-700);
    }
    
    /* Menú de usuario */
    .user-menu-header {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }
    
    .user-menu-name {
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        color: var(--dark-slate);
    }
    
    .user-menu-email {
        font-size: var(--font-size-sm);
        color: var(--gray-600);
    }
    
    .dropdown-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.25rem;
        background: none;
        border: none;
        text-align: left;
        cursor: pointer;
        transition: background var(--transition-fast);
        color: var(--gray-700);
        font-size: var(--font-size-sm);
    }
    
    .dropdown-item:hover {
        background: var(--gray-50);
    }
    
    .dropdown-item i {
        width: 20px;
        text-align: center;
    }
    
    .dropdown-item.text-danger {
        color: var(--danger);
    }
    
    .dropdown-divider {
        height: 1px;
        background: var(--gray-200);
        margin: 0.5rem 0;
    }
    
    @media (max-width: 768px) {
        .dropdown-panel {
            position: fixed !important;
            left: 10px !important;
            right: 10px !important;
            top: 70px !important;
            max-width: none !important;
            min-width: auto !important;
        }
    }
`;

document.head.appendChild(dropdownStyles);

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navbar;
}