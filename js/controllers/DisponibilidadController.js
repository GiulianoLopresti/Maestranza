// ============================================
// CONTROLADOR DE DISPONIBILIDAD
// Maestranza Unidos S.A.
// ============================================

/**
 * Controlador para consultar disponibilidad de materiales
 * HU #8 - Consultar disponibilidad
 */
class DisponibilidadController {
    
    static materialesSeleccionados = [];
    
    /**
     * Inicializa el módulo de disponibilidad
     */
    static init() {
        console.log('🔍 Inicializando Módulo de Disponibilidad...');
        this.render();
        this.setupEventListeners();
    }
    
    /**
     * Renderiza la vista de disponibilidad
     */
    static render() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="dashboard-layout">
                <!-- Sidebar -->
                ${Sidebar.render('/disponibilidad')}
                
                <!-- Main Content -->
                <div class="dashboard-main" id="dashboardMain">
                    <!-- Navbar -->
                    ${Navbar.render('Consultar Disponibilidad')}
                    
                    <!-- Content -->
                    <div class="dashboard-content">
                        <!-- Header -->
                        <div class="dashboard-header">
                            <div>
                                <h1>
                                    <i class="fas fa-search me-3"></i>
                                    Consultar Disponibilidad de Materiales
                                </h1>
                                <p>Verifica si hay materiales disponibles antes de planificar un proyecto</p>
                            </div>
                        </div>
                        
                        <!-- Formulario de Consulta -->
                        <div class="row">
                            <div class="col-lg-8">
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h5 class="mb-0">
                                            <i class="fas fa-list-ul me-2"></i>
                                            Lista de Materiales Requeridos
                                        </h5>
                                    </div>
                                    <div class="card-body">
                                        <div id="materialesContainer">
                                            ${this.renderMaterialRow(0)}
                                        </div>
                                        
                                        <button type="button" class="btn btn-outline-primary btn-sm mt-3" onclick="DisponibilidadController.agregarMaterial()">
                                            <i class="fas fa-plus me-2"></i>
                                            Agregar Material
                                        </button>
                                        
                                        <hr>
                                        
                                        <div class="d-flex gap-2">
                                            <button type="button" class="btn btn-success" onclick="DisponibilidadController.verificarDisponibilidad()">
                                                <i class="fas fa-check-circle me-2"></i>
                                                Verificar Disponibilidad
                                            </button>
                                            <button type="button" class="btn btn-secondary" onclick="DisponibilidadController.limpiarFormulario()">
                                                <i class="fas fa-eraser me-2"></i>
                                                Limpiar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-lg-4">
                                <div class="card mb-4">
                                    <div class="card-body">
                                        <h6 class="mb-3">
                                            <i class="fas fa-info-circle me-2"></i>
                                            ¿Cómo usar?
                                        </h6>
                                        <ol class="small mb-0">
                                            <li class="mb-2">Selecciona los materiales que necesitas</li>
                                            <li class="mb-2">Indica la cantidad requerida de cada uno</li>
                                            <li class="mb-2">Haz clic en "Verificar Disponibilidad"</li>
                                            <li class="mb-0">Revisa los resultados y recomendaciones</li>
                                        </ol>
                                        
                                        <div class="alert alert-info mt-3 mb-0" style="font-size: 0.875rem;">
                                            <i class="fas fa-lightbulb me-2"></i>
                                            <strong>Consejo:</strong> El sistema te mostrará qué materiales están disponibles, cuáles faltan y te dará recomendaciones para proceder.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Resultados -->
                        <div id="resultadosContainer"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Renderiza una fila de material
     */
    static renderMaterialRow(index) {
        const piezas = PiezaStorage.getAll().filter(p => p.activo);
        
        return `
            <div class="material-row mb-3" data-index="${index}">
                <div class="row align-items-end">
                    <div class="col-md-7">
                        <label class="form-label">Material</label>
                        <select class="form-control pieza-select">
                            <option value="">Seleccione un material...</option>
                            ${piezas.map(p => `
                                <option value="${p.id}" data-stock="${p.stock_actual}" data-nombre="${escaparHTML(p.nombre)}">
                                    ${escaparHTML(p.nombre)} - Stock: ${p.stock_actual} ${p.unidad_medida}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Cantidad</label>
                        <input type="number" class="form-control cantidad-input" min="1" placeholder="0">
                    </div>
                    <div class="col-md-2">
                        <button type="button" class="btn btn-outline-danger w-100" onclick="DisponibilidadController.eliminarMaterial(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
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
    }
    
    /**
     * Agrega una fila de material
     */
    static agregarMaterial() {
        const container = document.getElementById('materialesContainer');
        const index = container.children.length;
        
        const newRow = document.createElement('div');
        newRow.innerHTML = this.renderMaterialRow(index);
        container.appendChild(newRow.firstElementChild);
    }
    
    /**
     * Elimina una fila de material
     */
    static eliminarMaterial(index) {
        const container = document.getElementById('materialesContainer');
        const rows = container.querySelectorAll('.material-row');
        
        if (rows.length > 1) {
            rows[index].remove();
        } else {
            Toast.warning('Debe haber al menos un material');
        }
    }
    
    /**
     * Limpia el formulario
     */
    static limpiarFormulario() {
        const container = document.getElementById('materialesContainer');
        container.innerHTML = this.renderMaterialRow(0);
        document.getElementById('resultadosContainer').innerHTML = '';
        this.materialesSeleccionados = [];
    }
    
    /**
     * Verifica la disponibilidad de los materiales
     * HU #8 - Consultar disponibilidad
     */
    static verificarDisponibilidad() {
        // Recopilar materiales
        const materiales = [];
        const rows = document.querySelectorAll('.material-row');
        
        for (const row of rows) {
            const select = row.querySelector('.pieza-select');
            const cantidadInput = row.querySelector('.cantidad-input');
            
            if (select.value && cantidadInput.value && parseFloat(cantidadInput.value) > 0) {
                materiales.push({
                    pieza_id: parseInt(select.value),
                    cantidad: parseFloat(cantidadInput.value)
                });
            }
        }
        
        if (materiales.length === 0) {
            Toast.warning('Debes agregar al menos un material con cantidad');
            return;
        }
        
        // Verificar disponibilidad
        const verificacion = DisponibilidadService.verificarDisponibilidad(materiales);
        const recomendaciones = DisponibilidadService.generarRecomendaciones(verificacion);
        
        // Calcular costo de faltantes
        const faltantes = verificacion.materiales.filter(m => !m.disponible);
        const costoFaltantes = faltantes.length > 0 ? 
            DisponibilidadService.calcularCostoFaltantes(faltantes) : null;
        
        // Mostrar resultados
        this.mostrarResultados(verificacion, recomendaciones, costoFaltantes);
        
        // Scroll a resultados
        document.getElementById('resultadosContainer').scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Muestra los resultados de la verificación
     */
    static mostrarResultados(verificacion, recomendaciones, costoFaltantes) {
        const container = document.getElementById('resultadosContainer');
        
        let html = `
            <div class="card mb-4">
                <div class="card-header ${verificacion.todo_disponible ? 'bg-success text-white' : 'bg-warning'}">
                    <h5 class="mb-0">
                        <i class="fas ${verificacion.todo_disponible ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2"></i>
                        Resultados de la Verificación
                    </h5>
                </div>
                <div class="card-body">
                    <!-- Resumen -->
                    <div class="row mb-4">
                        <div class="col-md-4">
                            <div class="stat-card">
                                <div class="stat-label">Total Items</div>
                                <div class="stat-value">${verificacion.resumen.total_items}</div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="stat-card">
                                <div class="stat-label">Disponibles</div>
                                <div class="stat-value text-success">${verificacion.resumen.items_disponibles}</div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="stat-card">
                                <div class="stat-label">Faltantes</div>
                                <div class="stat-value text-danger">${verificacion.resumen.items_faltantes}</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recomendaciones -->
                    ${recomendaciones.length > 0 ? `
                        <div class="mb-4">
                            <h6 class="mb-3">
                                <i class="fas fa-lightbulb me-2"></i>
                                Recomendaciones
                            </h6>
                            ${recomendaciones.map(rec => `
                                <div class="alert alert-${rec.tipo} mb-2">
                                    ${rec.mensaje}
                                    ${rec.detalles ? `
                                        <ul class="mb-0 mt-2 small">
                                            ${rec.detalles.map(d => `<li>${d}</li>`).join('')}
                                        </ul>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <!-- Costo de faltantes -->
                    ${costoFaltantes ? `
                        <div class="alert alert-info mb-4">
                            <h6 class="mb-2">
                                <i class="fas fa-dollar-sign me-2"></i>
                                Costo Estimado de Materiales Faltantes
                            </h6>
                            <div class="fs-4 fw-bold mb-2">${formatearPrecio(costoFaltantes.costo_total)}</div>
                            <details>
                                <summary class="cursor-pointer small">Ver desglose</summary>
                                <ul class="mt-2 mb-0 small">
                                    ${costoFaltantes.desglose.map(d => `
                                        <li>${d.pieza}: ${d.cantidad_faltante} x ${formatearPrecio(d.precio_unitario)} = ${formatearPrecio(d.costo_total)}</li>
                                    `).join('')}
                                </ul>
                            </details>
                        </div>
                    ` : ''}
                    
                    <!-- Tabla de materiales -->
                    <h6 class="mb-3">
                        <i class="fas fa-list me-2"></i>
                        Detalle de Materiales
                    </h6>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Material</th>
                                    <th>Requerido</th>
                                    <th>Disponible</th>
                                    <th>Estado</th>
                                    <th>Disponibilidad</th>
                                    <th>Ubicación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${verificacion.materiales.map(m => this.renderMaterialRow2(m)).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Renderiza una fila de material en la tabla de resultados
     */
    static renderMaterialRow2(material) {
        const colorEstado = material.disponible ? 'success' : 'danger';
        const icono = material.disponible ? 'fa-check-circle' : 'fa-times-circle';
        const estado = material.disponible ? 'Disponible' : 'Insuficiente';
        
        return `
            <tr>
                <td>
                    <strong>${escaparHTML(material.nombre)}</strong><br>
                    <small class="text-muted">${material.numero_serie}</small>
                </td>
                <td>${material.cantidad_requerida} ${material.unidad_medida}</td>
                <td>${material.stock_disponible} ${material.unidad_medida}</td>
                <td>
                    <span class="badge badge-${colorEstado}">
                        <i class="fas ${icono} me-1"></i>
                        ${estado}
                    </span>
                    ${!material.disponible ? `
                        <br><small class="text-danger">Falta: ${material.faltante}</small>
                    ` : ''}
                </td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar bg-${colorEstado}" style="width: ${material.porcentaje_disponible}%">
                            ${material.porcentaje_disponible.toFixed(0)}%
                        </div>
                    </div>
                </td>
                <td>${escaparHTML(material.ubicacion)}</td>
                <td>
                    ${!material.disponible ? `
                        <button class="btn btn-sm btn-outline-info" onclick="DisponibilidadController.buscarAlternativas(${material.pieza_id})" title="Buscar alternativas">
                            <i class="fas fa-search"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }
    
    /**
     * Busca materiales alternativos
     */
    static async buscarAlternativas(piezaId) {
        const pieza = PiezaStorage.findById(piezaId);
        const alternativas = DisponibilidadService.obtenerAlternativas(piezaId);
        
        let body = `
            <div class="mb-3">
                <h6>Material original:</h6>
                <p class="mb-0"><strong>${pieza.nombre}</strong> (${pieza.numero_serie})</p>
                <p class="text-danger small mb-0">Stock actual: ${pieza.stock_actual}</p>
            </div>
            <hr>
        `;
        
        if (alternativas.length === 0) {
            body += `
                <div class="alert alert-warning">
                    <i class="fas fa-info-circle me-2"></i>
                    No se encontraron materiales alternativos en las mismas categorías.
                </div>
            `;
        } else {
            body += `
                <h6 class="mb-3">Alternativas disponibles:</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th>Stock</th>
                                <th>Ubicación</th>
                                <th>Categoría</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${alternativas.map(alt => `
                                <tr>
                                    <td>
                                        <strong>${escaparHTML(alt.nombre)}</strong><br>
                                        <small class="text-muted">${alt.numero_serie}</small>
                                    </td>
                                    <td><span class="badge badge-success">${alt.stock_disponible}</span></td>
                                    <td>${escaparHTML(alt.ubicacion)}</td>
                                    <td><small>${escaparHTML(alt.categoria_comun)}</small></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="alert alert-info mt-3 mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    <small>Estas alternativas comparten categorías con el material original. Verifica que cumplan con las especificaciones técnicas requeridas.</small>
                </div>
            `;
        }
        
        Modal.show({
            title: 'Materiales Alternativos',
            body,
            footer: `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            `,
            size: 'lg'
        });
    }
}

// Estilos adicionales
const disponibilidadStyles = document.createElement('style');
disponibilidadStyles.textContent = `
    .stat-card {
        text-align: center;
        padding: 1rem;
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-lg);
        background: var(--white);
    }
    
    .stat-card .stat-label {
        font-size: var(--font-size-sm);
        color: var(--gray-600);
        margin-bottom: 0.5rem;
    }
    
    .stat-card .stat-value {
        font-size: var(--font-size-3xl);
        font-weight: var(--font-weight-bold);
        color: var(--dark-slate);
    }
    
    .cursor-pointer {
        cursor: pointer;
    }
`;

document.head.appendChild(disponibilidadStyles);

// Hacer disponible globalmente
window.DisponibilidadController = DisponibilidadController;

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DisponibilidadController;
}