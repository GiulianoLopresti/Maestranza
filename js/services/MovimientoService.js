// ============================================
// SERVICIO DE MOVIMIENTOS
// Maestranza Unidos S.A.
// ============================================

/**
 * Servicio para gestionar los movimientos de inventario
 * HU #4 - Registrar entradas y salidas en tiempo real
 */
class MovimientoService {
    
    /**
     * Registra un nuevo movimiento de inventario
     * @param {Object} datos - Datos del movimiento
     * @returns {Object} - { success: boolean, movimiento?: Object, message: string }
     */
    static registrar(datos) {
        try {
            // Validar datos
            const validacion = this.validarDatos(datos);
            if (!validacion.valid) {
                return {
                    success: false,
                    message: validacion.message
                };
            }
            
            const pieza = PiezaStorage.findById(datos.pieza_id);
            if (!pieza) {
                return {
                    success: false,
                    message: 'Pieza no encontrada'
                };
            }
            
            // Validar stock para salidas
            if (datos.tipo_movimiento === TIPOS_MOVIMIENTO.SALIDA) {
                if (pieza.stock_actual < datos.cantidad) {
                    return {
                        success: false,
                        message: `Stock insuficiente. Disponible: ${pieza.stock_actual}`
                    };
                }
            }
            
            // Crear el movimiento
            const currentUser = AuthService.getCurrentUser();
            const nuevoMovimiento = MovimientoStorage.create({
                pieza_id: datos.pieza_id,
                tipo_movimiento: datos.tipo_movimiento,
                cantidad: datos.cantidad,
                ubicacion_origen: datos.ubicacion_origen || null,
                ubicacion_destino: datos.ubicacion_destino || null,
                usuario_id: currentUser ? currentUser.id : 1,
                proyecto_id: datos.proyecto_id || null,
                observaciones: datos.observaciones || null,
                fecha_movimiento: datos.fecha_movimiento || new Date().toISOString()
            });
            
            // Actualizar stock de la pieza
            const nuevoStock = this.calcularNuevoStock(pieza.stock_actual, datos.cantidad, datos.tipo_movimiento);
            PiezaStorage.update(pieza.id, {
                stock_actual: nuevoStock
            });
            
            // Verificar si hay que crear notificaciones por stock bajo
            const piezaActualizada = PiezaStorage.findById(pieza.id);
            InventarioService.verificarStockBajo(piezaActualizada);
            
            // Log de actividad
            AuthService.logActivity('Movimiento registrado', {
                movimiento_id: nuevoMovimiento.id,
                tipo: datos.tipo_movimiento,
                pieza: pieza.nombre,
                cantidad: datos.cantidad
            });
            
            return {
                success: true,
                movimiento: nuevoMovimiento,
                message: 'Movimiento registrado exitosamente'
            };
            
        } catch (error) {
            console.error('Error al registrar movimiento:', error);
            return {
                success: false,
                message: 'Error al registrar el movimiento'
            };
        }
    }
    
    /**
     * Calcula el nuevo stock según el tipo de movimiento
     * @param {number} stockActual - Stock actual
     * @param {number} cantidad - Cantidad del movimiento
     * @param {string} tipo - Tipo de movimiento
     * @returns {number}
     */
    static calcularNuevoStock(stockActual, cantidad, tipo) {
        switch (tipo) {
            case TIPOS_MOVIMIENTO.ENTRADA:
            case TIPOS_MOVIMIENTO.DEVOLUCION:
                return stockActual + cantidad;
            
            case TIPOS_MOVIMIENTO.SALIDA:
                return stockActual - cantidad;
            
            case TIPOS_MOVIMIENTO.AJUSTE:
                // Para ajustes, la cantidad es el valor absoluto del ajuste
                // Si es positivo suma, si es negativo resta
                return stockActual + cantidad;
            
            case TIPOS_MOVIMIENTO.TRANSFERENCIA:
                // Las transferencias no afectan el stock total
                return stockActual;
            
            default:
                return stockActual;
        }
    }
    
    /**
     * Obtiene todos los movimientos
     * @param {Object} filtros - Filtros opcionales
     * @returns {Array}
     */
    static getAll(filtros = {}) {
        let movimientos = MovimientoStorage.getAll();
        
        // Aplicar filtros
        if (filtros.tipo) {
            movimientos = movimientos.filter(m => m.tipo_movimiento === filtros.tipo);
        }
        
        if (filtros.piezaId) {
            movimientos = movimientos.filter(m => m.pieza_id === filtros.piezaId);
        }
        
        if (filtros.usuarioId) {
            movimientos = movimientos.filter(m => m.usuario_id === filtros.usuarioId);
        }
        
        if (filtros.proyectoId) {
            movimientos = movimientos.filter(m => m.proyecto_id === filtros.proyectoId);
        }
        
        if (filtros.fechaInicio) {
            const inicio = new Date(filtros.fechaInicio);
            movimientos = movimientos.filter(m => new Date(m.fecha_movimiento) >= inicio);
        }
        
        if (filtros.fechaFin) {
            const fin = new Date(filtros.fechaFin);
            fin.setHours(23, 59, 59, 999);
            movimientos = movimientos.filter(m => new Date(m.fecha_movimiento) <= fin);
        }
        
        return movimientos;
    }
    
    /**
     * Obtiene un movimiento por ID
     * @param {number} id - ID del movimiento
     * @returns {Object|null}
     */
    static getById(id) {
        return MovimientoStorage.findById(id);
    }
    
    /**
     * Obtiene los movimientos de una pieza específica
     * @param {number} piezaId - ID de la pieza
     * @returns {Array}
     */
    static getByPieza(piezaId) {
        return MovimientoStorage.findByPiezaId(piezaId);
    }
    
    /**
     * Valida los datos de un movimiento
     * @param {Object} datos - Datos a validar
     * @returns {Object} - { valid: boolean, message?: string }
     */
    static validarDatos(datos) {
        if (!datos.pieza_id) {
            return {
                valid: false,
                message: 'Debe seleccionar una pieza'
            };
        }
        
        if (!datos.tipo_movimiento) {
            return {
                valid: false,
                message: 'Debe seleccionar un tipo de movimiento'
            };
        }
        
        const tiposValidos = Object.values(TIPOS_MOVIMIENTO);
        if (!tiposValidos.includes(datos.tipo_movimiento)) {
            return {
                valid: false,
                message: 'Tipo de movimiento no válido'
            };
        }
        
        if (!datos.cantidad || datos.cantidad <= 0) {
            return {
                valid: false,
                message: 'La cantidad debe ser mayor a 0'
            };
        }
        
        if (!Number.isInteger(Number(datos.cantidad))) {
            return {
                valid: false,
                message: 'La cantidad debe ser un número entero'
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Obtiene estadísticas de movimientos
     * @param {Object} filtros - Filtros opcionales (fechaInicio, fechaFin)
     * @returns {Object}
     */
    static getEstadisticas(filtros = {}) {
        const movimientos = this.getAll(filtros);
        
        const stats = {
            total: movimientos.length,
            entradas: movimientos.filter(m => m.tipo_movimiento === TIPOS_MOVIMIENTO.ENTRADA).length,
            salidas: movimientos.filter(m => m.tipo_movimiento === TIPOS_MOVIMIENTO.SALIDA).length,
            transferencias: movimientos.filter(m => m.tipo_movimiento === TIPOS_MOVIMIENTO.TRANSFERENCIA).length,
            ajustes: movimientos.filter(m => m.tipo_movimiento === TIPOS_MOVIMIENTO.AJUSTE).length,
            devoluciones: movimientos.filter(m => m.tipo_movimiento === TIPOS_MOVIMIENTO.DEVOLUCION).length,
            porTipo: {}
        };
        
        // Contar por tipo
        for (const tipo of Object.values(TIPOS_MOVIMIENTO)) {
            stats.porTipo[tipo] = movimientos.filter(m => m.tipo_movimiento === tipo).length;
        }
        
        // Cantidad total movida
        stats.cantidadTotal = movimientos.reduce((sum, m) => sum + m.cantidad, 0);
        
        return stats;
    }
    
    /**
     * Obtiene los movimientos recientes (últimos 10)
     * @returns {Array}
     */
    static getRecientes(limit = 10) {
        const movimientos = MovimientoStorage.getAll();
        return movimientos
            .sort((a, b) => new Date(b.fecha_movimiento) - new Date(a.fecha_movimiento))
            .slice(0, limit);
    }
    
    /**
     * Obtiene los movimientos del día actual
     * @returns {Array}
     */
    static getDelDia() {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const manana = new Date(hoy);
        manana.setDate(manana.getDate() + 1);
        
        return this.getAll({
            fechaInicio: hoy.toISOString(),
            fechaFin: manana.toISOString()
        });
    }
    
    /**
     * Obtiene los movimientos del mes actual
     * @returns {Array}
     */
    static getDelMes() {
        const ahora = new Date();
        const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const ultimoDia = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
        
        return this.getAll({
            fechaInicio: primerDia.toISOString(),
            fechaFin: ultimoDia.toISOString()
        });
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MovimientoService;
}