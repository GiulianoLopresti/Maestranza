// ============================================
// SERVICIO DE INVENTARIO
// Maestranza Unidos S.A.
// ============================================

/**
 * Servicio para gestionar el inventario de piezas
 * Cubre HU #1, #2, #3, #5
 */
class InventarioService {
    
    /**
     * Obtiene todas las piezas del inventario
     * @param {Object} filtros - Filtros opcionales
     * @returns {Array}
     */
    static getAll(filtros = {}) {
        let piezas = PiezaStorage.getAll();
        
        // Aplicar filtros
        if (filtros.activo !== undefined) {
            piezas = piezas.filter(p => p.activo === filtros.activo);
        }
        
        if (filtros.categoria) {
            const relacionesPiezasCategorias = StorageManager.getItem('piezas_categorias', []);
            const piezasEnCategoria = new Set(relacionesPiezasCategorias
                .filter(r => r.categoria_id === Number.parseInt(filtros.categoria))
                .map(r => r.pieza_id));
            piezas = piezas.filter(p => piezasEnCategoria.has(p.id));
        }
        
        if (filtros.busqueda) {
            const busqueda = filtros.busqueda.toLowerCase();
            piezas = piezas.filter(p => 
                p.nombre.toLowerCase().includes(busqueda) ||
                p.numero_serie.toLowerCase().includes(busqueda) ||
                p.descripcion?.toLowerCase().includes(busqueda)
            );
        }
        
        if (filtros.stockBajo) {
            piezas = piezas.filter(p => {
                const porcentaje = calcularPorcentajeStock(p.stock_actual, p.stock_minimo);
                return porcentaje <= CONFIG.STOCK.LOW_THRESHOLD_PERCENTAGE;
            });
        }
        
        if (filtros.stockCritico) {
            piezas = piezas.filter(p => {
                const porcentaje = calcularPorcentajeStock(p.stock_actual, p.stock_minimo);
                return porcentaje <= CONFIG.STOCK.CRITICAL_THRESHOLD_PERCENTAGE;
            });
        }
        
        return piezas;
    }
    
    /**
     * Obtiene una pieza por ID
     * HU #3 - Ver historial de pieza
     * @param {number} id - ID de la pieza
     * @returns {Object|null}
     */
    static getById(id) {
        return PiezaStorage.findById(id);
    }
    
    /**
     * Obtiene una pieza con su información completa (categorías, historial, etc)
     * @param {number} id - ID de la pieza
     * @returns {Object|null}
     */
    static getConDetalles(id) {
        const pieza = this.getById(id);
        if (!pieza) return null;
        
        return {
            ...pieza,
            categorias: this.getCategoriasDepieza(id),
            historial: this.getHistorial(id),
            proveedor: pieza.proveedor_id ? StorageManager.getItem(STORAGE_KEYS.PROVEEDORES, []).find(p => p.id === pieza.proveedor_id) : null,
            estadoStock: obtenerEstadoStock(pieza.stock_actual, pieza.stock_minimo),
            porcentajeStock: calcularPorcentajeStock(pieza.stock_actual, pieza.stock_minimo)
        };
    }
    
    /**
     * Crea una nueva pieza en el inventario
     * HU #1 - Registro exitoso de una nueva pieza
     * @param {Object} datos - Datos de la pieza
     * @returns {Object} - { success: boolean, pieza?: Object, message: string }
     */
    static crear(datos) {
        try {
            // Validar datos
            const validacion = this.validarDatos(datos);
            if (!validacion.valid) {
                return {
                    success: false,
                    message: validacion.message
                };
            }
            
            // Verificar que el número de serie sea único
            const existente = PiezaStorage.findByNumeroSerie(datos.numero_serie);
            if (existente) {
                return {
                    success: false,
                    message: 'Ya existe una pieza con ese número de serie'
                };
            }
            
            // Crear pieza
            const nuevaPieza = PiezaStorage.create({
                numero_serie: datos.numero_serie.trim().toUpperCase(),
                nombre: datos.nombre.trim(),
                descripcion: datos.descripcion ? datos.descripcion.trim() : null,
                ubicacion: datos.ubicacion.trim(),
                stock_actual: Number.parseInt(datos.stock_actual) || 0,
                stock_minimo: Number.parseInt(datos.stock_minimo) || 0,
                precio_unitario: Number.parseFloat(datos.precio_unitario) || 0,
                unidad_medida: datos.unidad_medida || UNIDADES_MEDIDA.UNIDAD,
                fecha_vencimiento: datos.fecha_vencimiento || null,
                lote: datos.lote || null,
                proveedor_id: datos.proveedor_id ? Number.parseInt(datos.proveedor_id) : null
            });
            
            // Asignar categorías si se proporcionaron
            if (datos.categorias && Array.isArray(datos.categorias)) {
                this.asignarCategorias(nuevaPieza.id, datos.categorias);
            }
            
            // Registrar movimiento de entrada inicial
            if (nuevaPieza.stock_actual > 0) {
                const currentUser = AuthService.getCurrentUser();
                MovimientoStorage.create({
                    pieza_id: nuevaPieza.id,
                    tipo_movimiento: TIPOS_MOVIMIENTO.ENTRADA,
                    cantidad: nuevaPieza.stock_actual,
                    ubicacion_origen: 'Proveedor',
                    ubicacion_destino: nuevaPieza.ubicacion,
                    usuario_id: currentUser ? currentUser.id : 1,
                    proyecto_id: null,
                    observaciones: 'Registro inicial de pieza'
                });
            }
            
            // Verificar si necesita notificación por stock bajo
            this.verificarStockBajo(nuevaPieza);
            
            // Log de actividad
            AuthService.logActivity('Pieza creada', {
                pieza_id: nuevaPieza.id,
                numero_serie: nuevaPieza.numero_serie,
                nombre: nuevaPieza.nombre
            });
            
            return {
                success: true,
                pieza: nuevaPieza,
                message: 'Pieza registrada exitosamente'
            };
            
        } catch (error) {
            console.error('Error al crear pieza:', error);
            return {
                success: false,
                message: 'Error al crear la pieza'
            };
        }
    }
    
    /**
     * Actualiza una pieza existente
     * @param {number} id - ID de la pieza
     * @param {Object} datos - Datos a actualizar
     * @returns {Object} - { success: boolean, pieza?: Object, message: string }
     */
    static actualizar(id, datos) {
        try {
            const piezaExistente = this.getById(id);
            if (!piezaExistente) {
                return { success: false, message: 'Pieza no encontrada' };
            }
            
            const validacionError = this._validarActualizacion(id, datos, piezaExistente);
            if (validacionError) {
                return validacionError;
            }
            
            const datosActualizados = this._prepararDatosActualizacion(datos, piezaExistente);
            const piezaActualizada = PiezaStorage.update(id, datosActualizados);
            
            this._procesarActualizacionesAdicionales(id, datos, piezaActualizada);
            
            return {
                success: true,
                pieza: piezaActualizada,
                message: 'Pieza actualizada exitosamente'
            };
            
        } catch (error) {
            console.error('Error al actualizar pieza:', error);
            return { success: false, message: 'Error al actualizar la pieza' };
        }
    }
    
    /**
     * Valida la actualización de una pieza
     * @private
     */
    static _validarActualizacion(id, datos, piezaExistente) {
        const validacion = this.validarDatos(datos, id);
        if (!validacion.valid) {
            return { success: false, message: validacion.message };
        }
        
        if (datos.numero_serie && datos.numero_serie !== piezaExistente.numero_serie) {
            const existente = PiezaStorage.findByNumeroSerie(datos.numero_serie);
            if (existente && existente.id !== id) {
                return { success: false, message: 'Ya existe una pieza con ese número de serie' };
            }
        }
        
        return null;
    }
    
    /**
     * Prepara los datos para actualización
     * @private
     */
    static _prepararDatosActualizacion(datos, piezaExistente) {
        return {
            numero_serie: datos.numero_serie ? datos.numero_serie.trim().toUpperCase() : piezaExistente.numero_serie,
            nombre: datos.nombre ? datos.nombre.trim() : piezaExistente.nombre,
            descripcion: datos.descripcion === undefined ? piezaExistente.descripcion : datos.descripcion.trim(),
            ubicacion: datos.ubicacion ? datos.ubicacion.trim() : piezaExistente.ubicacion,
            stock_minimo: datos.stock_minimo === undefined ? piezaExistente.stock_minimo : Number.parseInt(datos.stock_minimo),
            precio_unitario: datos.precio_unitario === undefined ? piezaExistente.precio_unitario : Number.parseFloat(datos.precio_unitario),
            unidad_medida: datos.unidad_medida || piezaExistente.unidad_medida,
            fecha_vencimiento: datos.fecha_vencimiento === undefined ? piezaExistente.fecha_vencimiento : datos.fecha_vencimiento,
            lote: datos.lote === undefined ? piezaExistente.lote : datos.lote,
            proveedor_id: this._determinarProveedorId(datos.proveedor_id, piezaExistente.proveedor_id)
        };
    }
    
    /**
     * Determina el ID del proveedor
     * @private
     */
    static _determinarProveedorId(nuevoProveedorId, proveedorActual) {
        if (nuevoProveedorId === undefined) return proveedorActual;
        if (nuevoProveedorId) return Number.parseInt(nuevoProveedorId);
        return null;
    }
    
    /**
     * Procesa actualizaciones adicionales (categorías, notificaciones, logs)
     * @private
     */
    static _procesarActualizacionesAdicionales(id, datos, piezaActualizada) {
        if (datos.categorias && Array.isArray(datos.categorias)) {
            this.asignarCategorias(id, datos.categorias);
        }
        
        this.verificarStockBajo(piezaActualizada);
        
        AuthService.logActivity('Pieza actualizada', {
            pieza_id: id,
            numero_serie: piezaActualizada.numero_serie,
            cambios: datos
        });
    }
    
    /**
     * Elimina (desactiva) una pieza
     * @param {number} id - ID de la pieza
     * @returns {Object} - { success: boolean, message: string }
     */
    static eliminar(id) {
        try {
            const pieza = this.getById(id);
            if (!pieza) {
                return {
                    success: false,
                    message: 'Pieza no encontrada'
                };
            }
            
            // Desactivar en lugar de eliminar
            PiezaStorage.update(id, { activo: false });
            
            // Log de actividad
            AuthService.logActivity('Pieza eliminada', {
                pieza_id: id,
                numero_serie: pieza.numero_serie,
                nombre: pieza.nombre
            });
            
            return {
                success: true,
                message: 'Pieza eliminada exitosamente'
            };
            
        } catch (error) {
            console.error('Error al eliminar pieza:', error);
            return {
                success: false,
                message: 'Error al eliminar la pieza'
            };
        }
    }
    
    /**
     * Asigna categorías a una pieza
     * HU #2 - Asignar categoría existente a un producto
     * @param {number} piezaId - ID de la pieza
     * @param {Array} categoriaIds - IDs de las categorías
     */
    static asignarCategorias(piezaId, categoriaIds) {
        let relaciones = StorageManager.getItem('piezas_categorias', []);
        
        // Eliminar relaciones existentes de esta pieza
        relaciones = relaciones.filter(r => r.pieza_id !== piezaId);
        
        // Agregar nuevas relaciones
        const maxId = relaciones.length > 0 ? Math.max(...relaciones.map(r => r.id)) : 0;
        let nextId = maxId + 1;
        
        for (const categoriaId of categoriaIds) {
            relaciones.push({
                id: nextId++,
                pieza_id: piezaId,
                categoria_id: Number.parseInt(categoriaId),
                asignado_en: new Date().toISOString()
            });
        }
        
        StorageManager.setItem('piezas_categorias', relaciones);
    }
    
    /**
     * Obtiene las categorías de una pieza
     * @param {number} piezaId - ID de la pieza
     * @returns {Array}
     */
    static getCategoriasDepieza(piezaId) {
        const relaciones = StorageManager.getItem('piezas_categorias', []);
        const categorias = CategoriaStorage.getAll();
        
        const categoriaIds = new Set(relaciones
            .filter(r => r.pieza_id === piezaId)
            .map(r => r.categoria_id));
        
        return categorias.filter(c => categoriaIds.has(c.id));
    }
    
    /**
     * Obtiene el historial de movimientos de una pieza
     * HU #3 - Ver historial de una pieza
     * @param {number} piezaId - ID de la pieza
     * @returns {Array}
     */
    static getHistorial(piezaId) {
        const movimientos = MovimientoStorage.findByPiezaId(piezaId);
        
        // Ordenar por fecha descendente
        return movimientos.sort((a, b) => 
            new Date(b.fecha_movimiento) - new Date(a.fecha_movimiento)
        ).map(mov => {
            const usuario = UsuarioStorage.findById(mov.usuario_id);
            const proyecto = mov.proyecto_id ? 
                StorageManager.getItem(STORAGE_KEYS.PROYECTOS, []).find(p => p.id === mov.proyecto_id) : null;
            
            return {
                ...mov,
                usuario: usuario ? usuario.nombre : 'Usuario desconocido',
                proyecto: proyecto ? proyecto.nombre : null
            };
        });
    }
    
    /**
     * Valida los datos de una pieza
     * @param {Object} datos - Datos a validar
     * @param {number} idExistente - ID de pieza existente (para actualización)
     * @returns {Object} - { valid: boolean, message?: string }
     */
    static validarDatos(datos, idExistente = null) {
        if (!datos.numero_serie || datos.numero_serie.trim().length < 2) {
            return {
                valid: false,
                message: 'El número de serie debe tener al menos 2 caracteres'
            };
        }
        
        if (!datos.nombre || datos.nombre.trim().length < 3) {
            return {
                valid: false,
                message: 'El nombre debe tener al menos 3 caracteres'
            };
        }
        
        if (!datos.ubicacion || datos.ubicacion.trim().length < 2) {
            return {
                valid: false,
                message: 'La ubicación es requerida'
            };
        }
        
        if (datos.stock_minimo !== undefined && (Number.isNaN(datos.stock_minimo) || datos.stock_minimo < 0)) {
            return {
                valid: false,
                message: 'El stock mínimo debe ser un número mayor o igual a 0'
            };
        }
        
        if (datos.stock_actual !== undefined && (Number.isNaN(datos.stock_actual) || datos.stock_actual < 0)) {
            return {
                valid: false,
                message: 'El stock actual debe ser un número mayor o igual a 0'
            };
        }
        
        if (datos.precio_unitario !== undefined && (Number.isNaN(datos.precio_unitario) || datos.precio_unitario < 0)) {
            return {
                valid: false,
                message: 'El precio debe ser un número mayor o igual a 0'
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Verifica si una pieza tiene stock bajo y crea notificación
     * @param {Object} pieza - Pieza a verificar
     */
    static verificarStockBajo(pieza) {
        
        const estado = obtenerEstadoStock(pieza.stock_actual, pieza.stock_minimo);
        
        // Solo crear notificación para compradores
        const compradores = UsuarioStorage.getAll().filter(u => u.rol === ROLES.COMPRADOR);
        
        if (estado === 'critico') {
            for (const comprador of compradores) {
                NotificacionStorage.create({
                    usuario_id: comprador.id,
                    tipo_notificacion: TIPOS_NOTIFICACION.STOCK_CRITICO,
                    titulo: 'Stock Crítico',
                    mensaje: `La pieza "${pieza.nombre}" (${pieza.numero_serie}) tiene stock crítico: ${pieza.stock_actual} unidades (mínimo: ${pieza.stock_minimo})`,
                    datos_adicionales: JSON.stringify({ pieza_id: pieza.id })
                });
            }
        } else if (estado === 'bajo') {
            for (const comprador of compradores) {
                NotificacionStorage.create({
                    usuario_id: comprador.id,
                    tipo_notificacion: TIPOS_NOTIFICACION.STOCK_BAJO,
                    titulo: 'Stock Bajo',
                    mensaje: `La pieza "${pieza.nombre}" (${pieza.numero_serie}) tiene stock bajo: ${pieza.stock_actual} unidades (mínimo: ${pieza.stock_minimo})`,
                    datos_adicionales: JSON.stringify({ pieza_id: pieza.id })
                });
            }
        }
    }
    
    /**
     * Obtiene estadísticas del inventario
     * @returns {Object}
     */
    static getEstadisticas() {
        const piezas = this.getAll({ activo: true });
        const stockBajo = PiezaStorage.getStockBajo();
        const stockCritico = PiezaStorage.getStockCritico();
        
        const valorTotal = piezas.reduce((sum, p) => sum + (p.stock_actual * p.precio_unitario), 0);
        const totalUnidades = piezas.reduce((sum, p) => sum + p.stock_actual, 0);
        
        return {
            totalPiezas: piezas.length,
            totalUnidades,
            valorTotal,
            stockBajo: stockBajo.length,
            stockCritico: stockCritico.length,
            piezasActivas: piezas.filter(p => p.activo).length,
            piezasInactivas: piezas.filter(p => !p.activo).length
        };
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InventarioService;
}