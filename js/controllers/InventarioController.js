// ============================================
// CONTROLADOR DE INVENTARIO
// Maestranza Unidos S.A.
// ============================================

/**
 * Controlador para el módulo de inventario
 * Cubre HU #1, #2, #3, #5
 */
class InventarioController {
    
    static dataTable = null;
    static filtros = {
        activo: true,
        categoria: null,
        stockBajo: false
    };
    
    /**
     * Inicializa el módulo de inventario
     */
    static init() {
        console.log('📦 Inicializando Módulo de Inventario...');
        this.render();
        this.setupEventListeners();
        this.loadData();
    }
    
    /**
     * Renderiza la vista de inventario
     */
    static render() {
        const app = document.getElementById('app');
        const categorias = CategoriaStorage.getAll();
        
        app.innerHTML = `
            <div class="dashboard-layout">
                <!-- Sidebar -->
                ${Sidebar.render('/inventario')}
                
                <!-- Main Content -->
                <div class="dashboard-main" id="dashboardMain">
                    <!-- Navbar -->
                    ${Navbar.render('Inventario')}
                    
                    <!-- Content -->
                    <div class="dashboard-content">
                        <!-- Header -->
                        <div class="dashboard-header">
                            <div>
                                <h1>
                                    <i class="fas fa-boxes me-3"></i>
                                    Inventario de Piezas
                                </h1>
                                <p>Gestión completa del inventario de piezas y componentes</p>
                            </div>
                        </div>
                        
                        <!-- Filtros -->
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="row align-items-end">
                                    <div class="col-md-3">
                                        <label class="form-label">Estado</label>
                                        <select class="form-control" id="filtroEstado">
                                            <option value="true">Activos</option>
                                            <option value="false">Inactivos</option>
                                            <option value="">Todos</option>
                                        </select>
                                    </div>
                                    
                                    <div class="col-md-3">
                                        <label class="form-label">Categoría</label>
                                        <select class="form-control" id="filtroCategoria">
                                            <option value="">Todas</option>
                                            ${categorias.map(cat => `
                                                <option value="${cat.id}">${escaparHTML(cat.nombre)}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    
                                    <div class="col-md-3">
                                        <div class="form-check" style="margin-top: 2rem;">
                                            <input 
                                                class="form-check-input" 
                                                type="checkbox" 
                                                id="filtroStockBajo"
                                            >
                                            <label class="form-check-label" for="filtroStockBajo">
                                                Solo stock bajo
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div class="col-md-3">
                                        <button class="btn btn-secondary w-100" onclick="InventarioController.limpiarFiltros()">
                                            <i class="fas fa-times me-2"></i>
                                            Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tabla de Inventario -->
                        <div id="inventarioTable"></div>
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
        document.getElementById('filtroEstado').addEventListener('change', (e) => {
            this.filtros.activo = e.target.value === '' ? null : e.target.value === 'true';
            this.aplicarFiltros();
        });
        
        document.getElementById('filtroCategoria').addEventListener('change', (e) => {
            this.filtros.categoria = e.target.value ? parseInt(e.target.value) : null;
            this.aplicarFiltros();
        });
        
        document.getElementById('filtroStockBajo').addEventListener('change', (e) => {
            this.filtros.stockBajo = e.target.checked;
            this.aplicarFiltros();
        });
    }
    
    /**
     * Carga los datos en la tabla
     */
    static loadData() {
        const piezas = InventarioService.getAll(this.filtros);
        
        // Configurar DataTable
        this.dataTable = new DataTable({
            containerId: 'inventarioTable',
            data: piezas,
            columns: [
                {
                    header: 'N° Serie',
                    field: 'numero_serie'
                },
                {
                    header: 'Nombre',
                    field: 'nombre'
                },
                {
                    header: 'Stock',
                    field: 'stock_actual',
                    render: (row) => {
                        const badge = obtenerClaseBadgeStock(row.stock_actual, row.stock_minimo);
                        return `
                            <span class="badge ${badge}">
                                ${row.stock_actual} / ${row.stock_minimo}
                            </span>
                        `;
                    }
                },
                {
                    header: 'Ubicación',
                    field: 'ubicacion'
                },
                {
                    header: 'Precio',
                    field: 'precio_unitario',
                    type: 'currency'
                },
                {
                    header: 'Categorías',
                    field: 'id',
                    render: (row) => {
                        const categorias = InventarioService.getCategoriasDepieza(row.id);
                        if (categorias.length === 0) return '-';
                        
                        return categorias.slice(0, 2).map(cat => `
                            <span class="badge" style="background-color: ${cat.color}; font-size: 0.7rem;">
                                ${escaparHTML(cat.nombre)}
                            </span>
                        `).join(' ') + (categorias.length > 2 ? ` +${categorias.length - 2}` : '');
                    }
                },
                {
                    header: 'Acciones',
                    field: 'id',
                    render: (row) => `
                        <div style="display: flex; gap: 0.25rem;">
                            <button 
                                class="btn btn-sm btn-outline-primary" 
                                onclick="InventarioController.verDetalle(${row.id})"
                                title="Ver detalles"
                            >
                                <i class="fas fa-eye"></i>
                            </button>
                            <button 
                                class="btn btn-sm btn-outline-success" 
                                onclick="InventarioController.editar(${row.id})"
                                title="Editar"
                            >
                                <i class="fas fa-edit"></i>
                            </button>
                            <button 
                                class="btn btn-sm btn-outline-danger" 
                                onclick="InventarioController.eliminar(${row.id})"
                                title="Eliminar"
                            >
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `
                }
            ],
            pageSize: 10,
            actions: [
                {
                    label: 'Nueva Pieza',
                    icon: 'fas fa-plus',
                    class: 'btn-primary',
                    onclick: 'InventarioController.nuevaPieza()'
                },
                {
                    label: 'Exportar',
                    icon: 'fas fa-download',
                    class: 'btn-outline-secondary',
                    onclick: 'InventarioController.exportar()'
                }
            ],
            emptyMessage: 'No hay piezas en el inventario'
        });
        
        // Guardar instancia global
        window.dataTableInstances['inventarioTable'] = this.dataTable;
    }
    
    /**
     * Aplica los filtros y recarga la tabla
     */
    static aplicarFiltros() {
        const piezas = InventarioService.getAll(this.filtros);
        this.dataTable.updateData(piezas);
        Toast.info(`${piezas.length} pieza(s) encontrada(s)`, 2000);
    }
    
    /**
     * Limpia todos los filtros
     */
    static limpiarFiltros() {
        this.filtros = {
            activo: true,
            categoria: null,
            stockBajo: false
        };
        
        document.getElementById('filtroEstado').value = 'true';
        document.getElementById('filtroCategoria').value = '';
        document.getElementById('filtroStockBajo').checked = false;
        
        this.aplicarFiltros();
    }
    
    /**
     * Abre el modal para crear una nueva pieza
     * HU #1 - Registro exitoso de una nueva pieza
     */
    static async nuevaPieza() {
        const result = await Modal.formPieza();
        
        if (result.confirmed) {
            const response = InventarioService.crear(result.datos);
            
            if (response.success) {
                Toast.success(response.message);
                this.aplicarFiltros();
                Sidebar.updateBadges();
            } else {
                Toast.error(response.message);
            }
        }
    }
    
    /**
     * Abre el modal para editar una pieza
     */
    static async editar(id) {
        const pieza = InventarioService.getById(id);
        if (!pieza) {
            Toast.error('Pieza no encontrada');
            return;
        }
        
        const result = await Modal.formPieza(pieza);
        
        if (result.confirmed) {
            const response = InventarioService.actualizar(id, result.datos);
            
            if (response.success) {
                Toast.success(response.message);
                this.aplicarFiltros();
                Sidebar.updateBadges();
            } else {
                Toast.error(response.message);
            }
        }
    }
    
    /**
     * Elimina una pieza (con confirmación)
     */
    static async eliminar(id) {
        const pieza = InventarioService.getById(id);
        if (!pieza) {
            Toast.error('Pieza no encontrada');
            return;
        }
        
        const confirmed = await Modal.confirm({
            title: 'Eliminar Pieza',
            message: `¿Estás seguro de que deseas eliminar la pieza "${pieza.nombre}"?`,
            confirmText: 'Sí, eliminar',
            type: 'danger'
        });
        
        if (confirmed) {
            const response = InventarioService.eliminar(id);
            
            if (response.success) {
                Toast.success(response.message);
                this.aplicarFiltros();
            } else {
                Toast.error(response.message);
            }
        }
    }
    
    /**
     * Muestra los detalles de una pieza
     * HU #3 - Ver historial de una pieza
     */
    static verDetalle(id) {
        Modal.verDetallesPieza(id);
    }
    
    /**
     * Exporta el inventario a CSV
     */
    static exportar() {
        const piezas = InventarioService.getAll(this.filtros);
        
        if (piezas.length === 0) {
            Toast.warning('No hay datos para exportar');
            return;
        }
        
        // Crear CSV
        const headers = ['Número Serie', 'Nombre', 'Stock Actual', 'Stock Mínimo', 'Ubicación', 'Precio', 'Unidad'];
        const rows = piezas.map(p => [
            p.numero_serie,
            p.nombre,
            p.stock_actual,
            p.stock_minimo,
            p.ubicacion,
            p.precio_unitario,
            p.unidad_medida
        ]);
        
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });
        
        // Descargar
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Toast.success('Inventario exportado exitosamente');
    }
    
    /**
     * Actualiza la vista
     */
    static refresh() {
        console.log('🔄 Actualizando inventario...');
        this.aplicarFiltros();
        Sidebar.updateBadges();
        Navbar.updateNotificationBadge();
    }
}

// Hacer disponible globalmente
window.InventarioController = InventarioController;

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InventarioController;
}