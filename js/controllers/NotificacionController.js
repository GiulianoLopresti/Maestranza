// ============================================
// CONTROLADOR DE NOTIFICACIONES
// Maestranza Unidos S.A.
// ============================================

/**
 * Controlador para el módulo de notificaciones
 * HU #6 - Sistema de notificaciones
 */
class NotificacionController {
    
    static dataTable = null;
    static filtros = {
        tipo: null,
        leidas: false
    };
    
    /**
     * Inicializa el módulo de notificaciones
     */
    static init() {
        console.log('🔔 Inicializando Módulo de Notificaciones...');
        this.render();
        this.setupEventListeners();
        this.loadData();
    }
    
    /**
     * Renderiza la vista de notificaciones
     */
    static render() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="dashboard-layout">
                <!-- Sidebar -->
                ${Sidebar.render('/notificaciones')}
                
                <!-- Main Content -->
                <div class="dashboard-main" id="dashboardMain">
                    <!-- Navbar -->
                    ${Navbar.render('Notificaciones')}
                    
                    <!-- Content -->
                    <div class="dashboard-content">
                        <!-- Header -->
                        <div class="dashboard-header">
                            <div style="flex: 1;">
                                <h1>
                                    <i class="fas fa-bell me-3"></i>
                                    Centro de Notificaciones
                                </h1>
                                <p>Todas tus notificaciones del sistema</p>
                            </div>
                            <button class="btn btn-outline-primary" onclick="NotificacionController.marcarTodasLeidas()">
                                <i class="fas fa-check-double me-2"></i>
                                Marcar todas como leídas
                            </button>
                        </div>
                        
                        <!-- Filtros -->
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="row align-items-end">
                                    <div class="col-md-4">
                                        <label class="form-label">Tipo</label>
                                        <select class="form-control" id="filtroTipo">
                                            <option value="">Todos los tipos</option>
                                            ${Object.entries(TIPOS_NOTIFICACION).map(([key, value]) => `
                                                <option value="${value}">${value}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    
                                    <div class="col-md-3">
                                        <div class="form-check" style="margin-top: 2rem;">
                                            <input 
                                                class="form-check-input" 
                                                type="checkbox" 
                                                id="filtroSoloNoLeidas"
                                            >
                                            <label class="form-check-label" for="filtroSoloNoLeidas">
                                                Solo no leídas
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div class="col-md-2">
                                        <button class="btn btn-secondary w-100" onclick="NotificacionController.limpiarFiltros()">
                                            <i class="fas fa-times me-2"></i>
                                            Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Lista de Notificaciones -->
                        <div id="notificacionesContainer"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Configura los event listeners
     */
    static setupEventListeners() {
        // Inicializar componentes
        Navbar.init();
        Sidebar.init();
        
        // Filtros
        document.getElementById('filtroTipo').addEventListener('change', (e) => {
            this.filtros.tipo = e.target.value || null;
            this.aplicarFiltros();
        });
        
        document.getElementById('filtroSoloNoLeidas').addEventListener('change', (e) => {
            this.filtros.leidas = !e.target.checked;
            this.aplicarFiltros();
        });
    }
    
    /**
     * Carga los datos
     */
    static loadData() {
        this.renderNotificaciones();
    }
    
    /**
     * Renderiza las notificaciones
     */
    static renderNotificaciones() {
        const container = document.getElementById('notificacionesContainer');
        const notificaciones = this.getNotificacionesFiltradas();
        
        if (notificaciones.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <div class="empty-state">
                            <i class="fas fa-bell-slash empty-state-icon"></i>
                            <h3 class="empty-state-title">No hay notificaciones</h3>
                            <p class="empty-state-text">
                                ${this.filtros.tipo || !this.filtros.leidas ? 
                                    'No hay notificaciones que coincidan con los filtros' : 
                                    'No tienes notificaciones en este momento'}
                            </p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        // Agrupar por fecha
        const agrupadasPorFecha = this.agruparPorFecha(notificaciones);
        
        let html = '';
        
        for (const [fecha, notifs] of Object.entries(agrupadasPorFecha)) {
            html += `
                <div class="notificaciones-grupo mb-4">
                    <h6 class="notificaciones-fecha mb-3">
                        <i class="fas fa-calendar-alt me-2"></i>
                        ${fecha}
                    </h6>
                    <div class="card">
                        <div class="list-group list-group-flush">
                            ${notifs.map(n => this.renderNotificacion(n)).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    /**
     * Renderiza una notificación individual
     */
    static renderNotificacion(notif) {
        const iconClass = this.getNotifIconClass(notif.tipo_notificacion);
        const colorClass = this.getNotifColorClass(notif.tipo_notificacion);
        const leidaClass = notif.leida ? 'notif-leida' : 'notif-no-leida';
        
        return `
            <div class="list-group-item notificacion-item ${leidaClass}" data-id="${notif.id}">
                <div class="notif-icon-wrapper ${colorClass}">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="notif-content-wrapper">
                    <div class="notif-header-row">
                        <div>
                            <h6 class="notif-titulo mb-1">${escaparHTML(notif.titulo)}</h6>
                            <p class="notif-mensaje mb-2">${escaparHTML(notif.mensaje)}</p>
                        </div>
                        <div class="notif-actions">
                            ${!notif.leida ? `
                                <button 
                                    class="btn btn-sm btn-outline-primary" 
                                    onclick="NotificacionController.marcarLeida(${notif.id})"
                                    title="Marcar como leída"
                                >
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="notif-footer-row">
                        <span class="notif-tiempo">
                            <i class="fas fa-clock me-1"></i>
                            ${formatearFechaRelativa(notif.creado_en)}
                        </span>
                        <span class="badge badge-${colorClass}">
                            ${notif.tipo_notificacion}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Obtiene notificaciones filtradas
     */
    static getNotificacionesFiltradas() {
        let notificaciones = NotificacionService.getMisNotificaciones();
        
        // Filtrar por tipo
        if (this.filtros.tipo) {
            notificaciones = notificaciones.filter(n => n.tipo_notificacion === this.filtros.tipo);
        }
        
        // Filtrar por leídas/no leídas
        if (this.filtros.leidas === false) {
            notificaciones = notificaciones.filter(n => !n.leida);
        }
        
        // Ordenar por fecha descendente
        return notificaciones.sort((a, b) => 
            new Date(b.creado_en) - new Date(a.creado_en)
        );
    }
    
    /**
     * Agrupa notificaciones por fecha
     */
    static agruparPorFecha(notificaciones) {
        const grupos = {};
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        
        for (const notif of notificaciones) {
            const fecha = new Date(notif.creado_en);
            let etiqueta;
            
            if (fecha.toDateString() === hoy.toDateString()) {
                etiqueta = 'Hoy';
            } else if (fecha.toDateString() === ayer.toDateString()) {
                etiqueta = 'Ayer';
            } else {
                etiqueta = formatearFecha(fecha);
            }
            
            if (!grupos[etiqueta]) {
                grupos[etiqueta] = [];
            }
            
            grupos[etiqueta].push(notif);
        }
        
        return grupos;
    }
    
    /**
     * Aplica los filtros
     */
    static aplicarFiltros() {
        this.renderNotificaciones();
        const count = this.getNotificacionesFiltradas().length;
        Toast.info(`${count} notificación(es) encontrada(s)`, 2000);
    }
    
    /**
     * Limpia todos los filtros
     */
    static limpiarFiltros() {
        this.filtros = {
            tipo: null,
            leidas: false
        };
        
        document.getElementById('filtroTipo').value = '';
        document.getElementById('filtroSoloNoLeidas').checked = false;
        
        this.aplicarFiltros();
    }
    
    /**
     * Marca una notificación como leída
     */
    static marcarLeida(id) {
        const response = NotificacionService.marcarComoLeida(id);
        
        if (response.success) {
            // Actualizar UI
            const item = document.querySelector(`[data-id="${id}"]`);
            if (item) {
                item.classList.remove('notif-no-leida');
                item.classList.add('notif-leida');
                
                // Remover botón de marcar como leída
                const actions = item.querySelector('.notif-actions');
                if (actions) {
                    actions.innerHTML = '';
                }
            }
            
            // Actualizar badge en navbar
            Navbar.updateNotificationBadge();
        }
    }
    
    /**
     * Marca todas las notificaciones como leídas
     */
    static async marcarTodasLeidas() {
        const noLeidas = NotificacionService.getNoLeidas();
        
        if (noLeidas.length === 0) {
            Toast.info('No hay notificaciones sin leer');
            return;
        }
        
        const confirmed = await Modal.confirm({
            title: 'Marcar todas como leídas',
            message: `¿Marcar ${noLeidas.length} notificación(es) como leídas?`,
            confirmText: 'Sí, marcar todas',
            type: 'info'
        });
        
        if (confirmed) {
            const response = NotificacionService.marcarTodasComoLeidas();
            
            if (response.success) {
                Toast.success(response.message);
                this.renderNotificaciones();
                Navbar.updateNotificationBadge();
            }
        }
    }
    
    /**
     * Obtiene la clase de icono según el tipo
     */
    static getNotifIconClass(tipo) {
        const iconos = {
            [TIPOS_NOTIFICACION.STOCK_BAJO]: 'fa-exclamation-triangle',
            [TIPOS_NOTIFICACION.STOCK_CRITICO]: 'fa-exclamation-circle',
            [TIPOS_NOTIFICACION.SOLICITUD_LISTA]: 'fa-check-circle',
            [TIPOS_NOTIFICACION.INCIDENCIA]: 'fa-bug',
            [TIPOS_NOTIFICACION.NUEVA_SOLICITUD]: 'fa-clipboard-list',
            [TIPOS_NOTIFICACION.SISTEMA]: 'fa-info-circle',
            [TIPOS_NOTIFICACION.RECORDATORIO]: 'fa-clock'
        };
        
        return iconos[tipo] || 'fa-bell';
    }
    
    /**
     * Obtiene la clase de color según el tipo
     */
    static getNotifColorClass(tipo) {
        const colores = {
            [TIPOS_NOTIFICACION.STOCK_BAJO]: 'warning',
            [TIPOS_NOTIFICACION.STOCK_CRITICO]: 'danger',
            [TIPOS_NOTIFICACION.SOLICITUD_LISTA]: 'success',
            [TIPOS_NOTIFICACION.INCIDENCIA]: 'warning',
            [TIPOS_NOTIFICACION.NUEVA_SOLICITUD]: 'info',
            [TIPOS_NOTIFICACION.SISTEMA]: 'info',
            [TIPOS_NOTIFICACION.RECORDATORIO]: 'secondary'
        };
        
        return colores[tipo] || 'info';
    }
    
    /**
     * Actualiza la vista
     */
    static refresh() {
        console.log('🔄 Actualizando notificaciones...');
        this.renderNotificaciones();
        Navbar.updateNotificationBadge();
    }
}

// Estilos específicos para notificaciones
const notificacionStyles = document.createElement('style');
notificacionStyles.textContent = `
    .notificaciones-fecha {
        color: var(--gray-700);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .notificacion-item {
        display: flex;
        gap: 1rem;
        padding: 1.25rem;
        border: none;
        border-bottom: 1px solid var(--gray-200);
        transition: all var(--transition-fast);
    }
    
    .notificacion-item:hover {
        background: var(--gray-50);
    }
    
    .notificacion-item:last-child {
        border-bottom: none;
    }
    
    .notif-no-leida {
        background: rgba(0, 104, 74, 0.03);
        border-left: 3px solid var(--primary-green);
    }
    
    .notif-leida {
        opacity: 0.7;
    }
    
    .notif-icon-wrapper {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-lg);
        flex-shrink: 0;
        font-size: 1.125rem;
    }
    
    .notif-icon-wrapper.success {
        background: rgba(19, 170, 82, 0.1);
        color: var(--success);
    }
    
    .notif-icon-wrapper.warning {
        background: rgba(255, 167, 38, 0.1);
        color: var(--warning);
    }
    
    .notif-icon-wrapper.danger {
        background: rgba(239, 83, 80, 0.1);
        color: var(--danger);
    }
    
    .notif-icon-wrapper.info {
        background: rgba(41, 182, 246, 0.1);
        color: var(--info);
    }
    
    .notif-icon-wrapper.secondary {
        background: var(--gray-100);
        color: var(--gray-600);
    }
    
    .notif-content-wrapper {
        flex: 1;
        min-width: 0;
    }
    
    .notif-header-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }
    
    .notif-titulo {
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        color: var(--dark-slate);
        margin: 0;
    }
    
    .notif-mensaje {
        font-size: var(--font-size-sm);
        color: var(--gray-700);
        line-height: 1.5;
        margin: 0;
    }
    
    .notif-actions {
        display: flex;
        gap: 0.25rem;
        flex-shrink: 0;
    }
    
    .notif-footer-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notif-tiempo {
        font-size: var(--font-size-xs);
        color: var(--gray-600);
    }
    
    @media (max-width: 768px) {
        .notificacion-item {
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .notif-header-row {
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .notif-footer-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
    }
`;

document.head.appendChild(notificacionStyles);

// Hacer disponible globalmente
globalThis.NotificacionController = NotificacionController;

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificacionController;
}