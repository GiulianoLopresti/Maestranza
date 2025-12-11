// ============================================
// SERVICIO DE SOLICITUDES
// Maestranza Unidos S.A.
// ============================================

/**
 * Servicio para gestionar solicitudes de materiales
 * HU #10 - Ver estado de solicitud
 * HU #12 - Notificación cuando materiales están listos
 * HU #15 - Reportar incidencias
 */
class SolicitudService {
    
    /**
     * Crea una nueva solicitud
     * @param {Object} datos - Datos de la solicitud
     * @returns {Object}
     */
    static crear(datos) {
        try {
            const currentUser = AuthService.getCurrentUser();
            
            // Crear solicitud
            const nuevaSolicitud = SolicitudStorage.create({
                usuario_solicitante_id: currentUser.id,
                proyecto_id: datos.proyecto_id || null,
                estado: ESTADOS_SOLICITUD.PENDIENTE,
                observaciones: datos.observaciones || null,
                fecha_solicitud: new Date().toISOString()
            });
            
            // Crear detalles de la solicitud (items solicitados)
            if (datos.items && Array.isArray(datos.items)) {
                const detalles = StorageManager.getItem(STORAGE_KEYS.SOLICITUDES_DETALLE, []);
                const maxId = detalles.length > 0 ? Math.max(...detalles.map(d => d.id)) : 0;
                
                let index = 0;
                for (const item of datos.items) {
                    detalles.push({
                        id: maxId + index + 1,
                        solicitud_id: nuevaSolicitud.id,
                        pieza_id: item.pieza_id,
                        cantidad_solicitada: item.cantidad,
                        cantidad_entregada: 0,
                        estado: 'Pendiente'
                    });
                    index++;
                }
                
                StorageManager.setItem(STORAGE_KEYS.SOLICITUDES_DETALLE, detalles);
            }
            
            // Notificar a bodegueros
            this.notificarNuevaSolicitud(nuevaSolicitud);
            
            return {
                success: true,
                solicitud: nuevaSolicitud,
                message: 'Solicitud creada exitosamente'
            };
            
        } catch (error) {
            console.error('Error al crear solicitud:', error);
            return {
                success: false,
                message: 'Error al crear la solicitud'
            };
        }
    }
    
    /**
     * Actualiza el estado de una solicitud
     * HU #12 - Notifica cuando materiales están listos
     * @param {number} id - ID de la solicitud
     * @param {string} nuevoEstado - Nuevo estado
     * @returns {Object}
     */
    static actualizarEstado(id, nuevoEstado) {
        try {
            const solicitud = SolicitudStorage.findById(id);
            if (!solicitud) {
                return {
                    success: false,
                    message: 'Solicitud no encontrada'
                };
            }
            
            const actualizada = SolicitudStorage.update(id, {
                estado: nuevoEstado
            });
            
            // Si está lista, notificar al solicitante
            if (nuevoEstado === ESTADOS_SOLICITUD.LISTA) {
                this.notificarSolicitudLista(actualizada);
            }
            
            return {
                success: true,
                solicitud: actualizada,
                message: 'Estado actualizado correctamente'
            };
            
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            return {
                success: false,
                message: 'Error al actualizar el estado'
            };
        }
    }
    
    /**
     * Obtiene todas las solicitudes
     * @param {Object} filtros - Filtros opcionales
     * @returns {Array}
     */
    static getAll(filtros = {}) {
        let solicitudes = SolicitudStorage.getAll();
        
        if (filtros.estado) {
            solicitudes = solicitudes.filter(s => s.estado === filtros.estado);
        }
        
        if (filtros.usuario_id) {
            solicitudes = solicitudes.filter(s => s.usuario_solicitante_id === filtros.usuario_id);
        }
        
        if (filtros.proyecto_id) {
            solicitudes = solicitudes.filter(s => s.proyecto_id === filtros.proyecto_id);
        }
        
        return solicitudes;
    }
    
    /**
     * Obtiene solicitudes del usuario actual
     * HU #10 - Consultar estado de solicitud
     * @returns {Array}
     */
    static getMisSolicitudes() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return [];
        
        return SolicitudStorage.findByUsuarioId(currentUser.id);
    }
    
    /**
     * Obtiene una solicitud con sus detalles
     * @param {number} id - ID de la solicitud
     * @returns {Object|null}
     */
    static getConDetalles(id) {
        const solicitud = SolicitudStorage.findById(id);
        if (!solicitud) return null;
        
        const detalles = StorageManager.getItem(STORAGE_KEYS.SOLICITUDES_DETALLE, []);
        const items = detalles.filter(d => d.solicitud_id === id);
        
        // Enriquecer items con información de piezas
        const itemsEnriquecidos = items.map(item => {
            const pieza = PiezaStorage.findById(item.pieza_id);
            return {
                ...item,
                pieza: pieza
            };
        });
        
        const usuario = UsuarioStorage.findById(solicitud.usuario_solicitante_id);
        const proyecto = solicitud.proyecto_id ? 
            StorageManager.getItem(STORAGE_KEYS.PROYECTOS, []).find(p => p.id === solicitud.proyecto_id) : null;
        
        return {
            ...solicitud,
            items: itemsEnriquecidos,
            usuario: usuario,
            proyecto: proyecto
        };
    }
    
    /**
     * Reporta una incidencia en una solicitud
     * HU #15 - Reportar incidencia
     * @param {number} solicitudId - ID de la solicitud
     * @param {Object} datosIncidencia - Datos de la incidencia
     * @returns {Object}
     */
    static reportarIncidencia(solicitudId, datosIncidencia) {
        try {
            const solicitud = SolicitudStorage.findById(solicitudId);
            if (!solicitud) {
                return {
                    success: false,
                    message: 'Solicitud no encontrada'
                };
            }
            
            // Actualizar estado de la solicitud
            SolicitudStorage.update(solicitudId, {
                estado: ESTADOS_SOLICITUD.CON_INCIDENCIA
            });
            
            // Crear registro de incidencia
            const incidencias = StorageManager.getItem(STORAGE_KEYS.INCIDENCIAS, []);
            const maxId = incidencias.length > 0 ? Math.max(...incidencias.map(i => i.id)) : 0;
            
            const currentUser = AuthService.getCurrentUser();
            
            const nuevaIncidencia = {
                id: maxId + 1,
                solicitud_id: solicitudId,
                tipo: datosIncidencia.tipo,
                descripcion: datosIncidencia.descripcion,
                pieza_id: datosIncidencia.pieza_id || null,
                reportado_por: currentUser.id,
                estado: ESTADOS_INCIDENCIA.REPORTADA,
                fecha_reporte: new Date().toISOString()
            };
            
            incidencias.push(nuevaIncidencia);
            StorageManager.setItem(STORAGE_KEYS.INCIDENCIAS, incidencias);
            
            // Notificar a bodegueros
            this.notificarIncidencia(nuevaIncidencia);
            
            return {
                success: true,
                incidencia: nuevaIncidencia,
                message: 'Incidencia reportada correctamente'
            };
            
        } catch (error) {
            console.error('Error al reportar incidencia:', error);
            return {
                success: false,
                message: 'Error al reportar la incidencia'
            };
        }
    }
    
    /**
     * Notifica a bodegueros sobre nueva solicitud
     * @param {Object} solicitud - Solicitud creada
     */
    static notificarNuevaSolicitud(solicitud) {
        const bodegueros = UsuarioStorage.getAll().filter(u => u.rol === ROLES.BODEGUERO);
        const usuario = UsuarioStorage.findById(solicitud.usuario_solicitante_id);
        
        for (const bodeguero of bodegueros) {
            NotificacionStorage.create({
                usuario_id: bodeguero.id,
                tipo_notificacion: TIPOS_NOTIFICACION.NUEVA_SOLICITUD,
                titulo: 'Nueva Solicitud',
                mensaje: `${usuario ? usuario.nombre : 'Un usuario'} ha creado una nueva solicitud de materiales`,
                datos_adicionales: JSON.stringify({ solicitud_id: solicitud.id })
            });
        }
    }
    
    /**
     * Notifica al solicitante que sus materiales están listos
     * HU #12
     * @param {Object} solicitud - Solicitud lista
     */
    static notificarSolicitudLista(solicitud) {
        NotificacionStorage.create({
            usuario_id: solicitud.usuario_solicitante_id,
            tipo_notificacion: TIPOS_NOTIFICACION.SOLICITUD_LISTA,
            titulo: 'Materiales Listos',
            mensaje: `Tu solicitud #${solicitud.id} está lista para retirar`,
            datos_adicionales: JSON.stringify({ solicitud_id: solicitud.id })
        });
    }
    
    /**
     * Notifica sobre una incidencia
     * @param {Object} incidencia - Incidencia reportada
     */
    static notificarIncidencia(incidencia) {
        const bodegueros = UsuarioStorage.getAll().filter(u => u.rol === ROLES.BODEGUERO);
        
        for (const bodeguero of bodegueros) {
            NotificacionStorage.create({
                usuario_id: bodeguero.id,
                tipo_notificacion: TIPOS_NOTIFICACION.INCIDENCIA,
                titulo: 'Incidencia Reportada',
                mensaje: `Se ha reportado una incidencia en la solicitud #${incidencia.solicitud_id}`,
                datos_adicionales: JSON.stringify({ incidencia_id: incidencia.id })
            });
        }
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolicitudService;
}