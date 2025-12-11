// ============================================
// SERVICIO DE NOTIFICACIONES
// Maestranza Unidos S.A.
// ============================================

/**
 * Servicio para gestionar notificaciones del sistema
 * HU #6 - Notificación cuando artículo llega a stock mínimo
 */
class NotificacionService {
    
    /**
     * Crea una nueva notificación
     * @param {Object} datos - Datos de la notificación
     * @returns {Object}
     */
    static crear(datos) {
        try {
            const nuevaNotificacion = NotificacionStorage.create({
                usuario_id: datos.usuario_id,
                tipo_notificacion: datos.tipo,
                titulo: datos.titulo,
                mensaje: datos.mensaje,
                datos_adicionales: datos.datos_adicionales ? JSON.stringify(datos.datos_adicionales) : null
            });
            
            return {
                success: true,
                notificacion: nuevaNotificacion,
                message: 'Notificación creada'
            };
            
        } catch (error) {
            console.error('Error al crear notificación:', error);
            return {
                success: false,
                message: 'Error al crear la notificación'
            };
        }
    }
    
    /**
     * Obtiene las notificaciones del usuario actual
     * @returns {Array}
     */
    static getMisNotificaciones() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return [];
        
        return NotificacionStorage.findByUsuarioId(currentUser.id);
    }
    
    /**
     * Obtiene las notificaciones no leídas del usuario actual
     * @returns {Array}
     */
    static getNoLeidas() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return [];
        
        return NotificacionStorage.getNoLeidas(currentUser.id);
    }
    
    /**
     * Marca una notificación como leída
     * @param {number} id - ID de la notificación
     * @returns {Object}
     */
    static marcarComoLeida(id) {
        try {
            NotificacionStorage.marcarComoLeida(id);
            return {
                success: true,
                message: 'Notificación marcada como leída'
            };
        } catch (error) {
            console.error('Error al marcar notificación:', error);
            return {
                success: false,
                message: 'Error al marcar la notificación'
            };
        }
    }
    
    /**
     * Marca todas las notificaciones del usuario como leídas
     * @returns {Object}
     */
    static marcarTodasComoLeidas() {
        try {
            const currentUser = AuthService.getCurrentUser();
            if (!currentUser) {
                return {
                    success: false,
                    message: 'Usuario no autenticado'
                };
            }
            
            NotificacionStorage.marcarTodasComoLeidas(currentUser.id);
            return {
                success: true,
                message: 'Todas las notificaciones marcadas como leídas'
            };
        } catch (error) {
            console.error('Error al marcar notificaciones:', error);
            return {
                success: false,
                message: 'Error al marcar las notificaciones'
            };
        }
    }
    
    /**
     * Envía notificación de stock bajo a compradores
     * HU #6 - Notificación por correo cuando stock llega a mínimo
     * @param {Object} pieza - Pieza con stock bajo
     */
    static notificarStockBajo(pieza) {
        const compradores = UsuarioStorage.getAll().filter(u => u.rol === ROLES.COMPRADOR);
        
        for (const comprador of compradores) {
            this.crear({
                usuario_id: comprador.id,
                tipo: TIPOS_NOTIFICACION.STOCK_BAJO,
                titulo: 'Stock Bajo',
                mensaje: `La pieza "${pieza.nombre}" (${pieza.numero_serie}) tiene stock bajo: ${pieza.stock_actual} de ${pieza.stock_minimo}`,
                datos_adicionales: { pieza_id: pieza.id }
            });
        }
    }
    
    /**
     * Envía notificación de stock crítico
     * @param {Object} pieza - Pieza con stock crítico
     */
    static notificarStockCritico(pieza) {
        const compradores = UsuarioStorage.getAll().filter(u => u.rol === ROLES.COMPRADOR);
        
        for (const comprador of compradores) {
            this.crear({
                usuario_id: comprador.id,
                tipo: TIPOS_NOTIFICACION.STOCK_CRITICO,
                titulo: 'Stock Crítico',
                mensaje: `¡URGENTE! La pieza "${pieza.nombre}" (${pieza.numero_serie}) tiene stock crítico: ${pieza.stock_actual} de ${pieza.stock_minimo}`,
                datos_adicionales: { pieza_id: pieza.id }
            });
        }
    }
    
    /**
     * Obtiene estadísticas de notificaciones
     * @returns {Object}
     */
    static getEstadisticas() {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return null;
        
        const todas = this.getMisNotificaciones();
        const noLeidas = this.getNoLeidas();
        
        return {
            total: todas.length,
            noLeidas: noLeidas.length,
            leidas: todas.length - noLeidas.length,
            porTipo: {}
        };
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificacionService;
}