// ============================================
// CONTROLADOR DE SOLICITUDES
// Maestranza Unidos S.A.
// ============================================

/**
 * Controlador para el módulo de solicitudes de materiales
 * Cubre HU #10, #12, #15
 */
class SolicitudController {
    
    static dataTable = null;
    static filtros = {
        estado: null,
        fechaInicio: null,
        fechaFin: null
    };
    
    /**
     * Inicializa el módulo de solicitudes
     */
    static init() {
        console.log('📋 Inicializando Módulo de Solicitudes...');
        this.render();
        this.setupEventListeners();
        this.loadData();
    }
    
    /**
     * Renderiza la vista de solicitudes
     */
    static render() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="dashboard-layout">
                <!-- Sidebar -->
                ${Sidebar.render('/solicitudes')}
                
                <!-- Main Content -->
                <div class="dashboard-main" id="dashboardMain">
                    <!-- Navbar -->
                    ${Navbar.render('Solicitudes de Materiales')}
                    
                    <!-- Content -->
                    <div class="dashboard-content">
                        <!-- Header -->
                        <div class="dashboard-header">
                            <div>
                                <h1>
                                    <i class="fas fa-clipboard-list me-3"></i>
                                    Solicitudes de Materiales
                                </h1>
                                <p>Gestión de solicitudes de materiales</p>
                            </div>
                        </div>
                        
                        <!-- Filtros -->
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="row align-items-end">
                                    <div class="col-md-4">
                                        <label class="form-label">Estado</label>
                                        <select class="form-control" id="filtroEstado">
                                            <option value="">Todos</option>
                                            ${Object.entries(ESTADOS_SOLICITUD).map(([key, value]) => `
                                                <option value="${value}">${value}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    
                                    <div class="col-md-3">
                                        <label class="form-label">Desde</label>
                                        <input type="date" class="form-control" id="filtroFechaInicio">
                                    </div>
                                    
                                    <div class="col-md-3">
                                        <label class="form-label">Hasta</label>
                                        <input type="date" class="form-control" id="filtroFechaFin">
                                    </div>
                                    
                                    <div class="col-md-2">
                                        <button class="btn btn-secondary w-100" onclick="SolicitudController.limpiarFiltros()">
                                            <i class="fas fa-times me-2"></i>
                                            Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tabla de Solicitudes -->
                        <div id="solicitudesTable"></div>
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
            this.filtros.estado = e.target.value || null;
            this.aplicarFiltros();
        });
        
        document.getElementById('filtroFechaInicio').addEventListener('change', (e) => {
            this.filtros.fechaInicio = e.target.value || null;
            this.aplicarFiltros();
        });
        
        document.getElementById('filtroFechaFin').addEventListener('change', (e) => {
            this.filtros.fechaFin = e.target.value || null;
            this.aplicarFiltros();
        });
    }
    
    /**
     * Carga los datos en la tabla
     */
    static loadData() {
        const solicitudes = this.getSolicitudesFiltradas();
        const currentUser = AuthService.getCurrentUser();
        
        // Configurar acciones según el rol
        const actions = [
            {
                label: 'Nueva Solicitud',
                icon: 'fas fa-plus',
                class: 'btn-primary',
                onclick: 'SolicitudController.nuevaSolicitud()'
            }
        ];
        
        // Configurar DataTable
        this.dataTable = new DataTable({
            containerId: 'solicitudesTable',
            data: solicitudes,
            columns: [
                {
                    header: 'ID',
                    field: 'id',
                    render: (row) => `#${row.id}`
                },
                {
                    header: 'Fecha',
                    field: 'fecha_solicitud',
                    type: 'date'
                },
                {
                    header: 'Solicitante',
                    field: 'usuario_nombre'
                },
                {
                    header: 'Proyecto',
                    field: 'proyecto_nombre',
                    render: (row) => row.proyecto_nombre || '-'
                },
                {
                    header: 'Estado',
                    field: 'estado',
                    render: (row) => {
                        const color = getColorEstadoSolicitud(row.estado);
                        return `<span class="badge badge-${color}">${escaparHTML(row.estado)}</span>`;
                    }
                },
                {
                    header: 'Items',
                    field: 'total_items',
                    render: (row) => `${row.total_items} pieza(s)`
                },
                {
                    header: 'Acciones',
                    field: 'id',
                    render: (row) => this.renderAcciones(row, currentUser)
                }
            ],
            pageSize: 10,
            actions: actions,
            emptyMessage: 'No hay solicitudes registradas'
        });
        
        // Guardar instancia global
        globalThis.dataTableInstances['solicitudesTable'] = this.dataTable;
    }
    
    /**
     * Renderiza las acciones según el rol y estado
     */
    static renderAcciones(solicitud, currentUser) {
        const isBodeguero = currentUser.rol === ROLES.BODEGUERO;
        const isSolicitante = solicitud.usuario_solicitante_id === currentUser.id;
        
        let acciones = `
            <button 
                class="btn btn-sm btn-outline-primary" 
                onclick="SolicitudController.verDetalle(${solicitud.id})"
                title="Ver detalles"
            >
                <i class="fas fa-eye"></i>
            </button>
        `;
        
        // Bodeguero puede cambiar estado
        if (isBodeguero && solicitud.estado === ESTADOS_SOLICITUD.PENDIENTE) {
            acciones += `
                <button 
                    class="btn btn-sm btn-outline-info" 
                    onclick="SolicitudController.cambiarEstado(${solicitud.id}, '${ESTADOS_SOLICITUD.EN_PREPARACION}')"
                    title="Marcar en preparación"
                >
                    <i class="fas fa-tasks"></i>
                </button>
            `;
        }
        
        if (isBodeguero && solicitud.estado === ESTADOS_SOLICITUD.EN_PREPARACION) {
            acciones += `
                <button 
                    class="btn btn-sm btn-outline-success" 
                    onclick="SolicitudController.cambiarEstado(${solicitud.id}, '${ESTADOS_SOLICITUD.LISTA}')"
                    title="Marcar como lista"
                >
                    <i class="fas fa-check"></i>
                </button>
            `;
        }
        
        // Solicitante puede reportar incidencia
        if (isSolicitante && solicitud.estado === ESTADOS_SOLICITUD.LISTA) {
            acciones += `
                <button 
                    class="btn btn-sm btn-outline-warning" 
                    onclick="SolicitudController.reportarIncidencia(${solicitud.id})"
                    title="Reportar incidencia"
                >
                    <i class="fas fa-exclamation-triangle"></i>
                </button>
            `;
        }
        
        return `<div style="display: flex; gap: 0.25rem;">${acciones}</div>`;
    }
    
    /**
     * Obtiene solicitudes filtradas
     */
    static getSolicitudesFiltradas() {
        const currentUser = AuthService.getCurrentUser();
        let solicitudes;
        
        // Si es bodeguero o admin, ve todas. Sino solo las suyas
        if (currentUser.rol === ROLES.BODEGUERO || currentUser.rol === ROLES.ADMIN) {
            solicitudes = SolicitudService.getAll(this.filtros);
        } else {
            solicitudes = SolicitudService.getMisSolicitudes();
        }
        
        // Aplicar filtros de fecha
        if (this.filtros.fechaInicio) {
            const inicio = new Date(this.filtros.fechaInicio);
            solicitudes = solicitudes.filter(s => new Date(s.fecha_solicitud) >= inicio);
        }
        
        if (this.filtros.fechaFin) {
            const fin = new Date(this.filtros.fechaFin);
            fin.setHours(23, 59, 59, 999);
            solicitudes = solicitudes.filter(s => new Date(s.fecha_solicitud) <= fin);
        }
        
        // Enriquecer con datos adicionales
        return solicitudes.map(s => {
            const usuario = UsuarioStorage.findById(s.usuario_solicitante_id);
            const proyecto = s.proyecto_id ? 
                StorageManager.getItem(STORAGE_KEYS.PROYECTOS, []).find(p => p.id === s.proyecto_id) : null;
            
            const detalles = StorageManager.getItem(STORAGE_KEYS.SOLICITUDES_DETALLE, []);
            const items = detalles.filter(d => d.solicitud_id === s.id);
            
            return {
                ...s,
                usuario_nombre: usuario ? usuario.nombre : 'Desconocido',
                proyecto_nombre: proyecto ? proyecto.nombre : null,
                total_items: items.length
            };
        }).sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud));
    }
    
    /**
     * Aplica los filtros y recarga la tabla
     */
    static aplicarFiltros() {
        const solicitudes = this.getSolicitudesFiltradas();
        this.dataTable.updateData(solicitudes);
        Toast.info(`${solicitudes.length} solicitud(es) encontrada(s)`, 2000);
    }
    
    /**
     * Limpia todos los filtros
     */
    static limpiarFiltros() {
        this.filtros = {
            estado: null,
            fechaInicio: null,
            fechaFin: null
        };
        
        document.getElementById('filtroEstado').value = '';
        document.getElementById('filtroFechaInicio').value = '';
        document.getElementById('filtroFechaFin').value = '';
        
        this.aplicarFiltros();
    }
    
    /**
     * Abre el modal para crear una nueva solicitud
     */
    static async nuevaSolicitud() {
        const piezas = PiezaStorage.getAll().filter(p => p.activo);
        const proyectos = StorageManager.getItem(STORAGE_KEYS.PROYECTOS, []);
        
        const body = `
            <form id="formSolicitud">
                <div class="form-group">
                    <label class="form-label" for="proyecto_id">Proyecto (Opcional)</label>
                    <select class="form-control" id="proyecto_id">
                        <option value="">Sin proyecto</option>
                        ${proyectos.map(p => `
                            <option value="${p.id}">${escaparHTML(p.nombre)}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">
                        Materiales a Solicitar <span class="text-danger">*</span>
                    </label>
                    <div id="itemsContainer">
                        <div class="item-row mb-2" data-index="0">
                            <div class="row">
                                <div class="col-md-8">
                                    <select class="form-control pieza-select" required>
                                        <option value="">Seleccione una pieza...</option>
                                        ${piezas.map(p => `
                                            <option value="${p.id}" data-stock="${p.stock_actual}">
                                                ${escaparHTML(p.nombre)} (Stock: ${p.stock_actual})
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <input 
                                        type="number" 
                                        class="form-control cantidad-input" 
                                        placeholder="Cantidad"
                                        min="1"
                                        required
                                    >
                                </div>
                                <div class="col-md-1">
                                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="SolicitudController.eliminarItem(0)">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary mt-2" onclick="SolicitudController.agregarItem()">
                        <i class="fas fa-plus me-1"></i>
                        Agregar Material
                    </button>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="observaciones">Observaciones</label>
                    <textarea 
                        class="form-control" 
                        id="observaciones" 
                        rows="3"
                        placeholder="Información adicional sobre la solicitud..."
                    ></textarea>
                </div>
            </form>
        `;
        
        const footer = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
            </button>
            <button type="button" class="btn btn-primary" id="guardarSolicitudBtn">
                <i class="fas fa-paper-plane me-2"></i>
                Enviar Solicitud
            </button>
        `;
        
        const { id } = Modal.show({
            title: 'Nueva Solicitud de Materiales',
            body,
            footer,
            size: 'lg',
            closeOnBackdrop: false
        });
        
        // Event listener para guardar
        setTimeout(() => {
            document.getElementById('guardarSolicitudBtn').addEventListener('click', async () => {
                const form = document.getElementById('formSolicitud');
                
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
                
                // Recopilar items
                const items = [];
                const itemRows = document.querySelectorAll('.item-row');
                
                for (const row of itemRows) {
                    const piezaSelect = row.querySelector('.pieza-select');
                    const cantidadInput = row.querySelector('.cantidad-input');
                    
                    if (piezaSelect.value && cantidadInput.value) {
                        items.push({
                            pieza_id: Number.parseInt(piezaSelect.value),
                            cantidad: Number.parseInt(cantidadInput.value)
                        });
                    }
                }
                
                if (items.length === 0) {
                    Toast.warning('Debes agregar al menos un material');
                    return;
                }
                
                const datos = {
                    proyecto_id: document.getElementById('proyecto_id').value || null,
                    observaciones: document.getElementById('observaciones').value || null,
                    items: items
                };
                
                const response = SolicitudService.crear(datos);
                
                if (response.success) {
                    Toast.success(response.message);
                    bootstrap.Modal.getInstance(document.getElementById(id)).hide();
                    this.aplicarFiltros();
                    Sidebar.updateBadges();
                } else {
                    Toast.error(response.message);
                }
            });
        }, 100);
    }
    
    /**
     * Agrega un nuevo item al formulario
     */
    static agregarItem() {
        const container = document.getElementById('itemsContainer');
        const index = container.children.length;
        const piezas = PiezaStorage.getAll().filter(p => p.activo);
        
        const newItem = document.createElement('div');
        newItem.className = 'item-row mb-2';
        newItem.dataset.index = index;
        newItem.innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    <select class="form-control pieza-select" required>
                        <option value="">Seleccione una pieza...</option>
                        ${piezas.map(p => `
                            <option value="${p.id}" data-stock="${p.stock_actual}">
                                ${escaparHTML(p.nombre)} (Stock: ${p.stock_actual})
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="col-md-3">
                    <input 
                        type="number" 
                        class="form-control cantidad-input" 
                        placeholder="Cantidad"
                        min="1"
                        required
                    >
                </div>
                <div class="col-md-1">
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="SolicitudController.eliminarItem(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(newItem);
    }
    
    /**
     * Elimina un item del formulario
     */
    static eliminarItem(index) {
        const container = document.getElementById('itemsContainer');
        const items = container.querySelectorAll('.item-row');
        
        if (items.length > 1) {
            items[index].remove();
        } else {
            Toast.warning('Debe haber al menos un material');
        }
    }
    
    /**
     * Ver detalles de una solicitud
     * HU #10 - Consultar estado de solicitud
     */
    static verDetalle(id) {
        const solicitud = SolicitudService.getConDetalles(id);
        if (!solicitud) {
            Toast.error('Solicitud no encontrada');
            return;
        }
        
        const body = `
            <div class="solicitud-detalles">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <strong>Estado:</strong><br>
                        <span class="badge badge-${getColorEstadoSolicitud(solicitud.estado)} fs-6">
                            ${solicitud.estado}
                        </span>
                    </div>
                    <div class="col-md-6">
                        <strong>Fecha de Solicitud:</strong><br>
                        ${formatearFechaHora(solicitud.fecha_solicitud)}
                    </div>
                </div>
                
                <div class="mb-3">
                    <strong>Solicitante:</strong><br>
                    ${solicitud.usuario ? escaparHTML(solicitud.usuario.nombre) : 'Desconocido'}
                </div>
                
                ${solicitud.proyecto ? `
                    <div class="mb-3">
                        <strong>Proyecto:</strong><br>
                        ${escaparHTML(solicitud.proyecto.nombre)} (${solicitud.proyecto.codigo})
                    </div>
                ` : ''}
                
                <hr>
                
                <h6 class="mb-3">
                    <i class="fas fa-boxes me-2"></i>
                    Materiales Solicitados
                </h6>
                
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Pieza</th>
                                <th>Cantidad</th>
                                <th>Stock Disponible</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${solicitud.items.map(item => `
                                <tr>
                                    <td>${item.pieza ? escaparHTML(item.pieza.nombre) : 'Desconocida'}</td>
                                    <td>${item.cantidad_solicitada}</td>
                                    <td>${item.pieza ? item.pieza.stock_actual : '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                ${solicitud.observaciones ? `
                    <div class="mt-3">
                        <strong>Observaciones:</strong><br>
                        ${escaparHTML(solicitud.observaciones)}
                    </div>
                ` : ''}
            </div>
        `;
        
        Modal.show({
            title: `Solicitud #${solicitud.id}`,
            body,
            footer: `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    Cerrar
                </button>
            `,
            size: 'lg'
        });
    }
    
    /**
     * Cambia el estado de una solicitud
     */
    static async cambiarEstado(id, nuevoEstado) {
        const confirmed = await Modal.confirm({
            title: 'Cambiar Estado',
            message: `¿Cambiar estado a "${nuevoEstado}"?`,
            confirmText: 'Sí, cambiar',
            type: 'info'
        });
        
        if (confirmed) {
            const response = SolicitudService.actualizarEstado(id, nuevoEstado);
            
            if (response.success) {
                Toast.success(response.message);
                this.aplicarFiltros();
                Navbar.updateNotificationBadge();
            } else {
                Toast.error(response.message);
            }
        }
    }
    
    /**
     * Reportar incidencia en una solicitud
     * HU #15 - Reportar incidencia
     */
    static async reportarIncidencia(solicitudId) {
        const solicitud = SolicitudService.getConDetalles(solicitudId);
        if (!solicitud) {
            Toast.error('Solicitud no encontrada');
            return;
        }
        
        const body = `
            <form id="formIncidencia">
                <div class="form-group">
                    <label class="form-label" for="tipo_incidencia">
                        Tipo de Incidencia <span class="text-danger">*</span>
                    </label>
                    <select class="form-control" id="tipo_incidencia" required>
                        ${Object.entries(TIPOS_INCIDENCIA).map(([key, value]) => `
                            <option value="${value}">${value}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="pieza_incidencia">Pieza Afectada</label>
                    <select class="form-control" id="pieza_incidencia">
                        <option value="">Ninguna en específico</option>
                        ${solicitud.items.map(item => `
                            <option value="${item.pieza_id}">
                                ${item.pieza ? escaparHTML(item.pieza.nombre) : 'Desconocida'}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="descripcion_incidencia">
                        Descripción <span class="text-danger">*</span>
                    </label>
                    <textarea 
                        class="form-control" 
                        id="descripcion_incidencia" 
                        rows="4"
                        placeholder="Describe detalladamente la incidencia..."
                        required
                    ></textarea>
                </div>
            </form>
        `;
        
        const footer = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
            </button>
            <button type="button" class="btn btn-warning" id="reportarIncidenciaBtn">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Reportar Incidencia
            </button>
        `;
        
        const { id } = Modal.show({
            title: 'Reportar Incidencia',
            body,
            footer,
            size: 'md',
            closeOnBackdrop: false
        });
        
        setTimeout(() => {
            document.getElementById('reportarIncidenciaBtn').addEventListener('click', () => {
                const form = document.getElementById('formIncidencia');
                
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
                
                const datos = {
                    tipo: document.getElementById('tipo_incidencia').value,
                    pieza_id: document.getElementById('pieza_incidencia').value || null,
                    descripcion: document.getElementById('descripcion_incidencia').value
                };
                
                const response = SolicitudService.reportarIncidencia(solicitudId, datos);
                
                if (response.success) {
                    Toast.success(response.message);
                    bootstrap.Modal.getInstance(document.getElementById(id)).hide();
                    this.aplicarFiltros();
                } else {
                    Toast.error(response.message);
                }
            });
        }, 100);
    }
    
    /**
     * Actualiza la vista
     */
    static refresh() {
        console.log('🔄 Actualizando solicitudes...');
        this.aplicarFiltros();
        Sidebar.updateBadges();
        Navbar.updateNotificationBadge();
    }
}

// Hacer disponible globalmente
globalThis.SolicitudController = SolicitudController;

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolicitudController;
}