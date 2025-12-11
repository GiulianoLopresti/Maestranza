// ============================================
// SERVICIO DE REPORTES
// Maestranza Unidos S.A.
// ============================================

/**
 * Servicio para generar reportes del sistema
 * HU #11, #13, #14
 */
class ReporteService {
    
    /**
     * Genera reporte de inventario general
     * @param {Object} opciones - Opciones del reporte
     * @returns {Object}
     */
    static generarInventarioGeneral(opciones = {}) {
        const piezas = PiezaStorage.getAll();
        const activas = piezas.filter(p => p.activo);
        
        const reporte = {
            tipo: TIPOS_REPORTE.INVENTARIO_GENERAL,
            fecha_generacion: new Date().toISOString(),
            filtros: opciones,
            resumen: {
                total_piezas: activas.length,
                valor_total: activas.reduce((sum, p) => sum + (p.stock_actual * p.precio_unitario), 0),
                total_unidades: activas.reduce((sum, p) => sum + p.stock_actual, 0)
            },
            datos: activas.map(p => ({
                numero_serie: p.numero_serie,
                nombre: p.nombre,
                stock_actual: p.stock_actual,
                stock_minimo: p.stock_minimo,
                ubicacion: p.ubicacion,
                precio_unitario: p.precio_unitario,
                valor_total: p.stock_actual * p.precio_unitario,
                unidad_medida: p.unidad_medida,
                estado_stock: obtenerEstadoStock(p.stock_actual, p.stock_minimo)
            }))
        };
        
        return reporte;
    }
    
    /**
     * Genera reporte de stock bajo mínimo
     * @returns {Object}
     */
    static generarStockBajo() {
        const stockBajo = PiezaStorage.getStockBajo();
        const stockCritico = PiezaStorage.getStockCritico();
        
        const reporte = {
            tipo: TIPOS_REPORTE.STOCK_BAJO,
            fecha_generacion: new Date().toISOString(),
            resumen: {
                total_bajo: stockBajo.length,
                total_critico: stockCritico.length,
                porcentaje: ((stockBajo.length / PiezaStorage.getAll().length) * 100).toFixed(2)
            },
            datos: stockBajo.map(p => ({
                numero_serie: p.numero_serie,
                nombre: p.nombre,
                stock_actual: p.stock_actual,
                stock_minimo: p.stock_minimo,
                porcentaje: calcularPorcentajeStock(p.stock_actual, p.stock_minimo),
                ubicacion: p.ubicacion,
                proveedor_id: p.proveedor_id,
                criticidad: obtenerEstadoStock(p.stock_actual, p.stock_minimo)
            })).sort((a, b) => a.porcentaje - b.porcentaje)
        };
        
        return reporte;
    }
    
    /**
     * Genera reporte de movimientos
     * HU #13 (parte de movimientos generales)
     * @param {Object} filtros - Filtros para el reporte
     * @returns {Object}
     */
    static generarMovimientos(filtros = {}) {
        const movimientos = MovimientoService.getAll(filtros);
        
        const porTipo = {};
        for (const tipo of Object.values(TIPOS_MOVIMIENTO)) {
            porTipo[tipo] = movimientos.filter(m => m.tipo_movimiento === tipo).length;
        }
        
        const reporte = {
            tipo: TIPOS_REPORTE.MOVIMIENTOS,
            fecha_generacion: new Date().toISOString(),
            filtros: filtros,
            resumen: {
                total_movimientos: movimientos.length,
                por_tipo: porTipo,
                cantidad_total: movimientos.reduce((sum, m) => sum + m.cantidad, 0)
            },
            datos: movimientos.map(m => {
                const pieza = PiezaStorage.findById(m.pieza_id);
                const usuario = UsuarioStorage.findById(m.usuario_id);
                return {
                    fecha: m.fecha_movimiento,
                    tipo: m.tipo_movimiento,
                    pieza: pieza ? pieza.nombre : 'Desconocida',
                    cantidad: m.cantidad,
                    usuario: usuario ? usuario.nombre : 'Desconocido',
                    ubicacion_origen: m.ubicacion_origen,
                    ubicacion_destino: m.ubicacion_destino
                };
            })
        };
        
        return reporte;
    }
    
    /**
     * Genera reporte de consumo por proyecto
     * HU #13 - Generar informe de uso de inventario para proyecto
     * @param {number} proyectoId - ID del proyecto
     * @param {Object} opciones - Opciones adicionales
     * @returns {Object}
     */
    static generarPorProyecto(proyectoId, opciones = {}) {
        const proyecto = StorageManager.getItem(STORAGE_KEYS.PROYECTOS, []).find(p => p.id === proyectoId);
        
        if (!proyecto) {
            return {
                error: true,
                message: 'Proyecto no encontrado'
            };
        }
        
        const movimientos = MovimientoStorage.getAll().filter(m => m.proyecto_id === proyectoId);
        
        // Agrupar por pieza
        const consumoPorPieza = {};
        let costoTotal = 0;
        
        for (const mov of movimientos) {
            const pieza = PiezaStorage.findById(mov.pieza_id);
            if (!pieza) continue;
            
            if (!consumoPorPieza[pieza.id]) {
                consumoPorPieza[pieza.id] = {
                    pieza: pieza.nombre,
                    numero_serie: pieza.numero_serie,
                    cantidad_total: 0,
                    precio_unitario: pieza.precio_unitario,
                    costo_total: 0,
                    movimientos: []
                };
            }
            
            const cantidad = mov.tipo_movimiento === TIPOS_MOVIMIENTO.SALIDA ? mov.cantidad : 0;
            consumoPorPieza[pieza.id].cantidad_total += cantidad;
            consumoPorPieza[pieza.id].costo_total += cantidad * pieza.precio_unitario;
            costoTotal += cantidad * pieza.precio_unitario;
            
            consumoPorPieza[pieza.id].movimientos.push({
                fecha: mov.fecha_movimiento,
                tipo: mov.tipo_movimiento,
                cantidad: mov.cantidad
            });
        }
        
        const reporte = {
            tipo: TIPOS_REPORTE.POR_PROYECTO,
            fecha_generacion: new Date().toISOString(),
            proyecto: {
                id: proyecto.id,
                codigo: proyecto.codigo,
                nombre: proyecto.nombre,
                fecha_inicio: proyecto.fecha_inicio,
                fecha_fin_estimada: proyecto.fecha_fin_estimada,
                estado: proyecto.estado
            },
            periodo: opciones.fechaInicio && opciones.fechaFin ? {
                inicio: opciones.fechaInicio,
                fin: opciones.fechaFin
            } : null,
            resumen: {
                total_movimientos: movimientos.length,
                piezas_diferentes: Object.keys(consumoPorPieza).length,
                costo_total: costoTotal
            },
            consumo_por_pieza: Object.values(consumoPorPieza).sort((a, b) => b.costo_total - a.costo_total)
        };
        
        return reporte;
    }
    
    /**
     * Genera reporte de actividad de usuarios
     * HU #14 - Reporte de actividad
     * @param {Object} filtros - Filtros para el reporte
     * @returns {Object}
     */
    static generarActividadUsuarios(filtros = {}) {
        const movimientos = MovimientoStorage.getAll();
        const solicitudes = SolicitudStorage.getAll();
        
        // Actividad por usuario
        const actividadPorUsuario = {};
        
        // Procesar movimientos
        for (const mov of movimientos) {
            const usuario = UsuarioStorage.findById(mov.usuario_id);
            if (!usuario) continue;
            
            if (!actividadPorUsuario[usuario.id]) {
                actividadPorUsuario[usuario.id] = {
                    usuario: usuario.nombre,
                    rol: usuario.rol,
                    movimientos: 0,
                    solicitudes: 0,
                    ultima_actividad: null
                };
            }
            
            actividadPorUsuario[usuario.id].movimientos++;
            
            const fechaMov = new Date(mov.fecha_movimiento);
            if (!actividadPorUsuario[usuario.id].ultima_actividad || 
                fechaMov > new Date(actividadPorUsuario[usuario.id].ultima_actividad)) {
                actividadPorUsuario[usuario.id].ultima_actividad = mov.fecha_movimiento;
            }
        }
        
        // Procesar solicitudes
        for (const sol of solicitudes) {
            const usuario = UsuarioStorage.findById(sol.usuario_solicitante_id);
            if (!usuario) continue;
            
            if (!actividadPorUsuario[usuario.id]) {
                actividadPorUsuario[usuario.id] = {
                    usuario: usuario.nombre,
                    rol: usuario.rol,
                    movimientos: 0,
                    solicitudes: 0,
                    ultima_actividad: null
                };
            }
            
            actividadPorUsuario[usuario.id].solicitudes++;
            
            const fechaSol = new Date(sol.fecha_solicitud);
            if (!actividadPorUsuario[usuario.id].ultima_actividad || 
                fechaSol > new Date(actividadPorUsuario[usuario.id].ultima_actividad)) {
                actividadPorUsuario[usuario.id].ultima_actividad = sol.fecha_solicitud;
            }
        }
        
        // Actividad por hora del día
        const actividadPorHora = Array(24).fill(0);
        for (const mov of movimientos) {
            const hora = new Date(mov.fecha_movimiento).getHours();
            actividadPorHora[hora]++;
        }
        
        const reporte = {
            tipo: TIPOS_REPORTE.ACTIVIDAD_USUARIOS,
            fecha_generacion: new Date().toISOString(),
            filtros: filtros,
            resumen: {
                usuarios_activos: Object.keys(actividadPorUsuario).length,
                total_movimientos: movimientos.length,
                total_solicitudes: solicitudes.length,
                horas_pico: this.getHorasPico(actividadPorHora)
            },
            actividad_por_usuario: Object.values(actividadPorUsuario)
                .sort((a, b) => (b.movimientos + b.solicitudes) - (a.movimientos + a.solicitudes)),
            actividad_por_hora: actividadPorHora.map((count, hora) => ({
                hora: `${hora}:00`,
                transacciones: count
            })),
            actividad_por_rol: this.calcularActividadPorRol(actividadPorUsuario)
        };
        
        return reporte;
    }
    
    /**
     * Genera reporte de inventario valorizado
     * @returns {Object}
     */
    static generarInventarioValorizado() {
        const piezas = PiezaStorage.getAll().filter(p => p.activo);
        const categorias = CategoriaStorage.getAll();
        
        // Agrupar por categoría
        const porCategoria = {};
        let valorTotalGeneral = 0;
        
        for (const pieza of piezas) {
            const valorPieza = pieza.stock_actual * pieza.precio_unitario;
            valorTotalGeneral += valorPieza;
            
            const categoriaspieza = InventarioService.getCategoriasDepieza(pieza.id);
            
            if (categoriaspieza.length === 0) {
                if (!porCategoria['Sin Categoría']) {
                    porCategoria['Sin Categoría'] = {
                        nombre: 'Sin Categoría',
                        piezas: 0,
                        valor_total: 0
                    };
                }
                porCategoria['Sin Categoría'].piezas++;
                porCategoria['Sin Categoría'].valor_total += valorPieza;
            } else {
                for (const cat of categoriaspieza) {
                    if (!porCategoria[cat.nombre]) {
                        porCategoria[cat.nombre] = {
                            nombre: cat.nombre,
                            piezas: 0,
                            valor_total: 0
                        };
                    }
                    porCategoria[cat.nombre].piezas++;
                    porCategoria[cat.nombre].valor_total += valorPieza;
                }
            }
        }
        
        const reporte = {
            tipo: TIPOS_REPORTE.VALORIZADO,
            fecha_generacion: new Date().toISOString(),
            resumen: {
                valor_total: valorTotalGeneral,
                total_piezas: piezas.length,
                total_unidades: piezas.reduce((sum, p) => sum + p.stock_actual, 0)
            },
            por_categoria: Object.values(porCategoria)
                .sort((a, b) => b.valor_total - a.valor_total)
                .map(cat => ({
                    ...cat,
                    porcentaje: ((cat.valor_total / valorTotalGeneral) * 100).toFixed(2)
                })),
            top_10_mas_valiosos: piezas
                .map(p => ({
                    nombre: p.nombre,
                    numero_serie: p.numero_serie,
                    stock: p.stock_actual,
                    precio_unitario: p.precio_unitario,
                    valor_total: p.stock_actual * p.precio_unitario
                }))
                .sort((a, b) => b.valor_total - a.valor_total)
                .slice(0, 10)
        };
        
        return reporte;
    }
    
    /**
     * Programa un reporte automático
     * HU #11 - Programar reportes automáticos
     * @param {Object} configuracion - Configuración del reporte
     * @returns {Object}
     */
    static programarReporte(configuracion) {
        try {
            const reportes = StorageManager.getItem(STORAGE_KEYS.REPORTES_PROGRAMADOS, []);
            const maxId = reportes.length > 0 ? Math.max(...reportes.map(r => r.id)) : 0;
            
            const currentUser = AuthService.getCurrentUser();
            
            const nuevoReporte = {
                id: maxId + 1,
                tipo: configuracion.tipo,
                frecuencia: configuracion.frecuencia,
                destinatarios: configuracion.destinatarios,
                filtros: configuracion.filtros || {},
                activo: true,
                creado_por: currentUser.id,
                creado_en: new Date().toISOString(),
                proxima_ejecucion: this.calcularProximaEjecucion(configuracion.frecuencia)
            };
            
            reportes.push(nuevoReporte);
            StorageManager.setItem(STORAGE_KEYS.REPORTES_PROGRAMADOS, reportes);
            
            return {
                success: true,
                reporte: nuevoReporte,
                message: 'Reporte programado correctamente'
            };
            
        } catch (error) {
            console.error('Error al programar reporte:', error);
            return {
                success: false,
                message: 'Error al programar el reporte'
            };
        }
    }
    
    /**
     * Obtiene reportes programados
     * @returns {Array}
     */
    static getReportesProgramados() {
        return StorageManager.getItem(STORAGE_KEYS.REPORTES_PROGRAMADOS, []);
    }
    
    /**
     * Exporta un reporte a CSV
     * @param {Object} reporte - Reporte a exportar
     * @returns {string} - CSV string
     */
    static exportarCSV(reporte) {
        let csv = '';
        
        // Header con información del reporte
        csv += `Tipo de Reporte,${reporte.tipo}\n`;
        csv += `Fecha de Generación,${formatearFechaHora(reporte.fecha_generacion)}\n`;
        csv += '\n';
        
        // Resumen
        if (reporte.resumen) {
            csv += 'RESUMEN\n';
            for (const [key, value] of Object.entries(reporte.resumen)) {
                csv += `${key},${value}\n`;
            }
            csv += '\n';
        }
        
        // Datos principales
        if (reporte.datos && Array.isArray(reporte.datos)) {
            if (reporte.datos.length > 0) {
                const headers = Object.keys(reporte.datos[0]);
                csv += headers.join(',') + '\n';
                
                for (const row of reporte.datos) {
                    const values = headers.map(h => `"${row[h] || ''}"`);
                    csv += values.join(',') + '\n';
                }
            }
        }
        
        return csv;
    }
    
    /**
     * Calcula la próxima ejecución según frecuencia
     * @param {string} frecuencia - Frecuencia del reporte
     * @returns {string}
     */
    static calcularProximaEjecucion(frecuencia) {
        const ahora = new Date();
        
        switch (frecuencia) {
            case FRECUENCIAS_REPORTE.DIARIO:
                ahora.setDate(ahora.getDate() + 1);
                break;
            case FRECUENCIAS_REPORTE.SEMANAL:
                ahora.setDate(ahora.getDate() + 7);
                break;
            case FRECUENCIAS_REPORTE.QUINCENAL:
                ahora.setDate(ahora.getDate() + 15);
                break;
            case FRECUENCIAS_REPORTE.MENSUAL:
                ahora.setMonth(ahora.getMonth() + 1);
                break;
            case FRECUENCIAS_REPORTE.TRIMESTRAL:
                ahora.setMonth(ahora.getMonth() + 3);
                break;
        }
        
        return ahora.toISOString();
    }
    
    /**
     * Obtiene las horas pico de actividad
     * @param {Array} actividadPorHora - Array con actividad por hora
     * @returns {Array}
     */
    static getHorasPico(actividadPorHora) {
        const maxActividad = Math.max(...actividadPorHora);
        const horasPico = [];
        
        for (let i = 0; i < actividadPorHora.length; i++) {
            if (actividadPorHora[i] === maxActividad && maxActividad > 0) {
                horasPico.push(`${i}:00`);
            }
        }
        
        return horasPico;
    }
    
    /**
     * Calcula actividad por rol
     * @param {Object} actividadPorUsuario - Actividad por usuario
     * @returns {Object}
     */
    static calcularActividadPorRol(actividadPorUsuario) {
        const porRol = {};
        
        for (const actividad of Object.values(actividadPorUsuario)) {
            if (!porRol[actividad.rol]) {
                porRol[actividad.rol] = {
                    rol: actividad.rol,
                    usuarios: 0,
                    movimientos: 0,
                    solicitudes: 0
                };
            }
            
            porRol[actividad.rol].usuarios++;
            porRol[actividad.rol].movimientos += actividad.movimientos;
            porRol[actividad.rol].solicitudes += actividad.solicitudes;
        }
        
        return Object.values(porRol);
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReporteService;
}