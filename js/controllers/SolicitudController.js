// ============================================
// CONTROLADOR DE SOLICITUDES
// Maestranza Unidos S.A.
// ============================================

class SolicitudController {
    
    static init() {
        console.log('📋 Inicializando SolicitudController...');
        this.render();
    }

    static render() {
        const app = document.getElementById('app');
        const currentUser = AuthService.getCurrentUser();
        const esBodeguero = currentUser.rol === ROLES.BODEGUERO || currentUser.rol === ROLES.ADMIN;

        app.innerHTML = `
            <div class="dashboard-layout">
                ${Sidebar.render('/solicitudes')}
                <div class="dashboard-main" id="dashboardMain">
                    ${Navbar.render('Solicitudes de Materiales')}
                    
                    <div class="dashboard-content">
                        <div class="dashboard-header d-flex justify-content-between align-items-center">
                            <div>
                                <h1><i class="fas fa-clipboard-list me-3"></i>Solicitudes</h1>
                                <p>Gestiona y consulta el estado de tus pedidos de materiales</p>
                            </div>
                            <button class="btn btn-primary" onclick="SolicitudController.nuevaSolicitud()">
                                <i class="fas fa-plus me-2"></i>Nueva Solicitud
                            </button>
                        </div>

                        <ul class="nav nav-tabs mb-4">
                            <li class="nav-item">
                                <a class="nav-link active" href="#" onclick="SolicitudController.cargarTabla('mis', event)">Mis Solicitudes</a>
                            </li>
                            ${esBodeguero ? `
                            <li class="nav-item">
                                <a class="nav-link" href="#" onclick="SolicitudController.cargarTabla('todas', event)">Gestionar (Bodega)</a>
                            </li>` : ''}
                        </ul>

                        <div id="solicitudesTableContainer"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Cargar vista por defecto
        this.cargarTabla('mis');
        Sidebar.init();
        Navbar.init();
    }

    static cargarTabla(vista, event) {
        const currentUser = AuthService.getCurrentUser();
        const filtros = vista === 'mis' ? { usuario_id: currentUser.id } : {}; // 'todas' no lleva filtro de usuario
        
        const solicitudes = SolicitudService.getAll(filtros);

        // Actualizar UI de tabs
        for (const l of document.querySelectorAll('.nav-link')) {
            l.classList.remove('active');
        }
        if (event) event.target.classList.add('active');

        const container = document.getElementById('solicitudesTableContainer');
        
        if (solicitudes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox empty-state-icon"></i>
                    <h3>No tienes solicitudes</h3>
                    <p>Crea una nueva solicitud para comenzar.</p>
                </div>`;
            return;
        }

        // Renderizar tabla manual (o usar DataTable si prefieres)
        container.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            ${vista === 'todas' ? '<th>Solicitante</th>' : ''}
                            <th>Proyecto</th>
                            <th>Items</th>
                            <th>Prioridad</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${solicitudes.map(s => `
                            <tr>
                                <td>#${s.id}</td>
                                <td>${formatearFecha(s.fecha_solicitud)}</td>
                                ${vista === 'todas' ? `<td>${escaparHTML(s.nombre_solicitante)}</td>` : ''}
                                <td>${escaparHTML(s.nombre_proyecto)}</td>
                                <td>${s.items.length} items</td>
                                <td><span class="badge ${s.prioridad === 'Alta' ? 'badge-danger' : 'badge-info'}">${s.prioridad}</span></td>
                                <td><span class="badge badge-${getColorEstadoSolicitud(s.estado)}">${s.estado}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" onclick="SolicitudController.verDetalle(${s.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static async nuevaSolicitud() {
        // Implementación básica del modal de creación (Simplificado)
        const piezas = PiezaStorage.getAll().filter(p => p.stock_actual > 0);
        const proyectos = StorageManager.getItem(STORAGE_KEYS.PROYECTOS);
        
        const body = `
            <form id="formSolicitud">
                <div class="form-group">
                    <label class="form-label">Proyecto Asociado</label>
                    <select class="form-control" id="solicitudProyecto">
                        <option value="">-- Seleccionar --</option>
                        ${proyectos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Pieza a solicitar</label>
                    <select class="form-control" id="solicitudPieza">
                        ${piezas.map(p => `<option value="${p.id}">${p.nombre} (Stock: ${p.stock_actual})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Cantidad</label>
                    <input type="number" class="form-control" id="solicitudCantidad" min="1" value="1">
                </div>
                <div class="form-group">
                    <label class="form-label">Prioridad</label>
                    <select class="form-control" id="solicitudPrioridad">
                        <option value="Baja">Baja</option>
                        <option value="Media" selected>Media</option>
                        <option value="Alta">Alta</option>
                    </select>
                </div>
            </form>
        `;

        const { id } = Modal.show({
            title: 'Nueva Solicitud',
            body: body,
            footer: `<button class="btn btn-primary" id="btnCrearSol">Crear Solicitud</button>`
        });

        // Event listener simple para el botón
        setTimeout(() => {
            document.getElementById('btnCrearSol').addEventListener('click', () => {
                const datos = {
                    proyecto_id: document.getElementById('solicitudProyecto').value,
                    prioridad: document.getElementById('solicitudPrioridad').value,
                    items: [{
                        pieza_id: Number.parseInt(document.getElementById('solicitudPieza').value),
                        cantidad: Number.parseInt(document.getElementById('solicitudCantidad').value)
                    }]
                };

                const res = SolicitudService.crear(datos);
                if (res.success) {
                    Toast.success(res.message);
                    bootstrap.Modal.getInstance(document.getElementById(id)).hide();
                    SolicitudController.cargarTabla('mis');
                } else {
                    Toast.error(res.message);
                }
            });
        }, 100);
    }

    static verDetalle(id) {
        const solicitud = SolicitudStorage.findById(id); // Obtener raw para simplificar, idealmente usar Service
        const sEnriquecida = SolicitudService._enriquecerSolicitud(solicitud);
        const currentUser = AuthService.getCurrentUser();
        const esBodeguero = currentUser.rol === ROLES.BODEGUERO || currentUser.rol === ROLES.ADMIN;

        let accionesHtml = '';
        if (esBodeguero && solicitud.estado === ESTADOS_SOLICITUD.PENDIENTE) {
            accionesHtml = `
                <button class="btn btn-info w-100 mb-2" onclick="SolicitudController.cambiarEstado(${id}, '${ESTADOS_SOLICITUD.EN_PREPARACION}')">
                    <i class="fas fa-box-open me-2"></i>Comenzar Preparación
                </button>`;
        } else if (esBodeguero && solicitud.estado === ESTADOS_SOLICITUD.EN_PREPARACION) {
            accionesHtml = `
                <button class="btn btn-success w-100 mb-2" onclick="SolicitudController.cambiarEstado(${id}, '${ESTADOS_SOLICITUD.LISTA}')">
                    <i class="fas fa-check me-2"></i>Marcar como Lista
                </button>`;
        } else if (esBodeguero && solicitud.estado === ESTADOS_SOLICITUD.LISTA) {
            accionesHtml = `
                <button class="btn btn-secondary w-100 mb-2" onclick="SolicitudController.cambiarEstado(${id}, '${ESTADOS_SOLICITUD.ENTREGADA}')">
                    <i class="fas fa-handshake me-2"></i>Entregar al Usuario
                </button>`;
        }

        const body = `
            <div class="solicitud-detalle">
                <div class="alert alert-${getColorEstadoSolicitud(sEnriquecida.estado)} mb-3">
                    <strong>Estado:</strong> ${sEnriquecida.estado}
                </div>
                <h6>Items Solicitados:</h6>
                <ul class="list-group mb-3">
                    ${sEnriquecida.items_detalle.map(i => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${i.nombre_pieza} (${i.numero_serie})
                            <span class="badge bg-primary rounded-pill">${i.cantidad}</span>
                        </li>
                    `).join('')}
                </ul>
                ${accionesHtml}
            </div>
        `;

        Modal.show({ title: `Solicitud #${id}`, body: body });
    }

    static cambiarEstado(id, estado) {
        const res = SolicitudService.cambiarEstado(id, estado);
        if (res.success) {
            Toast.success(res.message);
            // Cerrar modal actual (truco simple, cierra todos los modales)
            for (const b of document.querySelectorAll('.btn-close')) {
                b.click();
            }
            this.cargarTabla('todas'); // Recargar vista bodega
        } else {
            Toast.error(res.message);
        }
    }
}