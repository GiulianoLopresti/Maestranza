// ============================================
// CONTROLADOR DE MOVIMIENTOS
// Maestranza Unidos S.A.
// ============================================

/**
 * Controlador para el módulo de movimientos de inventario
 * Cubre HU #4 - Registrar entradas y salidas
 */
class MovimientoController {
    
    static dataTable = null;
    static filtros = {
        tipo: null,
        fechaInicio: null,
        fechaFin: null,
        piezaId: null,
        usuarioId: null
    };
    
    /**
     * Inicializa el módulo de movimientos
     */
    static init() {
        console.log('🔄 Inicializando Módulo de Movimientos...');
        this.render();
        this.setupEventListeners();
        this.loadData();
    }
    
    /**
     * Renderiza la vista de movimientos
     */
    static render() {
        const app = document.getElementById('app');
        const piezas = PiezaStorage.getAll().filter(p => p.activo);
        
        app.innerHTML = `
            <div class="dashboard-layout">
                <!-- Sidebar -->
                ${Sidebar.render('/movimientos')}
                
                <!-- Main Content -->
                <div class="dashboard-main" id="dashboardMain">
                    <!-- Navbar -->
                    ${Navbar.render('Movimientos de Inventario')}
                    
                    <!-- Content -->
                    <div class="dashboard-content">
                        <!-- Header -->
                        <div class="dashboard-header">
                            <div>
                                <h1>
                                    <i class="fas fa-exchange-alt me-3"></i>
                                    Movimientos de Inventario
                                </h1>
                                <p>Registro de entradas y salidas de inventario</p>
                            </div>
                        </div>
                        
                        <!-- Filtros -->
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="row align-items-end">
                                    <div class="col-md-3">
                                        <label class="form-label">Tipo de Movimiento</label>
                                        <select class="form-control" id="filtroTipo">
                                            <option value="">Todos</option>
                                            ${Object.entries(TIPOS_MOVIMIENTO).map(([key, value]) => `
                                                <option value="${value}">${value}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    
                                    <div class="col-md-3">
                                        <label class="form-label">Pieza</label>
                                        <select class="form-control" id="filtroPieza">
                                            <option value="">Todas</option>
                                            ${piezas.map(p => `
                                                <option value="${p.id}">${escaparHTML(p.nombre)}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    
                                    <div class="col-md-2">
                                        <label class="form-label">Desde</label>
                                        <input type="date" class="form-control" id="filtroFechaInicio">
                                    </div>
                                    
                                    <div class="col-md-2">
                                        <label class="form-label">Hasta</label>
                                        <input type="date" class="form-control" id="filtroFechaFin">
                                    </div>
                                    
                                    <div class="col-md-2">
                                        <button class="btn btn-secondary w-100" onclick="MovimientoController.limpiarFiltros()">
                                            <i class="fas fa-times me-2"></i>
                                            Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Tabla de Movimientos -->
                        <div id="movimientosTable"></div>
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
        
        document.getElementById('filtroPieza').addEventListener('change', (e) => {
            this.filtros.piezaId = e.target.value ? parseInt(e.target.value) : null;
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
        const movimientos = this.getMovimientosFiltrados();
        
        // Configurar DataTable
        this.dataTable = new DataTable({
            containerId: 'movimientosTable',
            data: movimientos,
            columns: [
                {
                    header: 'Fecha',
                    field: 'fecha_movimiento',
                    type: 'datetime'
                },
                {
                    header: 'Tipo',
                    field: 'tipo_movimiento',
                    render: (row) => {
                        const color = this.getColorTipo(row.tipo_movimiento);
                        return `<span class="badge badge-${color}">${escaparHTML(row.tipo_movimiento)}</span>`;
                    }
                },
                {
                    header: 'Pieza',
                    field: 'pieza_nombre'
                },
                {
                    header: 'Cantidad',
                    field: 'cantidad',
                    render: (row) => {
                        const signo = row.tipo_movimiento === TIPOS_MOVIMIENTO.ENTRADA ? '+' : '-';
                        const color = row.tipo_movimiento === TIPOS_MOVIMIENTO.ENTRADA ? 'success' : 'danger';
                        return `<span class="text-${color} fw-semibold">${signo}${row.cantidad}</span>`;
                    }
                },
                {
                    header: 'Usuario',
                    field: 'usuario_nombre'
                },
                {
                    header: 'Observaciones',
                    field: 'observaciones',
                    render: (row) => truncarTexto(row.observaciones || '-', 50)
                },
                {
                    header: 'Acciones',
                    field: 'id',
                    render: (row) => `
                        <button 
                            class="btn btn-sm btn-outline-primary" 
                            onclick="MovimientoController.verDetalle(${row.id})"
                            title="Ver detalles"
                        >
                            <i class="fas fa-eye"></i>
                        </button>
                    `
                }
            ],
            pageSize: 15,
            actions: [
                {
                    label: 'Registrar Movimiento',
                    icon: 'fas fa-plus',
                    class: 'btn-primary',
                    onclick: 'MovimientoController.nuevoMovimiento()'
                },
                {
                    label: 'Exportar',
                    icon: 'fas fa-download',
                    class: 'btn-outline-secondary',
                    onclick: 'MovimientoController.exportar()'
                }
            ],
            emptyMessage: 'No hay movimientos registrados'
        });
        
        // Guardar instancia global
        window.dataTableInstances['movimientosTable'] = this.dataTable;
    }
    
    /**
     * Obtiene movimientos filtrados
     * @returns {Array}
     */
    static getMovimientosFiltrados() {
        let movimientos = MovimientoStorage.getAll();
        
        // Aplicar filtros
        if (this.filtros.tipo) {
            movimientos = movimientos.filter(m => m.tipo_movimiento === this.filtros.tipo);
        }
        
        if (this.filtros.piezaId) {
            movimientos = movimientos.filter(m => m.pieza_id === this.filtros.piezaId);
        }
        
        if (this.filtros.fechaInicio) {
            const inicio = new Date(this.filtros.fechaInicio);
            movimientos = movimientos.filter(m => new Date(m.fecha_movimiento) >= inicio);
        }
        
        if (this.filtros.fechaFin) {
            const fin = new Date(this.filtros.fechaFin);
            fin.setHours(23, 59, 59, 999);
            movimientos = movimientos.filter(m => new Date(m.fecha_movimiento) <= fin);
        }
        
        if (this.filtros.usuarioId) {
            movimientos = movimientos.filter(m => m.usuario_id === this.filtros.usuarioId);
        }
        
        // Enriquecer con datos adicionales
        return movimientos.map(m => {
            const pieza = PiezaStorage.findById(m.pieza_id);
            const usuario = UsuarioStorage.findById(m.usuario_id);
            
            return {
                ...m,
                pieza_nombre: pieza ? pieza.nombre : 'Desconocida',
                usuario_nombre: usuario ? usuario.nombre : 'Desconocido'
            };
        }).sort((a, b) => new Date(b.fecha_movimiento) - new Date(a.fecha_movimiento));
    }
    
    /**
     * Aplica los filtros y recarga la tabla
     */
    static aplicarFiltros() {
        const movimientos = this.getMovimientosFiltrados();
        this.dataTable.updateData(movimientos);
        Toast.info(`${movimientos.length} movimiento(s) encontrado(s)`, 2000);
    }
    
    /**
     * Limpia todos los filtros
     */
    static limpiarFiltros() {
        this.filtros = {
            tipo: null,
            fechaInicio: null,
            fechaFin: null,
            piezaId: null,
            usuarioId: null
        };
        
        document.getElementById('filtroTipo').value = '';
        document.getElementById('filtroPieza').value = '';
        document.getElementById('filtroFechaInicio').value = '';
        document.getElementById('filtroFechaFin').value = '';
        
        this.aplicarFiltros();
    }
    
    /**
     * Abre el modal para registrar un nuevo movimiento
     * HU #4 - Registrar entrada de stock
     */
    static async nuevoMovimiento() {
        const piezas = PiezaStorage.getAll().filter(p => p.activo);
        const proyectos = StorageManager.getItem(STORAGE_KEYS.PROYECTOS, []);
        const currentUser = AuthService.getCurrentUser();
        
        const body = `
            <form id="formMovimiento">
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label" for="tipo_movimiento">
                                Tipo de Movimiento <span class="text-danger">*</span>
                            </label>
                            <select class="form-control" id="tipo_movimiento" required>
                                <option value="">Seleccione...</option>
                                ${Object.entries(TIPOS_MOVIMIENTO).map(([key, value]) => `
                                    <option value="${value}">${value}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label" for="pieza_id">
                                Pieza <span class="text-danger">*</span>
                            </label>
                            <select class="form-control" id="pieza_id" required>
                                <option value="">Seleccione...</option>
                                ${piezas.map(p => `
                                    <option value="${p.id}" data-stock="${p.stock_actual}">
                                        ${escaparHTML(p.nombre)} (Stock: ${p.stock_actual})
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label" for="cantidad">
                                Cantidad <span class="text-danger">*</span>
                            </label>
                            <input 
                                type="number" 
                                class="form-control" 
                                id="cantidad" 
                                min="1"
                                required
                            >
                            <small id="stockWarning" class="text-danger d-none">
                                <i class="fas fa-exclamation-triangle"></i>
                                Stock insuficiente
                            </small>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label" for="fecha_movimiento">
                                Fecha y Hora <span class="text-danger">*</span>
                            </label>
                            <input 
                                type="datetime-local" 
                                class="form-control" 
                                id="fecha_movimiento" 
                                value="${new Date().toISOString().slice(0, 16)}"
                                required
                            >
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label" for="ubicacion_origen">
                                Ubicación Origen
                            </label>
                            <input 
                                type="text" 
                                class="form-control" 
                                id="ubicacion_origen" 
                                placeholder="Ej: Bodega A"
                            >
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label" for="ubicacion_destino">
                                Ubicación Destino
                            </label>
                            <input 
                                type="text" 
                                class="form-control" 
                                id="ubicacion_destino" 
                                placeholder="Ej: Bodega B"
                            >
                        </div>
                    </div>
                </div>
                
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
                    <label class="form-label" for="observaciones">Observaciones</label>
                    <textarea 
                        class="form-control" 
                        id="observaciones" 
                        rows="3"
                        placeholder="Detalles adicionales del movimiento..."
                    ></textarea>
                </div>
            </form>
        `;
        
        const footer = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
            </button>
            <button type="button" class="btn btn-primary" id="guardarMovimientoBtn">
                <i class="fas fa-save me-2"></i>
                Registrar Movimiento
            </button>
        `;
        
        const { id } = Modal.show({
            title: 'Registrar Movimiento',
            body,
            footer,
            size: 'lg',
            closeOnBackdrop: false
        });
        
        // Event listeners dentro del modal
        setTimeout(() => {
            this.setupModalListeners(id);
        }, 100);
    }
    
    /**
     * Configura los listeners del modal de movimiento
     */
    static setupModalListeners(modalId) {
        const piezaSelect = document.getElementById('pieza_id');
        const cantidadInput = document.getElementById('cantidad');
        const tipoSelect = document.getElementById('tipo_movimiento');
        const stockWarning = document.getElementById('stockWarning');
        
        // Validar stock al cambiar cantidad o pieza
        const validateStock = () => {
            if (tipoSelect.value !== TIPOS_MOVIMIENTO.SALIDA) {
                stockWarning.classList.add('d-none');
                return true;
            }
            
            const selectedOption = piezaSelect.options[piezaSelect.selectedIndex];
            const stockActual = parseInt(selectedOption.dataset.stock || 0);
            const cantidad = parseInt(cantidadInput.value || 0);
            
            if (cantidad > stockActual) {
                stockWarning.classList.remove('d-none');
                return false;
            } else {
                stockWarning.classList.add('d-none');
                return true;
            }
        };
        
        piezaSelect.addEventListener('change', validateStock);
        cantidadInput.addEventListener('input', validateStock);
        tipoSelect.addEventListener('change', validateStock);
        
        // Guardar movimiento
        document.getElementById('guardarMovimientoBtn').addEventListener('click', async () => {
            const form = document.getElementById('formMovimiento');
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            if (!validateStock()) {
                Toast.error('Stock insuficiente para realizar la salida');
                return;
            }
            
            const datos = {
                tipo_movimiento: document.getElementById('tipo_movimiento').value,
                pieza_id: parseInt(document.getElementById('pieza_id').value),
                cantidad: parseInt(document.getElementById('cantidad').value),
                fecha_movimiento: document.getElementById('fecha_movimiento').value,
                ubicacion_origen: document.getElementById('ubicacion_origen').value || null,
                ubicacion_destino: document.getElementById('ubicacion_destino').value || null,
                proyecto_id: document.getElementById('proyecto_id').value ? parseInt(document.getElementById('proyecto_id').value) : null,
                observaciones: document.getElementById('observaciones').value || null
            };
            
            const response = await MovimientoService.registrar(datos);
            
            if (response.success) {
                Toast.success(response.message);
                bootstrap.Modal.getInstance(document.getElementById(modalId)).hide();
                this.aplicarFiltros();
                Sidebar.updateBadges();
            } else {
                Toast.error(response.message);
            }
        });
    }
    
    /**
     * Muestra los detalles de un movimiento
     * @param {number} id - ID del movimiento
     */
    static verDetalle(id) {
        const movimiento = MovimientoStorage.findById(id);
        if (!movimiento) {
            Toast.error('Movimiento no encontrado');
            return;
        }
        
        const pieza = PiezaStorage.findById(movimiento.pieza_id);
        const usuario = UsuarioStorage.findById(movimiento.usuario_id);
        const proyecto = movimiento.proyecto_id ? StorageManager.getItem(STORAGE_KEYS.PROYECTOS, []).find(p => p.id === movimiento.proyecto_id) : null;
        
        const body = `
            <div class="movimiento-detalles">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <strong>Tipo de Movimiento:</strong><br>
                        <span class="badge badge-${this.getColorTipo(movimiento.tipo_movimiento)} fs-6">
                            ${movimiento.tipo_movimiento}
                        </span>
                    </div>
                    <div class="col-md-6">
                        <strong>Fecha y Hora:</strong><br>
                        ${formatearFechaHora(movimiento.fecha_movimiento)}
                    </div>
                </div>
                
                <div class="mb-3">
                    <strong>Pieza:</strong><br>
                    ${pieza ? escaparHTML(pieza.nombre) + ` (${pieza.numero_serie})` : 'Desconocida'}
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <strong>Cantidad:</strong><br>
                        <span class="fs-4 fw-bold ${movimiento.tipo_movimiento === TIPOS_MOVIMIENTO.ENTRADA ? 'text-success' : 'text-danger'}">
                            ${movimiento.tipo_movimiento === TIPOS_MOVIMIENTO.ENTRADA ? '+' : '-'}${movimiento.cantidad}
                        </span>
                    </div>
                    <div class="col-md-6">
                        <strong>Registrado por:</strong><br>
                        ${usuario ? escaparHTML(usuario.nombre) : 'Desconocido'}
                    </div>
                </div>
                
                ${movimiento.ubicacion_origen || movimiento.ubicacion_destino ? `
                    <div class="row mb-3">
                        ${movimiento.ubicacion_origen ? `
                            <div class="col-md-6">
                                <strong>Origen:</strong><br>
                                ${escaparHTML(movimiento.ubicacion_origen)}
                            </div>
                        ` : ''}
                        ${movimiento.ubicacion_destino ? `
                            <div class="col-md-6">
                                <strong>Destino:</strong><br>
                                ${escaparHTML(movimiento.ubicacion_destino)}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                
                ${proyecto ? `
                    <div class="mb-3">
                        <strong>Proyecto:</strong><br>
                        ${escaparHTML(proyecto.nombre)} (${proyecto.codigo})
                    </div>
                ` : ''}
                
                ${movimiento.observaciones ? `
                    <div class="mb-3">
                        <strong>Observaciones:</strong><br>
                        ${escaparHTML(movimiento.observaciones)}
                    </div>
                ` : ''}
            </div>
        `;
        
        Modal.show({
            title: `Detalles del Movimiento #${id}`,
            body,
            footer: `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    Cerrar
                </button>
            `,
            size: 'md'
        });
    }
    
    /**
     * Obtiene el color del badge según el tipo de movimiento
     * @param {string} tipo - Tipo de movimiento
     * @returns {string}
     */
    static getColorTipo(tipo) {
        switch (tipo) {
            case TIPOS_MOVIMIENTO.ENTRADA: return 'success';
            case TIPOS_MOVIMIENTO.SALIDA: return 'danger';
            case TIPOS_MOVIMIENTO.TRANSFERENCIA: return 'info';
            case TIPOS_MOVIMIENTO.AJUSTE: return 'warning';
            case TIPOS_MOVIMIENTO.DEVOLUCION: return 'secondary';
            default: return 'secondary';
        }
    }
    
    /**
     * Exporta los movimientos a CSV
     */
    static exportar() {
        const movimientos = this.getMovimientosFiltrados();
        
        if (movimientos.length === 0) {
            Toast.warning('No hay datos para exportar');
            return;
        }
        
        const headers = ['Fecha', 'Tipo', 'Pieza', 'Cantidad', 'Usuario', 'Origen', 'Destino', 'Observaciones'];
        const rows = movimientos.map(m => [
            formatearFechaHora(m.fecha_movimiento),
            m.tipo_movimiento,
            m.pieza_nombre,
            m.cantidad,
            m.usuario_nombre,
            m.ubicacion_origen || '',
            m.ubicacion_destino || '',
            m.observaciones || ''
        ]);
        
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `movimientos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Toast.success('Movimientos exportados exitosamente');
    }
    
    /**
     * Actualiza la vista
     */
    static refresh() {
        console.log('🔄 Actualizando movimientos...');
        this.aplicarFiltros();
        Sidebar.updateBadges();
        Navbar.updateNotificationBadge();
    }
}

// Hacer disponible globalmente
window.MovimientoController = MovimientoController;

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MovimientoController;
}