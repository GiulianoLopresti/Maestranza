// ============================================
// CONTROLADOR DE ÓRDENES DE COMPRA
// UI para HU #7
// ============================================

class OrdenesController {
    
    static dataTable = null;
    
    static init() {
        console.log('🛒 Inicializando módulo de órdenes de compra...');
        this.render();
        this.setupEventListeners();
        this.loadData();
    }
    
    static render() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="dashboard-layout">
                ${Sidebar.render('/ordenes')}
                
                <div class="dashboard-main">
                    ${Navbar.render('Órdenes de Compra')}
                    
                    <div class="dashboard-content">
                        <div class="dashboard-header">
                            <div>
                                <h1>
                                    <i class="fas fa-shopping-cart me-3"></i>
                                    Órdenes de Compra
                                </h1>
                                <p>Gestión de órdenes automáticas y manuales</p>
                            </div>
                        </div>
                        
                        <!-- KPIs -->
                        <div class="kpi-grid mb-4">
                            <div class="kpi-card info" id="kpiTotal"></div>
                            <div class="kpi-card warning" id="kpiBorradores"></div>
                            <div class="kpi-card success" id="kpiRecibidas"></div>
                            <div class="kpi-card" id="kpiValor"></div>
                        </div>
                        
                        <!-- Tabla -->
                        <div id="ordenesTable"></div>
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
        this.loadKPIs();
        
        const ordenes = OrdenCompraService.getAll().map(orden => {
            const pieza = PiezaStorage.findById(orden.pieza_id);
            const proveedor = orden.proveedor_id ? 
                StorageManager.getItem(STORAGE_KEYS.PROVEEDORES, []).find(p => p.id === orden.proveedor_id) : null;
            
            return {
                ...orden,
                pieza_nombre: pieza ? pieza.nombre : 'Desconocida',
                proveedor_nombre: proveedor ? proveedor.nombre : 'Sin proveedor'
            };
        });
        
        this.dataTable = new DataTable({
            containerId: 'ordenesTable',
            data: ordenes,
            columns: [
                { header: 'ID', field: 'id' },
                { header: 'Pieza', field: 'pieza_nombre' },
                { header: 'Proveedor', field: 'proveedor_nombre' },
                { header: 'Cantidad', field: 'cantidad', type: 'number' },
                { header: 'Precio Unit.', field: 'precio_unitario', type: 'currency' },
                { header: 'Total', field: 'precio_total', type: 'currency' },
                {
                    header: 'Tipo',
                    field: 'tipo',
                    render: (row) => `
                        <span class="badge ${row.tipo === 'Automática' ? 'badge-success' : 'badge-info'}">
                            ${row.tipo}
                        </span>
                    `
                },
                {
                    header: 'Estado',
                    field: 'estado',
                    render: (row) => {
                        const colors = {
                            'Borrador': 'warning',
                            'Enviada': 'info',
                            'Recibida': 'success',
                            'Cancelada': 'danger'
                        };
                        return `<span class="badge badge-${colors[row.estado]}">${row.estado}</span>`;
                    }
                },
                { header: 'Fecha', field: 'fecha_creacion', type: 'datetime' },
                {
                    header: 'Acciones',
                    field: 'id',
                    render: (row) => `
                        <div style="display: flex; gap: 0.25rem;">
                            ${row.estado === 'Borrador' ? `
                                <button class="btn btn-sm btn-outline-primary" 
                                    onclick="OrdenesController.enviarOrden(${row.id})" 
                                    title="Enviar">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" 
                                    onclick="OrdenesController.cancelarOrden(${row.id})" 
                                    title="Cancelar">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                            ${row.estado === 'Enviada' ? `
                                <button class="btn btn-sm btn-outline-success" 
                                    onclick="OrdenesController.recibirOrden(${row.id})" 
                                    title="Marcar como Recibida">
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                        </div>
                    `
                }
            ],
            actions: [
                {
                    label: 'Generar Órdenes',
                    icon: 'fas fa-magic',
                    class: 'btn-primary',
                    onclick: 'OrdenesController.generarAutomaticas()'
                },
                {
                    label: 'Nueva Orden',
                    icon: 'fas fa-plus',
                    class: 'btn-success',
                    onclick: 'OrdenesController.nuevaOrden()'
                }
            ]
        });
        
        globalThis.dataTableInstances['ordenesTable'] = this.dataTable;
    }
    
    static loadKPIs() {
        const ordenes = OrdenCompraService.getAll();
        const borradores = ordenes.filter(o => o.estado === 'Borrador');
        const recibidas = ordenes.filter(o => o.estado === 'Recibida');
        const valorTotal = ordenes.reduce((sum, o) => sum + o.precio_total, 0);
        
        document.getElementById('kpiTotal').innerHTML = `
            <div class="kpi-header">
                <span class="kpi-title">Total Órdenes</span>
                <div class="kpi-icon"><i class="fas fa-shopping-cart"></i></div>
            </div>
            <div class="kpi-value">${ordenes.length}</div>
            <div class="kpi-footer">Todas las órdenes</div>
        `;
        
        document.getElementById('kpiBorradores').innerHTML = `
            <div class="kpi-header">
                <span class="kpi-title">Borradores</span>
                <div class="kpi-icon"><i class="fas fa-edit"></i></div>
            </div>
            <div class="kpi-value">${borradores.length}</div>
            <div class="kpi-footer">Pendientes de envío</div>
        `;
        
        document.getElementById('kpiRecibidas').innerHTML = `
            <div class="kpi-header">
                <span class="kpi-title">Recibidas</span>
                <div class="kpi-icon"><i class="fas fa-check-circle"></i></div>
            </div>
            <div class="kpi-value">${recibidas.length}</div>
            <div class="kpi-footer">Completadas</div>
        `;
        
        document.getElementById('kpiValor').innerHTML = `
            <div class="kpi-header">
                <span class="kpi-title">Valor Total</span>
                <div class="kpi-icon"><i class="fas fa-dollar-sign"></i></div>
            </div>
            <div class="kpi-value" style="font-size: 1.75rem;">${formatearPrecio(valorTotal)}</div>
            <div class="kpi-footer">En órdenes</div>
        `;
    }
    
    static generarAutomaticas() {
        const ordenes = OrdenCompraService.verificarYGenerarOrdenes();
        
        if (ordenes.length > 0) {
            Toast.success(`${ordenes.length} orden(es) generada(s) automáticamente`);
            this.loadKPIs();
            this.dataTable.refresh();
        } else {
            Toast.info('No hay piezas que requieran órdenes automáticas');
        }
    }
    
    static async nuevaOrden() {
        Toast.info('Formulario de orden manual - Próximamente');
    }
    
    static async enviarOrden(id) {
        const confirmed = await Modal.confirm({
            title: 'Enviar Orden',
            message: '¿Confirmar el envío de esta orden al proveedor?',
            confirmText: 'Enviar',
            type: 'info'
        });
        
        if (confirmed) {
            OrdenCompraService.enviarOrden(id);
            Toast.success('Orden enviada al proveedor');
            this.loadKPIs();
            this.dataTable.refresh();
        }
    }
    
    static async recibirOrden(id) {
        const confirmed = await Modal.confirm({
            title: 'Recibir Orden',
            message: '¿Confirmar la recepción de esta orden? El stock se actualizará automáticamente.',
            confirmText: 'Recibir',
            type: 'success'
        });
        
        if (confirmed) {
            OrdenCompraService.actualizarEstado(id, 'Recibida');
            Toast.success('Orden recibida - Stock actualizado');
            this.loadKPIs();
            this.dataTable.refresh();
            Sidebar.updateBadges();
        }
    }
    
    static async cancelarOrden(id) {
        const confirmed = await Modal.confirm({
            title: 'Cancelar Orden',
            message: '¿Estás seguro de cancelar esta orden?',
            confirmText: 'Cancelar Orden',
            type: 'danger'
        });
        
        if (confirmed) {
            OrdenCompraService.cancelarOrden(id);
            Toast.success('Orden cancelada');
            this.loadKPIs();
            this.dataTable.refresh();
        }
    }
}

globalThis.OrdenesController = OrdenesController;