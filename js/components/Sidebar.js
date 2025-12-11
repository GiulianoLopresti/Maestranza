// ============================================
// COMPONENTE SIDEBAR
// Maestranza Unidos S.A.
// ============================================

/**
 * Componente de menú lateral
 * Incluye: navegación, iconos, badges, colapso
 */
class Sidebar {
    
    /**
     * Renderiza el sidebar
     * @param {string} activeRoute - Ruta activa actual
     * @returns {string} - HTML del sidebar
     */
    static render(activeRoute = '/dashboard') {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return '';
        
        const menuItems = this.getMenuItems(currentUser.rol);
        const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
        
        return `
            <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" id="sidebar">
                <!-- Header -->
                <div class="sidebar-header">
                    <div class="sidebar-logo">
                        <i class="fas fa-industry"></i>
                    </div>
                    <div class="sidebar-brand">
                        <div class="sidebar-brand-name">Maestranza</div>
                        <div class="sidebar-brand-subtitle">Unidos S.A.</div>
                    </div>
                </div>
                
                <!-- Navigation -->
                <nav class="sidebar-nav">
                    ${menuItems.map(section => this.renderSection(section, activeRoute)).join('')}
                </nav>
            </aside>
        `;
    }
    
    /**
     * Renderiza una sección del menú
     * @param {Object} section - Datos de la sección
     * @param {string} activeRoute - Ruta activa
     * @returns {string}
     */
    static renderSection(section, activeRoute) {
        return `
            <div class="sidebar-nav-section">
                <div class="sidebar-nav-title">${section.title}</div>
                ${section.items.map(item => this.renderItem(item, activeRoute)).join('')}
            </div>
        `;
    }
    
    /**
     * Renderiza un item del menú
     * @param {Object} item - Datos del item
     * @param {string} activeRoute - Ruta activa
     * @returns {string}
     */
    static renderItem(item, activeRoute) {
        const isActive = activeRoute === item.route ? 'active' : '';
        const badge = item.badge ? `<span class="sidebar-nav-badge">${item.badge}</span>` : '';
        
        return `
            <a href="#" 
               class="sidebar-nav-item ${isActive}" 
               data-route="${item.route}"
               title="${item.label}">
                <span class="sidebar-nav-icon">
                    <i class="${item.icon}"></i>
                </span>
                <span class="sidebar-nav-text">${item.label}</span>
                ${badge}
            </a>
        `;
    }
    
    /**
     * Obtiene los items del menú según el rol del usuario
     * @param {string} rol - Rol del usuario
     * @returns {Array}
     */
    static getMenuItems(rol) {
        const allItems = [
            {
                title: 'Principal',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'fas fa-th-large',
                        route: '/dashboard',
                        permission: null
                    }
                ]
            },
            {
                title: 'Inventario',
                items: [
                    {
                        label: 'Piezas',
                        icon: 'fas fa-boxes',
                        route: '/inventario',
                        permission: 'inventario.ver',
                        badge: this.getStockBajoBadge()
                    },
                    {
                        label: 'Movimientos',
                        icon: 'fas fa-exchange-alt',
                        route: '/movimientos',
                        permission: 'movimientos.ver'
                    },
                    {
                        label: 'Categorías',
                        icon: 'fas fa-tags',
                        route: '/categorias',
                        permission: 'categorias.gestionar'
                    }
                ]
            },
            {
                title: 'Gestión',
                items: [
                    {
                        label: 'Solicitudes',
                        icon: 'fas fa-clipboard-list',
                        route: '/solicitudes',
                        permission: 'solicitudes.ver',
                        badge: this.getSolicitudesPendientesBadge()
                    },
                    {
                        label: 'Proyectos',
                        icon: 'fas fa-project-diagram',
                        route: '/proyectos',
                        permission: 'proyectos.ver'
                    },
                    {
                        label: 'Proveedores',
                        icon: 'fas fa-truck',
                        route: '/proveedores',
                        permission: 'proveedores.ver'
                    }
                ]
            },
            {
                title: 'Reportes',
                items: [
                    {
                        label: 'Reportes',
                        icon: 'fas fa-chart-bar',
                        route: '/reportes',
                        permission: 'reportes.ver'
                    },
                    {
                        label: 'Notificaciones',
                        icon: 'fas fa-bell',
                        route: '/notificaciones',
                        permission: null
                    }
                ]
            },
            {
                title: 'Sistema',
                items: [
                    {
                        label: 'Usuarios',
                        icon: 'fas fa-users',
                        route: '/usuarios',
                        permission: null, // Solo admin
                        adminOnly: true
                    },
                    {
                        label: 'Configuración',
                        icon: 'fas fa-cog',
                        route: '/configuracion',
                        permission: null
                    }
                ]
            }
        ];
        
        // Filtrar items según permisos
        return allItems.map(section => ({
            ...section,
            items: section.items.filter(item => this.canAccess(rol, item))
        })).filter(section => section.items.length > 0);
    }
    
    /**
     * Verifica si el usuario puede acceder a un item
     * @param {string} rol - Rol del usuario
     * @param {Object} item - Item del menú
     * @returns {boolean}
     */
    static canAccess(rol, item) {
        // Items solo para admin
        if (item.adminOnly && rol !== ROLES.ADMIN) {
            return false;
        }
        
        // Items sin restricción
        if (!item.permission) {
            return true;
        }
        
        // Verificar permiso
        return tienePermiso(rol, item.permission);
    }
    
    /**
     * Obtiene el badge de stock bajo
     * @returns {number|null}
     */
    static getStockBajoBadge() {
        const piezas = PiezaStorage.getStockBajo();
        return piezas.length > 0 ? piezas.length : null;
    }
    
    /**
     * Obtiene el badge de solicitudes pendientes
     * @returns {number|null}
     */
    static getSolicitudesPendientesBadge() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return null;
        
        const solicitudes = SolicitudStorage.getAll();
        const pendientes = solicitudes.filter(s => 
            s.estado === ESTADOS_SOLICITUD.PENDIENTE || 
            s.estado === ESTADOS_SOLICITUD.EN_PREPARACION
        );
        
        return pendientes.length > 0 ? pendientes.length : null;
    }
    
    /**
     * Inicializa los event listeners del sidebar
     */
    static init() {
        // Navegación
        for (const item of document.querySelectorAll('.sidebar-nav-item')) {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const route = item.dataset.route;
                this.navigate(route);
            });
        }
        
        // Cerrar sidebar en móvil al hacer clic en un item
        if (window.innerWidth <= 992) {
            for (const item of document.querySelectorAll('.sidebar-nav-item')) {
                item.addEventListener('click', () => {
                    const sidebar = document.querySelector('.sidebar');
                    if (sidebar) {
                        sidebar.classList.remove('mobile-open');
                    }
                });
            }
        }
        
        // Overlay para cerrar sidebar en móvil
        this.setupMobileOverlay();
    }
    
    /**
     * Navega a una ruta
     * @param {string} route - Ruta a navegar
     */
    static navigate(route) {
        console.log(`📍 Navegando a: ${route}`);
        
        // Actualizar item activo
        for (const item of document.querySelectorAll('.sidebar-nav-item')) {
            item.classList.remove('active');
            if (item.dataset.route === route) {
                item.classList.add('active');
            }
        }
        
        // Navegar según la ruta
        switch (route) {
            case '/dashboard':
                DashboardController.init();
                break;
            case '/inventario':
                InventarioController.init();
                break;
            case '/movimientos':
                Toast.info('Módulo de Movimientos - Próximamente');
                break;
            case '/solicitudes':
                Toast.info('Módulo de Solicitudes - Próximamente');
                break;
            case '/proyectos':
                Toast.info('Módulo de Proyectos - Próximamente');
                break;
            case '/proveedores':
                Toast.info('Módulo de Proveedores - Próximamente');
                break;
            case '/reportes':
                Toast.info('Módulo de Reportes - Próximamente');
                break;
            case '/notificaciones':
                Toast.info('Notificaciones - Próximamente');
                break;
            case '/categorias':
                Toast.info('Gestión de Categorías - Próximamente');
                break;
            case '/usuarios':
                if (AuthService.isAdmin()) {
                    Toast.info('Gestión de Usuarios - Próximamente');
                } else {
                    Toast.warning('No tienes permisos para acceder');
                }
                break;
            case '/configuracion':
                Toast.info('Configuración - Próximamente');
                break;
            default:
                Toast.warning('Ruta no encontrada');
        }
    }
    
    /**
     * Configura el overlay para móvil
     */
    static setupMobileOverlay() {
        if (window.innerWidth > 992) return;
        
        // Crear overlay si no existe
        let overlay = document.getElementById('sidebarOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            
            // Click en overlay cierra el sidebar
            overlay.addEventListener('click', () => {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.remove('mobile-open');
                }
                overlay.classList.remove('active');
            });
        }
        
        // Mostrar/ocultar overlay según estado del sidebar
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'class') {
                    const sidebar = mutation.target;
                    const overlay = document.getElementById('sidebarOverlay');
                    if (sidebar.classList.contains('mobile-open')) {
                        overlay.classList.add('active');
                    } else {
                        overlay.classList.remove('active');
                    }
                }
            }
        });
        
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            observer.observe(sidebar, { attributes: true });
        }
    }
    
    /**
     * Actualiza un badge específico en un item del sidebar
     * @param {string} route - Ruta del item
     * @param {number|null} count - Cantidad a mostrar en el badge
     */
    static updateItemBadge(route, count) {
        const item = document.querySelector(`[data-route="${route}"]`);
        if (!item) return;
        
        const existingBadge = item.querySelector('.sidebar-nav-badge');
        
        if (count) {
            if (existingBadge) {
                existingBadge.textContent = count;
            } else {
                const badge = document.createElement('span');
                badge.className = 'sidebar-nav-badge';
                badge.textContent = count;
                item.appendChild(badge);
            }
        } else if (existingBadge) {
            existingBadge.remove();
        }
    }
    
    /**
     * Actualiza los badges del sidebar
     */
    static updateBadges() {
        // Actualizar badge de stock bajo
        const stockBajo = this.getStockBajoBadge();
        this.updateItemBadge('/inventario', stockBajo);
        
        // Actualizar badge de solicitudes pendientes
        const solicitudesPendientes = this.getSolicitudesPendientesBadge();
        this.updateItemBadge('/solicitudes', solicitudesPendientes);
    }
}

// Agregar estilos para el overlay móvil
const overlayStyles = document.createElement('style');
overlayStyles.textContent = `
    .sidebar-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1029;
        opacity: 0;
        transition: opacity var(--transition-base);
    }
    
    .sidebar-overlay.active {
        display: block;
        opacity: 1;
    }
    
    @media (min-width: 993px) {
        .sidebar-overlay {
            display: none !important;
        }
    }
`;

document.head.appendChild(overlayStyles);

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sidebar;
}