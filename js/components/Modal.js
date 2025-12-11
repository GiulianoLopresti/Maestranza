// ============================================
// COMPONENTE MODAL
// Maestranza Unidos S.A.
// ============================================

/**
 * Componente reutilizable de modales
 * Incluye: crear, editar, confirmar, custom
 */
class Modal {
    
    /**
     * Muestra un modal
     * @param {Object} config - Configuración del modal
     */
    static show(config) {
        const {
            id = 'modal_' + generarID(),
            title = 'Modal',
            body = '',
            size = 'md', // sm, md, lg, xl
            footer = null,
            onClose = null,
            closeOnBackdrop = true
        } = config;
        
        // Crear modal
        const modalHTML = `
            <div class="modal fade" id="${id}" tabindex="-1" data-bs-backdrop="${closeOnBackdrop ? 'true' : 'static'}">
                <div class="modal-dialog modal-${size} modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${escaparHTML(title)}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${body}
                        </div>
                        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Agregar al DOM
        const modalElement = document.createElement('div');
        modalElement.innerHTML = modalHTML;
        document.body.appendChild(modalElement.firstElementChild);
        
        // Inicializar con Bootstrap
        const modal = new bootstrap.Modal(document.getElementById(id));
        
        // Event listener para cerrar
        document.getElementById(id).addEventListener('hidden.bs.modal', () => {
            document.getElementById(id).remove();
            if (onClose) onClose();
        });
        
        // Mostrar
        modal.show();
        
        return { modal, id };
    }
    
    /**
     * Modal de confirmación
     * @param {Object} config - Configuración
     * @returns {Promise}
     */
    static confirm(config) {
        const {
            title = 'Confirmar Acción',
            message = '¿Estás seguro?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            type = 'warning' // success, warning, danger, info
        } = config;
        
        return new Promise((resolve) => {
            const icons = {
                success: 'fa-check-circle text-success',
                warning: 'fa-exclamation-triangle text-warning',
                danger: 'fa-exclamation-circle text-danger',
                info: 'fa-info-circle text-info'
            };
            
            const body = `
                <div class="text-center py-3">
                    <i class="fas ${icons[type]} fa-4x mb-3"></i>
                    <p class="fs-5">${escaparHTML(message)}</p>
                </div>
            `;
            
            const footer = `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    ${escaparHTML(cancelText)}
                </button>
                <button type="button" class="btn btn-${type === 'danger' ? 'danger' : 'primary'}" id="confirmBtn">
                    ${escaparHTML(confirmText)}
                </button>
            `;
            
            const { id } = this.show({
                title,
                body,
                footer,
                size: 'sm',
                closeOnBackdrop: false
            });
            
            // Event listeners
            document.getElementById('confirmBtn').addEventListener('click', () => {
                bootstrap.Modal.getInstance(document.getElementById(id)).hide();
                resolve(true);
            });
            
            document.getElementById(id).addEventListener('hidden.bs.modal', () => {
                resolve(false);
            }, { once: true });
        });
    }
    
    /**
     * Modal de formulario para crear/editar pieza
     * @param {Object} pieza - Pieza a editar (null para crear)
     * @returns {Promise}
     */
    static formPieza(pieza = null) {
        const isEdit = pieza !== null;
        const title = isEdit ? 'Editar Pieza' : 'Nueva Pieza';
        
        const categorias = CategoriaStorage.getAll();
        const proveedores = StorageManager.getItem(STORAGE_KEYS.PROVEEDORES, []);
        
        // Obtener categorías seleccionadas si es edición
        let categoriasSeleccionadas = [];
        if (isEdit) {
            categoriasSeleccionadas = InventarioService.getCategoriasDepieza(pieza.id).map(c => c.id);
        }
        
        const body = `
            <form id="formPieza">
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label" for="numero_serie">
                                Número de Serie <span class="text-danger">*</span>
                            </label>
                            <input 
                                type="text" 
                                class="form-control" 
                                id="numero_serie" 
                                value="${pieza ? escaparHTML(pieza.numero_serie) : ''}"
                                placeholder="Ej: HM-001"
                                required
                            >
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label" for="nombre">
                                Nombre <span class="text-danger">*</span>
                            </label>
                            <input 
                                type="text" 
                                class="form-control" 
                                id="nombre" 
                                value="${pieza ? escaparHTML(pieza.nombre) : ''}"
                                placeholder="Nombre de la pieza"
                                required
                            >
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="descripcion">Descripción</label>
                    <textarea 
                        class="form-control" 
                        id="descripcion" 
                        rows="2"
                        placeholder="Descripción detallada de la pieza"
                    >${pieza?.descripcion ? escaparHTML(pieza.descripcion) : ''}</textarea>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label" for="ubicacion">
                                Ubicación <span class="text-danger">*</span>
                            </label>
                            <input 
                                type="text" 
                                class="form-control" 
                                id="ubicacion" 
                                value="${pieza ? escaparHTML(pieza.ubicacion) : ''}"
                                placeholder="Ej: Estante A1-B2"
                                required
                            >
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label" for="unidad_medida">Unidad de Medida</label>
                            <select class="form-control" id="unidad_medida">
                                ${Object.entries(UNIDADES_MEDIDA).map(([key, value]) => `
                                    <option value="${value}" ${pieza && pieza.unidad_medida === value ? 'selected' : ''}>
                                        ${value}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label" for="stock_actual">
                                Stock Actual ${isEdit ? '' : '<span class="text-danger">*</span>'}
                            </label>
                            <input 
                                type="number" 
                                class="form-control" 
                                id="stock_actual" 
                                value="${pieza ? pieza.stock_actual : 0}"
                                min="0"
                                ${isEdit ? 'disabled' : 'required'}
                            >
                            ${isEdit ? '<small class="text-muted">Usa movimientos para cambiar el stock</small>' : ''}
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label" for="stock_minimo">
                                Stock Mínimo <span class="text-danger">*</span>
                            </label>
                            <input 
                                type="number" 
                                class="form-control" 
                                id="stock_minimo" 
                                value="${pieza ? pieza.stock_minimo : 0}"
                                min="0"
                                required
                            >
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="form-group">
                            <label class="form-label" for="precio_unitario">Precio Unitario</label>
                            <input 
                                type="number" 
                                class="form-control" 
                                id="precio_unitario" 
                                value="${pieza ? pieza.precio_unitario : 0}"
                                min="0"
                                step="0.01"
                            >
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label" for="proveedor_id">Proveedor</label>
                            <select class="form-control" id="proveedor_id">
                                <option value="">Sin proveedor</option>
                                ${proveedores.map(prov => `
                                    <option value="${prov.id}" ${pieza && pieza.proveedor_id === prov.id ? 'selected' : ''}>
                                        ${escaparHTML(prov.nombre)}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="form-label" for="lote">Lote</label>
                            <input 
                                type="text" 
                                class="form-control" 
                                id="lote" 
                                value="${pieza?.lote ? escaparHTML(pieza.lote) : ''}"
                                placeholder="Número de lote"
                            >
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Categorías</label>
                    <div class="row">
                        ${categorias.map(cat => `
                            <div class="col-md-6">
                                <div class="form-check">
                                    <input 
                                        class="form-check-input categoria-check" 
                                        type="checkbox" 
                                        value="${cat.id}" 
                                        id="cat_${cat.id}"
                                        ${categoriasSeleccionadas.includes(cat.id) ? 'checked' : ''}
                                    >
                                    <label class="form-check-label" for="cat_${cat.id}">
                                        <span class="badge" style="background-color: ${cat.color}; margin-right: 0.5rem;">●</span>
                                        ${escaparHTML(cat.nombre)}
                                    </label>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="fecha_vencimiento">Fecha de Vencimiento</label>
                    <input 
                        type="date" 
                        class="form-control" 
                        id="fecha_vencimiento" 
                        value="${pieza?.fecha_vencimiento ?? ''}"
                    >
                </div>
            </form>
        `;
        
        const footer = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
            </button>
            <button type="button" class="btn btn-primary" id="guardarPiezaBtn">
                <i class="fas fa-save me-2"></i>
                ${isEdit ? 'Actualizar' : 'Guardar'}
            </button>
        `;
        
        return new Promise((resolve) => {
            const { id } = this.show({
                title,
                body,
                footer,
                size: 'lg',
                closeOnBackdrop: false
            });
            
            // Event listener para guardar
            document.getElementById('guardarPiezaBtn').addEventListener('click', () => {
                const form = document.getElementById('formPieza');
                
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
                
                // Recopilar datos del formulario
                const datos = {
                    numero_serie: document.getElementById('numero_serie').value,
                    nombre: document.getElementById('nombre').value,
                    descripcion: document.getElementById('descripcion').value,
                    ubicacion: document.getElementById('ubicacion').value,
                    stock_minimo: document.getElementById('stock_minimo').value,
                    precio_unitario: document.getElementById('precio_unitario').value,
                    unidad_medida: document.getElementById('unidad_medida').value,
                    proveedor_id: document.getElementById('proveedor_id').value || null,
                    lote: document.getElementById('lote').value || null,
                    fecha_vencimiento: document.getElementById('fecha_vencimiento').value || null,
                    categorias: Array.from(document.querySelectorAll('.categoria-check:checked')).map(cb => cb.value)
                };
                
                // Agregar stock_actual solo si es creación
                if (!isEdit) {
                    datos.stock_actual = document.getElementById('stock_actual').value;
                }
                
                bootstrap.Modal.getInstance(document.getElementById(id)).hide();
                resolve({ confirmed: true, datos, isEdit });
            });
            
            document.getElementById(id).addEventListener('hidden.bs.modal', () => {
                resolve({ confirmed: false });
            }, { once: true });
        });
    }
    
    /**
     * Modal para ver detalles de una pieza
     * @param {number} piezaId - ID de la pieza
     */
    static verDetallesPieza(piezaId) {
        const pieza = InventarioService.getConDetalles(piezaId);
        if (!pieza) {
            Toast.error('Pieza no encontrada');
            return;
        }
        
        const body = `
            <div class="pieza-detalles">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <strong>Número de Serie:</strong><br>
                        <span class="text-primary fs-5">${escaparHTML(pieza.numero_serie)}</span>
                    </div>
                    <div class="col-md-6">
                        <strong>Estado del Stock:</strong><br>
                        <span class="badge ${obtenerClaseBadgeStock(pieza.stock_actual, pieza.stock_minimo)} fs-6">
                            ${pieza.estadoStock.toUpperCase()}
                        </span>
                    </div>
                </div>
                
                <div class="mb-3">
                    <strong>Nombre:</strong><br>
                    ${escaparHTML(pieza.nombre)}
                </div>
                
                ${pieza.descripcion ? `
                    <div class="mb-3">
                        <strong>Descripción:</strong><br>
                        ${escaparHTML(pieza.descripcion)}
                    </div>
                ` : ''}
                
                <div class="row mb-3">
                    <div class="col-md-4">
                        <strong>Stock Actual:</strong><br>
                        ${pieza.stock_actual} ${pieza.unidad_medida}
                    </div>
                    <div class="col-md-4">
                        <strong>Stock Mínimo:</strong><br>
                        ${pieza.stock_minimo} ${pieza.unidad_medida}
                    </div>
                    <div class="col-md-4">
                        <strong>Precio Unitario:</strong><br>
                        ${formatearPrecio(pieza.precio_unitario)}
                    </div>
                </div>
                
                <div class="mb-3">
                    <strong>Ubicación:</strong> ${escaparHTML(pieza.ubicacion)}
                </div>
                
                ${pieza.categorias.length > 0 ? `
                    <div class="mb-3">
                        <strong>Categorías:</strong><br>
                        ${pieza.categorias.map(cat => `
                            <span class="badge" style="background-color: ${cat.color}; margin-right: 0.5rem;">
                                ${escaparHTML(cat.nombre)}
                            </span>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${pieza.proveedor ? `
                    <div class="mb-3">
                        <strong>Proveedor:</strong> ${escaparHTML(pieza.proveedor.nombre)}
                    </div>
                ` : ''}
                
                ${pieza.lote ? `
                    <div class="mb-3">
                        <strong>Lote:</strong> ${escaparHTML(pieza.lote)}
                    </div>
                ` : ''}
                
                ${pieza.fecha_vencimiento ? `
                    <div class="mb-3">
                        <strong>Fecha de Vencimiento:</strong> ${formatearFecha(pieza.fecha_vencimiento)}
                    </div>
                ` : ''}
                
                <hr>
                
                <h6 class="mb-3">
                    <i class="fas fa-history me-2"></i>
                    Historial de Movimientos
                </h6>
                
                ${pieza.historial.length > 0 ? `
                    <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Cantidad</th>
                                    <th>Usuario</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${pieza.historial.slice(0, 10).map(mov => `
                                    <tr>
                                        <td>${formatearFechaHora(mov.fecha_movimiento)}</td>
                                        <td>
                                            <span class="badge badge-${DashboardController.getMovimientoColor(mov.tipo_movimiento)}">
                                                ${mov.tipo_movimiento}
                                            </span>
                                        </td>
                                        <td>${mov.cantidad}</td>
                                        <td>${escaparHTML(mov.usuario)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : '<p class="text-muted">No hay movimientos registrados</p>'}
            </div>
        `;
        
        const footer = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cerrar
            </button>
        `;
        
        this.show({
            title: `Detalles de ${pieza.nombre}`,
            body,
            footer,
            size: 'lg'
        });
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Modal;
}