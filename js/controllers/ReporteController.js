// ============================================
// CONTROLADOR DE REPORTES
// Maestranza Unidos S.A.
// ============================================

/**
 * Controlador para el módulo de reportes
 * HU #11, #13, #14
 */
class ReporteController {
    
    /**
     * Inicializa el módulo de reportes
     */
    static init() {
        console.log('📊 Inicializando Módulo de Reportes...');
        this.render();
        this.setupEventListeners();
    }
    
    /**
     * Renderiza la vista de reportes
     */
    static render() {
        const app = document.getElementById('app');
        const proyectos = StorageManager.getItem(STORAGE_KEYS.PROYECTOS, []);
        
        app.innerHTML = `
            <div class="dashboard-layout">
                <!-- Sidebar -->
                ${Sidebar.render('/reportes')}
                
                <!-- Main Content -->
                <div class="dashboard-main" id="dashboardMain">
                    <!-- Navbar -->
                    ${Navbar.render('Reportes')}
                    
                    <!-- Content -->
                    <div class="dashboard-content">
                        <!-- Header -->
                        <div class="dashboard-header">
                            <div>
                                <h1>
                                    <i class="fas fa-chart-bar me-3"></i>
                                    Centro de Reportes
                                </h1>
                                <p>Genera y programa reportes del sistema</p>
                            </div>
                        </div>
                        
                        <!-- Tabs de Tipos de Reportes -->
                        <div class="card mb-4">
                            <div class="card-body">
                                <div class="tabs-container">
                                    <ul class="tabs-list" id="reporteTabs">
                                        <li class="tab-item active" data-tab="instantaneos">
                                            <i class="fas fa-bolt me-2"></i>
                                            Reportes Instantáneos
                                        </li>
                                        <li class="tab-item" data-tab="programados">
                                            <i class="fas fa-calendar-alt me-2"></i>
                                            Reportes Programados
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab Content: Reportes Instantáneos -->
                        <div id="tab-instantaneos" class="tab-pane active">
                            <div class="row">
                                <!-- Inventario General -->
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <div class="d-flex align-items-start mb-3">
                                                <div class="stat-icon me-3" style="background: rgba(0, 104, 74, 0.1); color: var(--primary-green); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg);">
                                                    <i class="fas fa-boxes fa-lg"></i>
                                                </div>
                                                <div>
                                                    <h5 class="mb-1">Inventario General</h5>
                                                    <p class="text-muted small mb-0">Listado completo de piezas</p>
                                                </div>
                                            </div>
                                            <button class="btn btn-primary w-100" onclick="ReporteController.generarInventarioGeneral()">
                                                <i class="fas fa-file-alt me-2"></i>
                                                Generar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Stock Bajo -->
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <div class="d-flex align-items-start mb-3">
                                                <div class="stat-icon me-3" style="background: rgba(255, 167, 38, 0.1); color: var(--warning); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg);">
                                                    <i class="fas fa-exclamation-triangle fa-lg"></i>
                                                </div>
                                                <div>
                                                    <h5 class="mb-1">Stock Bajo Mínimo</h5>
                                                    <p class="text-muted small mb-0">Piezas bajo stock mínimo</p>
                                                </div>
                                            </div>
                                            <button class="btn btn-warning w-100" onclick="ReporteController.generarStockBajo()">
                                                <i class="fas fa-file-alt me-2"></i>
                                                Generar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Movimientos -->
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <div class="d-flex align-items-start mb-3">
                                                <div class="stat-icon me-3" style="background: rgba(41, 182, 246, 0.1); color: var(--info); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg);">
                                                    <i class="fas fa-exchange-alt fa-lg"></i>
                                                </div>
                                                <div>
                                                    <h5 class="mb-1">Movimientos</h5>
                                                    <p class="text-muted small mb-0">Historial de movimientos</p>
                                                </div>
                                            </div>
                                            <button class="btn btn-info w-100" onclick="ReporteController.mostrarFormMovimientos()">
                                                <i class="fas fa-file-alt me-2"></i>
                                                Generar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Por Proyecto -->
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <div class="d-flex align-items-start mb-3">
                                                <div class="stat-icon me-3" style="background: rgba(212, 165, 116, 0.1); color: var(--desert-primary); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg);">
                                                    <i class="fas fa-project-diagram fa-lg"></i>
                                                </div>
                                                <div>
                                                    <h5 class="mb-1">Por Proyecto</h5>
                                                    <p class="text-muted small mb-0">Consumo por proyecto</p>
                                                </div>
                                            </div>
                                            <select class="form-control form-control-sm mb-2" id="selectProyecto">
                                                <option value="">Seleccionar proyecto...</option>
                                                ${proyectos.map(p => `
                                                    <option value="${p.id}">${escaparHTML(p.nombre)}</option>
                                                `).join('')}
                                            </select>
                                            <button class="btn btn-outline-primary w-100" onclick="ReporteController.generarPorProyecto()">
                                                <i class="fas fa-file-alt me-2"></i>
                                                Generar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Actividad de Usuarios -->
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <div class="d-flex align-items-start mb-3">
                                                <div class="stat-icon me-3" style="background: rgba(171, 71, 188, 0.1); color: #AB47BC; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg);">
                                                    <i class="fas fa-users fa-lg"></i>
                                                </div>
                                                <div>
                                                    <h5 class="mb-1">Actividad Usuarios</h5>
                                                    <p class="text-muted small mb-0">Estadísticas de uso</p>
                                                </div>
                                            </div>
                                            <button class="btn btn-outline-secondary w-100" onclick="ReporteController.generarActividadUsuarios()">
                                                <i class="fas fa-file-alt me-2"></i>
                                                Generar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Valorizado -->
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <div class="d-flex align-items-start mb-3">
                                                <div class="stat-icon me-3" style="background: rgba(19, 170, 82, 0.1); color: var(--success); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg);">
                                                    <i class="fas fa-dollar-sign fa-lg"></i>
                                                </div>
                                                <div>
                                                    <h5 class="mb-1">Inventario Valorizado</h5>
                                                    <p class="text-muted small mb-0">Valor por categoría</p>
                                                </div>
                                            </div>
                                            <button class="btn btn-success w-100" onclick="ReporteController.generarValorizado()">
                                                <i class="fas fa-file-alt me-2"></i>
                                                Generar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tab Content: Reportes Programados -->
                        <div id="tab-programados" class="tab-pane">
                            <div class="card">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h5 class="mb-0">Reportes Programados</h5>
                                        <button class="btn btn-primary" onclick="ReporteController.programarNuevoReporte()">
                                            <i class="fas fa-plus me-2"></i>
                                            Programar Reporte
                                        </button>
                                    </div>
                                    
                                    <div id="reportesProgramadosContainer">
                                        <!-- Se carga dinámicamente -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Cargar reportes programados
        this.cargarReportesProgramados();
    }
    
    /**
     * Configura los event listeners
     */
    static setupEventListeners() {
        // Inicializar componentes
        Navbar.init();
        Sidebar.init();
        
        // Tabs
        const tabs = document.querySelectorAll('.tab-item');
        for (const tab of tabs) {
            tab.addEventListener('click', () => {
                this.cambiarTab(tab.dataset.tab);
            });
        }
    }
    
    /**
     * Cambia entre tabs
     */
    static cambiarTab(tabId) {
        // Actualizar tabs
        for (const tab of document.querySelectorAll('.tab-item')) {
            tab.classList.remove('active');
        }
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        // Actualizar contenido
        for (const pane of document.querySelectorAll('.tab-pane')) {
            pane.classList.remove('active');
        }
        document.getElementById(`tab-${tabId}`).classList.add('active');
        
        // Si es tab de programados, recargar lista
        if (tabId === 'programados') {
            this.cargarReportesProgramados();
        }
    }
    
    /**
     * Genera reporte de inventario general
     */
    static generarInventarioGeneral() {
        const reporte = ReporteService.generarInventarioGeneral();
        this.mostrarReporte(reporte);
    }
    
    /**
     * Genera reporte de stock bajo
     */
    static generarStockBajo() {
        const reporte = ReporteService.generarStockBajo();
        this.mostrarReporte(reporte);
    }
    
    /**
     * Muestra formulario para reporte de movimientos
     */
    static async mostrarFormMovimientos() {
        const body = `
            <form id="formReporteMovimientos">
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label">Fecha Inicio</label>
                            <input type="date" class="form-control" id="movFechaInicio">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label">Fecha Fin</label>
                            <input type="date" class="form-control" id="movFechaFin" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tipo de Movimiento</label>
                    <select class="form-control" id="movTipo">
                        <option value="">Todos</option>
                        ${Object.entries(TIPOS_MOVIMIENTO).map(([k, v]) => `
                            <option value="${v}">${v}</option>
                        `).join('')}
                    </select>
                </div>
            </form>
        `;
        
        const { id } = Modal.show({
            title: 'Reporte de Movimientos',
            body,
            footer: `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="generarMovBtn">
                    <i class="fas fa-file-alt me-2"></i>
                    Generar Reporte
                </button>
            `,
            size: 'md'
        });
        
        setTimeout(() => {
            document.getElementById('generarMovBtn').addEventListener('click', () => {
                const filtros = {
                    fechaInicio: document.getElementById('movFechaInicio').value || null,
                    fechaFin: document.getElementById('movFechaFin').value || null,
                    tipo: document.getElementById('movTipo').value || null
                };
                
                bootstrap.Modal.getInstance(document.getElementById(id)).hide();
                const reporte = ReporteService.generarMovimientos(filtros);
                this.mostrarReporte(reporte);
            });
        }, 100);
    }
    
    /**
     * Genera reporte por proyecto
     * HU #13
     */
    static generarPorProyecto() {
        const proyectoId = Number.parseInt(document.getElementById('selectProyecto').value);
        
        if (!proyectoId) {
            Toast.warning('Selecciona un proyecto');
            return;
        }
        
        const reporte = ReporteService.generarPorProyecto(proyectoId);
        
        if (reporte.error) {
            Toast.error(reporte.message);
            return;
        }
        
        this.mostrarReporte(reporte);
    }
    
    /**
     * Genera reporte de actividad de usuarios
     * HU #14
     */
    static generarActividadUsuarios() {
        const reporte = ReporteService.generarActividadUsuarios();
        this.mostrarReporte(reporte);
    }
    
    /**
     * Genera reporte valorizado
     */
    static generarValorizado() {
        const reporte = ReporteService.generarInventarioValorizado();
        this.mostrarReporte(reporte);
    }
    
    /**
     * Muestra un reporte generado
     */
    static mostrarReporte(reporte) {
        const body = this.renderReporte(reporte);
        
        Modal.show({
            title: `${reporte.tipo} - ${formatearFechaHora(reporte.fecha_generacion)}`,
            body,
            footer: `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-success" onclick="ReporteController.descargarReporte(${JSON.stringify(reporte).replace(/"/g, '&quot;')})">
                    <i class="fas fa-download me-2"></i>
                    Descargar CSV
                </button>
            `,
            size: 'xl'
        });
    }
    
    /**
     * Renderiza el contenido del reporte
     */
    static renderReporte(reporte) {
        let html = '<div class="reporte-content">';
        
        // Resumen
        if (reporte.resumen) {
            html += '<div class="mb-4"><h6 class="mb-3">Resumen</h6><div class="row">';
            for (const [key, value] of Object.entries(reporte.resumen)) {
                if (typeof value === 'object') continue;
                html += `
                    <div class="col-md-3 mb-2">
                        <div class="p-3 border rounded">
                            <small class="text-muted d-block">${this.formatKey(key)}</small>
                            <strong>${this.formatValue(key, value)}</strong>
                        </div>
                    </div>
                `;
            }
            html += '</div></div>';
        }
        
        // Datos en tabla
        if (reporte.datos && Array.isArray(reporte.datos) && reporte.datos.length > 0) {
            html += '<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr>';
            
            const headers = Object.keys(reporte.datos[0]);
            for (const header of headers) {
                html += `<th>${this.formatKey(header)}</th>`;
            }
            html += '</tr></thead><tbody>';
            
            for (const row of reporte.datos.slice(0, 50)) {
                html += '<tr>';
                for (const header of headers) {
                    html += `<td>${this.formatValue(header, row[header])}</td>`;
                }
                html += '</tr>';
            }
            
            html += '</tbody></table>';
            
            if (reporte.datos.length > 50) {
                html += `<p class="text-muted text-center mt-2">Mostrando 50 de ${reporte.datos.length} registros. Descarga el CSV para ver todos.</p>`;
            }
            
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }
    
    /**
     * Formatea una clave para mostrar
     */
    static formatKey(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    /**
     * Formatea un valor según su tipo
     */
    static formatValue(key, value) {
        if (value === null || value === undefined) return '-';
        
        if (key.includes('fecha') || key.includes('creado') || key.includes('actualizado')) {
            return formatearFechaHora(value);
        }
        
        if (key.includes('precio') || key.includes('costo') || key.includes('valor')) {
            return formatearPrecio(value);
        }
        
        if (key.includes('porcentaje')) {
            return formatearPorcentaje(value);
        }
        
        if (typeof value === 'number') {
            return formatearNumero(value);
        }
        
        return escaparHTML(String(value));
    }
    
    /**
     * Descarga un reporte como CSV
     */
    static descargarReporte(reporte) {
        const csv = ReporteService.exportarCSV(reporte);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const filename = `${reporte.tipo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        Toast.success('Reporte descargado exitosamente');
    }
    
    /**
     * Programa un nuevo reporte
     * HU #11
     */
    static async programarNuevoReporte() {
        const body = `
            <form id="formProgramarReporte">
                <div class="form-group">
                    <label class="form-label">Tipo de Reporte <span class="text-danger">*</span></label>
                    <select class="form-control" id="tipoReporte" required>
                        ${Object.entries(TIPOS_REPORTE).map(([k, v]) => `
                            <option value="${v}">${v}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Frecuencia <span class="text-danger">*</span></label>
                    <select class="form-control" id="frecuenciaReporte" required>
                        ${Object.entries(FRECUENCIAS_REPORTE).map(([k, v]) => `
                            <option value="${v}">${v}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Destinatarios (emails separados por coma) <span class="text-danger">*</span></label>
                    <textarea class="form-control" id="destinatarios" rows="2" required placeholder="usuario1@empresa.cl, usuario2@empresa.cl"></textarea>
                </div>
            </form>
        `;
        
        const { id } = Modal.show({
            title: 'Programar Reporte Automático',
            body,
            footer: `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="guardarProgramacionBtn">
                    <i class="fas fa-save me-2"></i>
                    Programar
                </button>
            `,
            size: 'md'
        });
        
        setTimeout(() => {
            document.getElementById('guardarProgramacionBtn').addEventListener('click', () => {
                const form = document.getElementById('formProgramarReporte');
                
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
                
                const config = {
                    tipo: document.getElementById('tipoReporte').value,
                    frecuencia: document.getElementById('frecuenciaReporte').value,
                    destinatarios: document.getElementById('destinatarios').value.split(',').map(e => e.trim())
                };
                
                const response = ReporteService.programarReporte(config);
                
                if (response.success) {
                    Toast.success(response.message);
                    bootstrap.Modal.getInstance(document.getElementById(id)).hide();
                    this.cargarReportesProgramados();
                } else {
                    Toast.error(response.message);
                }
            });
        }, 100);
    }
    
    /**
     * Carga la lista de reportes programados
     */
    static cargarReportesProgramados() {
        const container = document.getElementById('reportesProgramadosContainer');
        if (!container) return;
        
        const reportes = ReporteService.getReportesProgramados();
        
        if (reportes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times empty-state-icon"></i>
                    <h5 class="empty-state-title">No hay reportes programados</h5>
                    <p class="empty-state-text">Programa reportes automáticos para recibirlos periódicamente</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Frecuencia</th>
                            <th>Destinatarios</th>
                            <th>Próxima Ejecución</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportes.map(r => `
                            <tr>
                                <td>${r.tipo}</td>
                                <td>${r.frecuencia}</td>
                                <td>${r.destinatarios.length} destinatario(s)</td>
                                <td>${formatearFechaHora(r.proxima_ejecucion)}</td>
                                <td>
                                    <span class="badge badge-${r.activo ? 'success' : 'secondary'}">
                                        ${r.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Hacer disponible globalmente
globalThis.ReporteController = ReporteController;

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReporteController;
}