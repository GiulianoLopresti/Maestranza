// ============================================
// CONTROLADOR DE CONFIGURACIÓN Y RESPALDOS
// UI para HU #9
// ============================================

class ConfiguracionController {
    
    static init() {
        console.log('⚙️ Inicializando módulo de configuración...');
        this.render();
        this.setupEventListeners();
        this.loadData();
    }
    
    static render() {
        const app = document.getElementById('app');
        const stats = BackupService.getEstadisticas();
        
        app.innerHTML = `
            <div class="dashboard-layout">
                ${Sidebar.render('/configuracion')}
                
                <div class="dashboard-main">
                    ${Navbar.render('Configuración')}
                    
                    <div class="dashboard-content">
                        <div class="dashboard-header">
                            <h1>
                                <i class="fas fa-cog me-3"></i>
                                Configuración del Sistema
                            </h1>
                            <p>Gestión de respaldos y configuraciones avanzadas</p>
                        </div>
                        
                        <!-- Sección de Respaldos -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h3 class="mb-0">
                                    <i class="fas fa-database me-2"></i>
                                    Respaldos Automáticos
                                </h3>
                            </div>
                            <div class="card-body">
                                <div class="row mb-4">
                                    <div class="col-md-3">
                                        <div class="text-center p-3 bg-light rounded">
                                            <div class="fs-3 text-primary mb-2">
                                                <i class="fas fa-save"></i>
                                            </div>
                                            <div class="fw-bold">${stats.total}</div>
                                            <small class="text-muted">Respaldos totales</small>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="text-center p-3 bg-light rounded">
                                            <div class="fs-3 text-success mb-2">
                                                <i class="fas fa-clock"></i>
                                            </div>
                                            <div class="fw-bold">${stats.porTipo.automatico}</div>
                                            <small class="text-muted">Automáticos</small>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="text-center p-3 bg-light rounded">
                                            <div class="fs-3 text-info mb-2">
                                                <i class="fas fa-hand-pointer"></i>
                                            </div>
                                            <div class="fw-bold">${stats.porTipo.manual}</div>
                                            <small class="text-muted">Manuales</small>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="text-center p-3 bg-light rounded">
                                            <div class="fs-3 text-warning mb-2">
                                                <i class="fas fa-hdd"></i>
                                            </div>
                                            <div class="fw-bold">${stats.tamañoTotal}</div>
                                            <small class="text-muted">Espacio usado</small>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="d-flex gap-2 mb-3">
                                    <button class="btn btn-primary" onclick="ConfiguracionController.crearBackup()">
                                        <i class="fas fa-plus me-2"></i>
                                        Crear Respaldo Manual
                                    </button>
                                    <button class="btn btn-outline-secondary" onclick="ConfiguracionController.refresh()">
                                        <i class="fas fa-sync me-2"></i>
                                        Actualizar
                                    </button>
                                </div>
                                
                                <div id="backupsTable"></div>
                            </div>
                        </div>
                        
                        <!-- Configuración de Reposición Automática -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="mb-0">
                                    <i class="fas fa-magic me-2"></i>
                                    Reposición Automática de Stock
                                </h3>
                            </div>
                            <div class="card-body">
                                <p class="text-muted mb-3">
                                    Configura qué piezas deben generar órdenes de compra automáticamente cuando lleguen al stock mínimo.
                                </p>
                                
                                <div id="reposicionTable"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    static setupEventListeners() {
        Navbar.init();
        Sidebar.init();
    }
    
    static loadData() {
        this.loadBackups();
        this.loadReposicionConfig();
    }
    
    static loadBackups() {
        const backups = BackupService.getBackups().reverse(); // Más recientes primero
        
        new DataTable({
            containerId: 'backupsTable',
            data: backups,
            columns: [
                { header: 'ID', field: 'id' },
                { header: 'Fecha', field: 'timestamp', type: 'datetime' },
                {
                    header: 'Tipo',
                    field: 'tipo',
                    render: (row) => {
                        const colors = {
                            'automatico': 'success',
                            'manual': 'info',
                            'emergencia': 'warning'
                        };
                        return `<span class="badge badge-${colors[row.tipo]}">${capitalize(row.tipo)}</span>`;
                    }
                },
                { header: 'Descripción', field: 'descripcion' },
                {
                    header: 'Tamaño',
                    field: 'tamaño',
                    render: (row) => BackupService.formatBytes(row.tamaño)
                },
                {
                    header: 'Acciones',
                    field: 'id',
                    render: (row) => `
                        <div style="display: flex; gap: 0.25rem;">
                            <button class="btn btn-sm btn-outline-primary" 
                                onclick="ConfiguracionController.descargarBackup('${row.id}')" 
                                title="Descargar">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-success" 
                                onclick="ConfiguracionController.restaurarBackup('${row.id}')" 
                                title="Restaurar">
                                <i class="fas fa-undo"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" 
                                onclick="ConfiguracionController.eliminarBackup('${row.id}')" 
                                title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `
                }
            ],
            pageSize: 5,
            emptyMessage: 'No hay respaldos disponibles'
        });
    }
    
    static loadReposicionConfig() {
        const piezas = PiezaStorage.getAll().filter(p => p.activo).map(pieza => ({
            ...pieza,
            reposicion_auto: OrdenCompraService.tieneReposicionAutomatica(pieza.id)
        }));
        
        new DataTable({
            containerId: 'reposicionTable',
            data: piezas,
            columns: [
                { header: 'N° Serie', field: 'numero_serie' },
                { header: 'Nombre', field: 'nombre' },
                {
                    header: 'Stock',
                    field: 'stock_actual',
                    render: (row) => `
                        <span class="badge ${obtenerClaseBadgeStock(row.stock_actual, row.stock_minimo)}">
                            ${row.stock_actual} / ${row.stock_minimo}
                        </span>
                    `
                },
                {
                    header: 'Reposición Automática',
                    field: 'reposicion_auto',
                    render: (row) => `
                        <div class="form-check form-switch">
                            <input 
                                class="form-check-input" 
                                type="checkbox" 
                                id="reposicion_${row.id}"
                                ${row.reposicion_auto ? 'checked' : ''}
                                onchange="ConfiguracionController.toggleReposicion(${row.id}, this.checked)"
                            >
                            <label class="form-check-label" for="reposicion_${row.id}">
                                ${row.reposicion_auto ? 'Activa' : 'Inactiva'}
                            </label>
                        </div>
                    `
                }
            ],
            pageSize: 10,
            emptyMessage: 'No hay piezas para configurar'
        });
    }
    
    static crearBackup() {
        const backup = BackupService.crearRespaldoManual();
        if (backup) {
            this.refresh();
        }
    }
    
    static descargarBackup(id) {
        BackupService.descargarRespaldo(id);
    }
    
    static async restaurarBackup(id) {
        const confirmed = await Modal.confirm({
            title: 'Restaurar Respaldo',
            message: '⚠️ ADVERTENCIA: Esto sobrescribirá TODOS los datos actuales del sistema con los del respaldo seleccionado. ¿Estás seguro?',
            confirmText: 'Sí, Restaurar',
            type: 'danger'
        });
        
        if (confirmed) {
            const success = BackupService.restaurarRespaldo(id);
            if (success) {
                Toast.success('Respaldo restaurado exitosamente. Recargando...', 2000);
                setTimeout(() => globalThis.location.reload(), 2000);
            } else {
                Toast.error('Error al restaurar el respaldo');
            }
        }
    }
    
    static async eliminarBackup(id) {
        const confirmed = await Modal.confirm({
            title: 'Eliminar Respaldo',
            message: '¿Estás seguro de eliminar este respaldo? Esta acción no se puede deshacer.',
            confirmText: 'Eliminar',
            type: 'danger'
        });
        
        if (confirmed) {
            const success = BackupService.eliminarRespaldo(id);
            if (success) {
                Toast.success('Respaldo eliminado');
                this.refresh();
            } else {
                Toast.error('Error al eliminar respaldo');
            }
        }
    }
    
    static toggleReposicion(piezaId, habilitado) {
        OrdenCompraService.configurarReposicionAutomatica(piezaId, habilitado);
        
        const pieza = PiezaStorage.findById(piezaId);
        const mensaje = habilitado 
            ? `Reposición automática activada para "${pieza.nombre}"`
            : `Reposición automática desactivada para "${pieza.nombre}"`;
        
        Toast.success(mensaje, 3000);
    }
    
    static refresh() {
        this.loadData();
        Toast.info('Configuración actualizada', 2000);
    }
}

globalThis.ConfiguracionController = ConfiguracionController;