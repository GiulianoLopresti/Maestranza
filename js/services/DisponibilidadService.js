// ============================================
// SERVICIO DE DISPONIBILIDAD
// Maestranza Unidos S.A.
// ============================================

/**
 * Servicio para consultar disponibilidad de materiales
 * HU #8 - Consultar disponibilidad
 */
class DisponibilidadService {
    
    /**
     * Verifica la disponibilidad de una lista de materiales
     * HU #8 - Consultar disponibilidad antes de planificar proyecto
     * @param {Array} materiales - Array de {pieza_id, cantidad}
     * @returns {Object}
     */
    static verificarDisponibilidad(materiales) {
        const resultados = [];
        let todoDisponible = true;
        let algunoDisponible = false;
        
        for (const material of materiales) {
            const pieza = PiezaStorage.findById(material.pieza_id);
            
            if (!pieza) {
                resultados.push({
                    pieza_id: material.pieza_id,
                    nombre: 'Pieza no encontrada',
                    cantidad_requerida: material.cantidad,
                    stock_disponible: 0,
                    disponible: false,
                    faltante: material.cantidad,
                    porcentaje_disponible: 0
                });
                todoDisponible = false;
                continue;
            }
            
            const disponible = pieza.stock_actual >= material.cantidad;
            const faltante = disponible ? 0 : material.cantidad - pieza.stock_actual;
            const porcentaje = (pieza.stock_actual / material.cantidad) * 100;
            
            resultados.push({
                pieza_id: pieza.id,
                numero_serie: pieza.numero_serie,
                nombre: pieza.nombre,
                cantidad_requerida: material.cantidad,
                stock_disponible: pieza.stock_actual,
                disponible: disponible,
                faltante: faltante,
                porcentaje_disponible: Math.min(100, porcentaje),
                ubicacion: pieza.ubicacion,
                unidad_medida: pieza.unidad_medida
            });
            
            if (!disponible) {
                todoDisponible = false;
            } else {
                algunoDisponible = true;
            }
        }
        
        return {
            todo_disponible: todoDisponible,
            alguno_disponible: algunoDisponible,
            materiales: resultados,
            resumen: {
                total_items: resultados.length,
                items_disponibles: resultados.filter(r => r.disponible).length,
                items_faltantes: resultados.filter(r => !r.disponible).length
            }
        };
    }
    
    /**
     * Verifica disponibilidad para un proyecto existente
     * @param {number} proyectoId - ID del proyecto
     * @returns {Object}
     */
    static verificarDisponibilidadProyecto(proyectoId) {
        const proyecto = StorageManager.getItem(STORAGE_KEYS.PROYECTOS, []).find(p => p.id === proyectoId);
        
        if (!proyecto) {
            return {
                error: true,
                message: 'Proyecto no encontrado'
            };
        }
        
        // Obtener materiales ya consumidos del proyecto
        const movimientos = MovimientoStorage.getAll().filter(m => 
            m.proyecto_id === proyectoId && m.tipo_movimiento === TIPOS_MOVIMIENTO.SALIDA
        );
        
        const materialesConsumidos = {};
        for (const mov of movimientos) {
            if (!materialesConsumidos[mov.pieza_id]) {
                materialesConsumidos[mov.pieza_id] = 0;
            }
            materialesConsumidos[mov.pieza_id] += mov.cantidad;
        }
        
        return {
            proyecto: {
                id: proyecto.id,
                nombre: proyecto.nombre,
                codigo: proyecto.codigo,
                estado: proyecto.estado
            },
            materiales_consumidos: Object.entries(materialesConsumidos).map(([piezaId, cantidad]) => {
                const pieza = PiezaStorage.findById(parseInt(piezaId));
                return {
                    pieza: pieza ? pieza.nombre : 'Desconocida',
                    cantidad_consumida: cantidad,
                    stock_actual: pieza ? pieza.stock_actual : 0
                };
            })
        };
    }
    
    /**
     * Calcula el tiempo estimado de reposición
     * @param {number} piezaId - ID de la pieza
     * @returns {Object}
     */
    static calcularTiempoReposicion(piezaId) {
        const pieza = PiezaStorage.findById(piezaId);
        
        if (!pieza) {
            return null;
        }
        
        // Obtener movimientos de entrada históricos
        const movimientos = MovimientoStorage.getAll().filter(m => 
            m.pieza_id === piezaId && m.tipo_movimiento === TIPOS_MOVIMIENTO.ENTRADA
        );
        
        if (movimientos.length < 2) {
            return {
                tiene_datos: false,
                mensaje: 'Datos insuficientes para calcular tiempo de reposición'
            };
        }
        
        // Calcular promedio de tiempo entre reposiciones
        const fechas = movimientos.map(m => new Date(m.fecha_movimiento)).sort((a, b) => a - b);
        let sumaDias = 0;
        
        for (let i = 1; i < fechas.length; i++) {
            const diferencia = (fechas[i] - fechas[i - 1]) / (1000 * 60 * 60 * 24);
            sumaDias += diferencia;
        }
        
        const promedioDias = Math.round(sumaDias / (fechas.length - 1));
        
        return {
            tiene_datos: true,
            promedio_dias: promedioDias,
            ultima_reposicion: fechas[fechas.length - 1],
            proxima_reposicion_estimada: new Date(fechas[fechas.length - 1].getTime() + promedioDias * 24 * 60 * 60 * 1000)
        };
    }
    
    /**
     * Obtiene alternativas para materiales no disponibles
     * @param {number} piezaId - ID de la pieza no disponible
     * @returns {Array}
     */
    static obtenerAlternativas(piezaId) {
        const pieza = PiezaStorage.findById(piezaId);
        
        if (!pieza) {
            return [];
        }
        
        // Buscar piezas de las mismas categorías
        const categoriasPieza = InventarioService.getCategoriasDepieza(piezaId);
        const alternativas = [];
        
        for (const categoria of categoriasPieza) {
            const relacionesPiezasCategorias = StorageManager.getItem('piezas_categorias', []);
            const piezasEnCategoria = relacionesPiezasCategorias
                .filter(r => r.categoria_id === categoria.id && r.pieza_id !== piezaId)
                .map(r => r.pieza_id);
            
            for (const id of piezasEnCategoria) {
                const piezaAlternativa = PiezaStorage.findById(id);
                if (piezaAlternativa && piezaAlternativa.activo && piezaAlternativa.stock_actual > 0) {
                    alternativas.push({
                        id: piezaAlternativa.id,
                        numero_serie: piezaAlternativa.numero_serie,
                        nombre: piezaAlternativa.nombre,
                        stock_disponible: piezaAlternativa.stock_actual,
                        ubicacion: piezaAlternativa.ubicacion,
                        categoria_comun: categoria.nombre
                    });
                }
            }
        }
        
        // Eliminar duplicados
        const alternativasUnicas = alternativas.filter((alt, index, self) =>
            index === self.findIndex(t => t.id === alt.id)
        );
        
        return alternativasUnicas;
    }
    
    /**
     * Genera recomendaciones basadas en disponibilidad
     * @param {Object} verificacion - Resultado de verificarDisponibilidad
     * @returns {Array}
     */
    static generarRecomendaciones(verificacion) {
        const recomendaciones = [];
        
        if (verificacion.todo_disponible) {
            recomendaciones.push({
                tipo: 'success',
                mensaje: '✅ Todos los materiales están disponibles. El proyecto puede iniciarse.',
                prioridad: 'baja'
            });
            return recomendaciones;
        }
        
        // Analizar materiales faltantes
        const faltantes = verificacion.materiales.filter(m => !m.disponible);
        
        if (faltantes.length === verificacion.materiales.length) {
            recomendaciones.push({
                tipo: 'danger',
                mensaje: '❌ Ningún material está disponible. Es necesario gestionar la adquisición completa.',
                prioridad: 'alta'
            });
        } else {
            recomendaciones.push({
                tipo: 'warning',
                mensaje: `⚠️ Faltan ${faltantes.length} de ${verificacion.materiales.length} materiales.`,
                prioridad: 'media'
            });
        }
        
        // Recomendar materiales críticos
        const criticos = faltantes.filter(m => m.porcentaje_disponible < 50);
        if (criticos.length > 0) {
            recomendaciones.push({
                tipo: 'danger',
                mensaje: `🔴 ${criticos.length} material(es) tienen disponibilidad crítica (< 50%).`,
                prioridad: 'alta',
                detalles: criticos.map(c => c.nombre)
            });
        }
        
        // Recomendar materiales con stock parcial
        const parciales = faltantes.filter(m => m.porcentaje_disponible >= 50 && m.porcentaje_disponible < 100);
        if (parciales.length > 0) {
            recomendaciones.push({
                tipo: 'info',
                mensaje: `ℹ️ ${parciales.length} material(es) tienen stock parcial. Considera ajustar cantidades o buscar alternativas.`,
                prioridad: 'media',
                detalles: parciales.map(p => `${p.nombre}: ${p.porcentaje_disponible.toFixed(0)}% disponible`)
            });
        }
        
        // Recomendar inicio parcial si es posible
        if (verificacion.alguno_disponible && !verificacion.todo_disponible) {
            const disponibles = verificacion.materiales.filter(m => m.disponible);
            recomendaciones.push({
                tipo: 'success',
                mensaje: `💡 Podrías iniciar parcialmente con ${disponibles.length} material(es) disponible(s) mientras gestionas los faltantes.`,
                prioridad: 'baja'
            });
        }
        
        return recomendaciones.sort((a, b) => {
            const prioridades = { alta: 3, media: 2, baja: 1 };
            return prioridades[b.prioridad] - prioridades[a.prioridad];
        });
    }
    
    /**
     * Calcula el costo estimado de materiales faltantes
     * @param {Array} materialesFaltantes - Materiales que faltan
     * @returns {Object}
     */
    static calcularCostoFaltantes(materialesFaltantes) {
        let costoTotal = 0;
        const desglose = [];
        
        for (const material of materialesFaltantes) {
            const pieza = PiezaStorage.findById(material.pieza_id);
            if (!pieza) continue;
            
            const costo = material.faltante * pieza.precio_unitario;
            costoTotal += costo;
            
            desglose.push({
                pieza: pieza.nombre,
                cantidad_faltante: material.faltante,
                precio_unitario: pieza.precio_unitario,
                costo_total: costo
            });
        }
        
        return {
            costo_total: costoTotal,
            desglose: desglose.sort((a, b) => b.costo_total - a.costo_total)
        };
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DisponibilidadService;
}