// ============================================
// SERVICIO DE ÓRDENES DE COMPRA AUTOMÁTICAS
// HU #7 - Generación automática de orden
// ============================================

/**
 * Servicio para gestionar órdenes de compra automáticas
 * Genera órdenes cuando el stock llega al mínimo
 */
class OrdenCompraService {
    
    /**
     * Verifica todas las piezas y genera órdenes automáticas si es necesario
     * @returns {Array} - Órdenes generadas
     */
    static verificarYGenerarOrdenes() {
        const piezas = PiezaStorage.getAll();
        const ordenesGeneradas = [];
        
        piezas.forEach(pieza => {
            // Verificar si tiene reposición automática habilitada
            if (this.tieneReposicionAutomatica(pieza.id)) {
                const porcentaje = calcularPorcentajeStock(pieza.stock_actual, pieza.stock_minimo);
                
                // Si llegó al stock mínimo, generar orden
                if (porcentaje <= 100) {
                    const orden = this.generarOrdenAutomatica(pieza);
                    if (orden) {
                        ordenesGeneradas.push(orden);
                    }
                }
            }
        });
        
        return ordenesGeneradas;
    }
    
    /**
     * Genera una orden de compra automática para una pieza
     * @param {Object} pieza - Pieza para generar orden
     * @returns {Object|null}
     */
    static generarOrdenAutomatica(pieza) {
        try {
            // Verificar si ya existe una orden pendiente para esta pieza
            const ordenes = this.getAll();
            const ordenPendiente = ordenes.find(o => 
                o.pieza_id === pieza.id && 
                o.estado === 'Borrador'
            );
            
            if (ordenPendiente) {
                console.log(`Ya existe orden pendiente para ${pieza.nombre}`);
                return null;
            }
            
            // Calcular cantidad a pedir (el doble del stock mínimo)
            const cantidadAPedir = pieza.stock_minimo * 2;
            
            // Crear orden de compra
            const orden = this.crear({
                pieza_id: pieza.id,
                proveedor_id: pieza.proveedor_id,
                cantidad: cantidadAPedir,
                precio_unitario: pieza.precio_unitario,
                tipo: 'Automática',
                estado: 'Borrador',
                observaciones: `Orden generada automáticamente por stock bajo (${pieza.stock_actual}/${pieza.stock_minimo})`
            });
            
            // Crear notificación para compradores
            const compradores = UsuarioStorage.getAll().filter(u => u.rol === ROLES.COMPRADOR);
            compradores.forEach(comprador => {
                NotificacionStorage.create({
                    usuario_id: comprador.id,
                    tipo_notificacion: TIPOS_NOTIFICACION.SISTEMA,
                    titulo: 'Orden de Compra Generada',
                    mensaje: `Se ha generado automáticamente una orden de compra para "${pieza.nombre}" (${cantidadAPedir} unidades)`,
                    datos_adicionales: JSON.stringify({ 
                        orden_id: orden.id,
                        pieza_id: pieza.id
                    })
                });
            });
            
            console.log(`✅ Orden automática generada para ${pieza.nombre}`);
            return orden;
            
        } catch (error) {
            console.error('Error al generar orden automática:', error);
            return null;
        }
    }
    
    /**
     * Crea una nueva orden de compra
     * @param {Object} datos - Datos de la orden
     * @returns {Object}
     */
    static crear(datos) {
        const ordenes = this.getAll();
        const newId = ordenes.length > 0 ? Math.max(...ordenes.map(o => o.id)) + 1 : 1;
        
        const nuevaOrden = {
            id: newId,
            pieza_id: datos.pieza_id,
            proveedor_id: datos.proveedor_id || null,
            cantidad: datos.cantidad,
            precio_unitario: datos.precio_unitario,
            precio_total: datos.cantidad * datos.precio_unitario,
            tipo: datos.tipo || 'Manual', // Manual o Automática
            estado: datos.estado || 'Borrador', // Borrador, Enviada, Recibida, Cancelada
            observaciones: datos.observaciones || '',
            fecha_creacion: new Date().toISOString(),
            fecha_envio: null,
            fecha_recepcion: null,
            usuario_creador_id: AuthService.getCurrentUser()?.id || 1
        };
        
        ordenes.push(nuevaOrden);
        StorageManager.setItem('ordenes_compra', ordenes);
        
        return nuevaOrden;
    }
    
    /**
     * Obtiene todas las órdenes de compra
     * @returns {Array}
     */
    static getAll() {
        return StorageManager.getItem('ordenes_compra', []);
    }
    
    /**
     * Obtiene una orden por ID
     * @param {number} id
     * @returns {Object|null}
     */
    static getById(id) {
        const ordenes = this.getAll();
        return ordenes.find(o => o.id === parseInt(id)) || null;
    }
    
    /**
     * Actualiza el estado de una orden
     * @param {number} id - ID de la orden
     * @param {string} estado - Nuevo estado
     * @returns {Object}
     */
    static actualizarEstado(id, estado) {
        const ordenes = this.getAll();
        const index = ordenes.findIndex(o => o.id === parseInt(id));
        
        if (index !== -1) {
            ordenes[index].estado = estado;
            
            if (estado === 'Enviada') {
                ordenes[index].fecha_envio = new Date().toISOString();
            } else if (estado === 'Recibida') {
                ordenes[index].fecha_recepcion = new Date().toISOString();
                
                // Registrar entrada de stock
                this.procesarRecepcion(ordenes[index]);
            }
            
            StorageManager.setItem('ordenes_compra', ordenes);
            return ordenes[index];
        }
        
        return null;
    }
    
    /**
     * Procesa la recepción de una orden (incrementa stock)
     * @param {Object} orden - Orden recibida
     */
    static procesarRecepcion(orden) {
        const pieza = PiezaStorage.findById(orden.pieza_id);
        if (!pieza) return;
        
        // Incrementar stock
        const nuevoStock = pieza.stock_actual + orden.cantidad;
        PiezaStorage.update(orden.pieza_id, {
            stock_actual: nuevoStock
        });
        
        // Registrar movimiento de entrada
        const currentUser = AuthService.getCurrentUser();
        MovimientoStorage.create({
            pieza_id: orden.pieza_id,
            tipo_movimiento: TIPOS_MOVIMIENTO.ENTRADA,
            cantidad: orden.cantidad,
            ubicacion_origen: 'Proveedor',
            ubicacion_destino: pieza.ubicacion,
            usuario_id: currentUser ? currentUser.id : 1,
            proyecto_id: null,
            observaciones: `Recepción de orden de compra #${orden.id}`
        });
        
        console.log(`✅ Stock actualizado: ${pieza.nombre} - ${nuevoStock} unidades`);
    }
    
    /**
     * Habilita/deshabilita reposición automática para una pieza
     * @param {number} piezaId - ID de la pieza
     * @param {boolean} habilitado - true para habilitar
     */
    static configurarReposicionAutomatica(piezaId, habilitado) {
        let config = StorageManager.getItem('config_reposicion_automatica', {});
        config[piezaId] = habilitado;
        StorageManager.setItem('config_reposicion_automatica', config);
    }
    
    /**
     * Verifica si una pieza tiene reposición automática habilitada
     * @param {number} piezaId - ID de la pieza
     * @returns {boolean}
     */
    static tieneReposicionAutomatica(piezaId) {
        const config = StorageManager.getItem('config_reposicion_automatica', {});
        return config[piezaId] === true;
    }
    
    /**
     * Obtiene órdenes pendientes (borradores)
     * @returns {Array}
     */
    static getOrdenesPendientes() {
        return this.getAll().filter(o => o.estado === 'Borrador');
    }
    
    /**
     * Envía una orden (cambia estado a Enviada)
     * @param {number} id - ID de la orden
     * @returns {Object}
     */
    static enviarOrden(id) {
        return this.actualizarEstado(id, 'Enviada');
    }
    
    /**
     * Cancela una orden
     * @param {number} id - ID de la orden
     * @returns {Object}
     */
    static cancelarOrden(id) {
        return this.actualizarEstado(id, 'Cancelada');
    }
}

// Sistema automático: verificar cada hora (simulado con intervalo)
// En producción esto sería un cron job en el backend
setInterval(() => {
    const ordenes = OrdenCompraService.verificarYGenerarOrdenes();
    if (ordenes.length > 0) {
        console.log(`🛒 ${ordenes.length} orden(es) de compra generada(s) automáticamente`);
    }
}, 60000 * 60); // Cada hora

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrdenCompraService;
}