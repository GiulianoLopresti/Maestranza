// ============================================
// CONTROLADOR DEL DASHBOARD
// Maestranza Unidos S.A.
// ============================================

/**
 * Controlador para manejar el dashboard principal
 */
class DashboardController {
    
    /**
     * Inicializa el dashboard
     */
    static init() {
        console.log('📊 Inicializando Dashboard...');
        this.render();
        this.setupEventListeners();
        this.loadData();
    }
    
    /**
     * Renderiza el dashboard
     */
    static render() {
        const app = document.getElementById('app');
        const currentUser = AuthService.getCurrentUser();
        
        app.innerHTML = `
            <div class="dashboard-layout">
                <!-- Sidebar -->
                ${Sidebar.render('/dashboard')}
                
                <!-- Main Content -->
                <div class="dashboard-main" id="dashboardMain">
                    <!-- Navbar -->
                    ${Navbar.render('Dashboard')}
                    
                    <!-- Content -->
                    <div class="dashboard-content">
                        <!-- Header -->
                        <div class="dashboard-header">
                            <h1>¡Bienvenido, ${escaparHTML(currentUser.nombre)}!</h1>
                            <p>Resumen del estado actual del inventario</p>
                        </div>
                        
                        <!-- KPIs -->
                        <div class="kpi-grid" id="kpiGrid">
                            <!-- KPIs se cargan dinámicamente -->
                        </div>
                        
                        <!-- Charts y Tablas -->
                        <div class="row">
                            <div class="col-12 col-lg-6">
                                <div class="chart-container">
                                    <div class="chart-header">
                                        <h3 class="chart-title">Stock por Categoría</h3>
                                    </div>
                                    <div id="stockChart" style="min-height: 300px; display: flex; align-items: center; justify-content: center; color: var(--gray-500);">
                                        <i class="fas fa-chart-pie" style="font-size: 3rem; margin-right: 1rem;"></i>
                                        <span>Gráfico próximamente</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-12 col-lg-6">
                                <div class="chart-container">
                                    <div class="chart-header">
                                        <h3 class="chart-title">Movimientos del Mes</h3>
                                    </div>
                                    <div id="movimientosChart" style="min-height: 300px; display: flex; align-items: center; justify-content: center; color: var(--gray-500);">
                                        <i class="fas fa-chart-line" style="font-size: 3rem; margin-right: 1rem;"></i>
                                        <span>Gráfico próximamente</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Últimos Movimientos -->
                        <div class="table-container">
                            <div class="table-header">
                                <h3 class="table-title">Últimos Movimientos</h3>
                                <button class="btn btn-sm btn-outline-primary" onclick="DashboardController.verTodosMovimientos()">
                                    Ver todos
                                    <i class="fas fa-arrow-right ms-1"></i>
                                </button>
                            </div>
                            <div class="table-wrapper" id="movimientosTable">
                                <!-- Tabla se carga dinámicamente -->
                            </div>
                        </div>
                        
                        <!-- Piezas con Stock Bajo -->
                        <div class="table-container">
                            <div class="table-header">
                                <h3 class="table-title">
                                    <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                                    Piezas con Stock Bajo
                                </h3>
                                <button class="btn btn-sm btn-outline-primary" onclick="DashboardController.verInventario()">
                                    Ver inventario
                                    <i class="fas fa-arrow-right ms-1"></i>
                                </button>
                            </div>
                            <div class="table-wrapper" id="stockBajoTable">
                                <!-- Tabla se carga dinámicamente -->
                            </div>
                        </div>
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
        
        // Responsive sidebar
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.remove('mobile-open');
                }
            }
        });
    }
    
    /**
     * Carga los datos del dashboard
     */
    static loadData() {
        this.loadKPIs();
        this.loadUltimosMovimientos();
        this.loadStockBajo();
    }
    
    /**
     * Carga los KPIs
     */
    static loadKPIs() {
        const kpiGrid = document.getElementById('kpiGrid');
        if (!kpiGrid) return;
        
        // Obtener datos
        const piezas = PiezaStorage.getAll();
        const movimientos = MovimientoStorage.getAll();
        const stockBajo = PiezaStorage.getStockBajo();
        const stockCritico = PiezaStorage.getStockCritico();
        const solicitudes = SolicitudStorage.getAll();
        
        // Calcular valor total del inventario
        const valorTotal = piezas.reduce((sum, p) => sum + (p.stock_actual * p.precio_unitario), 0);
        
        // Filtrar movimientos del mes actual
        const ahora = new Date();
        const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const movimientosMes = movimientos.filter(m => 
            new Date(m.fecha_movimiento) >= primerDiaMes
        );
        
        // Solicitudes pendientes
        const solicitudesPendientes = solicitudes.filter(s => 
            s.estado === ESTADOS_SOLICITUD.PENDIENTE || 
            s.estado === ESTADOS_SOLICITUD.EN_PREPARACION
        ).length;
        
        // Renderizar KPIs
        const kpis = [
            {
                title: 'Total Piezas',
                value: piezas.length,
                icon: 'fa-boxes',
                type: 'info',
                footer: `${piezas.filter(p => p.activo).length} activas`
            },
            {
                title: 'Valor Total Inventario',
                value: formatearPrecio(valorTotal),
                icon: 'fa-dollar-sign',
                type: 'success',
                footer: `En ${piezas.length} piezas`
            },
            {
                title: 'Stock Bajo',
                value: stockBajo.length,
                icon: 'fa-exclamation-triangle',
                type: 'warning',
                footer: `${stockCritico.length} críticos`
            },
            {
                title: 'Solicitudes Pendientes',
                value: solicitudesPendientes,
                icon: 'fa-clipboard-list',
                type: solicitudesPendientes > 0 ? 'warning' : 'success',
                footer: `${solicitudes.length} totales`
            },
            {
                title: 'Movimientos del Mes',
                value: movimientosMes.length,
                icon: 'fa-exchange-alt',
                type: 'info',
                footer: `${movimientos.length} totales`
            },
            {
                title: 'Categorías',
                value: CategoriaStorage.getAll().length,
                icon: 'fa-tags',
                type: 'info',
                footer: 'Categorías activas'
            }
        ];
        
        kpiGrid.innerHTML = kpis.map(kpi => this.renderKPI(kpi)).join('');
    }
    
    /**
     * Renderiza un KPI
     * @param {Object} kpi - Datos del KPI
     * @returns {string}
     */
    static renderKPI(kpi) {
        return `
            <div class="kpi-card ${kpi.type}">
                <div class="kpi-header">
                    <span class="kpi-title">${kpi.title}</span>
                    <div class="kpi-icon">
                        <i class="fas ${kpi.icon}"></i>
                    </div>
                </div>
                <div class="kpi-value">${kpi.value}</div>
                <div class="kpi-footer">
                    <span>${kpi.footer}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Carga los últimos movimientos
     */
    static loadUltimosMovimientos() {
        const tableContainer = document.getElementById('movimientosTable');
        if (!tableContainer) return;
        
        const movimientos = MovimientoStorage.getAll()
            .sort((a, b) => new Date(b.fecha_movimiento) - new Date(a.fecha_movimiento))
            .slice(0, 5);
        
        if (movimientos.length === 0) {
            tableContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exchange-alt empty-state-icon"></i>
                    <h3 class="empty-state-title">No hay movimientos</h3>
                    <p class="empty-state-text">Los movimientos de inventario aparecerán aquí</p>
                </div>
            `;
            return;
        }
        
        const rows = movimientos.map(mov => {
            const pieza = PiezaStorage.findById(mov.pieza_id);
            const usuario = UsuarioStorage.findById(mov.usuario_id);
            
            return `
                <tr>
                    <td>
                        <span class="badge badge-${this.getMovimientoColor(mov.tipo_movimiento)}">
                            ${mov.tipo_movimiento}
                        </span>
                    </td>
                    <td>${pieza ? escaparHTML(pieza.nombre) : '-'}</td>
                    <td>${mov.cantidad}</td>
                    <td>${usuario ? escaparHTML(usuario.nombre) : '-'}</td>
                    <td>${formatearFechaHora(mov.fecha_movimiento)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="DashboardController.verMovimiento(${mov.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        tableContainer.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Pieza</th>
                        <th>Cantidad</th>
                        <th>Usuario</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }
    
    /**
     * Carga las piezas con stock bajo
     */
    static loadStockBajo() {
        const tableContainer = document.getElementById('stockBajoTable');
        if (!tableContainer) return;
        
        const piezas = PiezaStorage.getStockBajo();
        
        if (piezas.length === 0) {
            tableContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle empty-state-icon" style="color: var(--success);"></i>
                    <h3 class="empty-state-title">Todo el stock está bien</h3>
                    <p class="empty-state-text">No hay piezas con stock bajo o crítico</p>
                </div>
            `;
            return;
        }
        
        const rows = piezas.map(pieza => {
            const porcentaje = calcularPorcentajeStock(pieza.stock_actual, pieza.stock_minimo);
            const estado = obtenerEstadoStock(pieza.stock_actual, pieza.stock_minimo);
            
            return `
                <tr>
                    <td>${escaparHTML(pieza.numero_serie)}</td>
                    <td>${escaparHTML(pieza.nombre)}</td>
                    <td>
                        <span class="badge ${obtenerClaseBadgeStock(pieza.stock_actual, pieza.stock_minimo)}">
                            ${pieza.stock_actual} / ${pieza.stock_minimo}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="flex: 1; background: var(--gray-200); height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="width: ${porcentaje}%; height: 100%; background: ${estado === 'critico' ? 'var(--danger)' : 'var(--warning)'}; transition: width 0.3s;"></div>
                            </div>
                            <span style="font-size: 0.875rem; color: var(--gray-600); min-width: 40px;">${porcentaje}%</span>
                        </div>
                    </td>
                    <td>${escaparHTML(pieza.ubicacion)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="DashboardController.verPieza(${pieza.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        tableContainer.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Número Serie</th>
                        <th>Nombre</th>
                        <th>Stock</th>
                        <th>Nivel</th>
                        <th>Ubicación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }
    
    /**
     * Obtiene el color del badge según el tipo de movimiento
     * @param {string} tipo
     * @returns {string}
     */
    static getMovimientoColor(tipo) {
        switch (tipo) {
            case TIPOS_MOVIMIENTO.ENTRADA:
                return 'success';
            case TIPOS_MOVIMIENTO.SALIDA:
                return 'danger';
            case TIPOS_MOVIMIENTO.TRANSFERENCIA:
                return 'info';
            case TIPOS_MOVIMIENTO.AJUSTE:
                return 'warning';
            case TIPOS_MOVIMIENTO.DEVOLUCION:
                return 'secondary';
            default:
                return 'secondary';
        }
    }
    
    /**
     * Ver detalles de un movimiento
     * @param {number} id
     */
    static verMovimiento(id) {
        const movimiento = MovimientoStorage.findById(id);
        if (!movimiento) {
            Toast.error('Movimiento no encontrado');
            return;
        }
        
        const pieza = PiezaStorage.findById(movimiento.pieza_id);
        const usuario = UsuarioStorage.findById(movimiento.usuario_id);
        
        Toast.info(`
            <strong>${movimiento.tipo_movimiento}</strong><br>
            Pieza: ${pieza ? pieza.nombre : '-'}<br>
            Cantidad: ${movimiento.cantidad}<br>
            Usuario: ${usuario ? usuario.nombre : '-'}<br>
            Fecha: ${formatearFechaHora(movimiento.fecha_movimiento)}
        `, 6000);
    }
    
    /**
     * Ver detalles de una pieza
     * @param {number} id
     */
    static verPieza(id) {
        const pieza = PiezaStorage.findById(id);
        if (!pieza) {
            Toast.error('Pieza no encontrada');
            return;
        }
        
        Toast.info(`
            <strong>${pieza.nombre}</strong><br>
            Serie: ${pieza.numero_serie}<br>
            Stock: ${pieza.stock_actual} / ${pieza.stock_minimo}<br>
            Ubicación: ${pieza.ubicacion}<br>
            Precio: ${formatearPrecio(pieza.precio_unitario)}
        `, 6000);
    }
    
    /**
     * Navegar a todos los movimientos
     */
    static verTodosMovimientos() {
        Toast.info('Módulo de Movimientos - Próximamente');
    }
    
    /**
     * Navegar al inventario
     */
    static verInventario() {
        Toast.info('Módulo de Inventario - Próximamente');
    }
    
    /**
     * Actualiza los datos del dashboard
     */
    static refresh() {
        console.log('🔄 Actualizando dashboard...');
        this.loadData();
        Sidebar.updateBadges();
        Navbar.updateNotificationBadge();
        Toast.success('Dashboard actualizado', 2000);
    }
}

// Hacer disponible globalmente
globalThis.DashboardController = DashboardController;

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardController;
}