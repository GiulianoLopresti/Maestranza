class Notificacion {
    constructor(data = {}) {
        this.id = data.id || null;
        this.usuario_id = data.usuario_id || null;
        this.tipo_notificacion = data.tipo_notificacion || 'Sistema'; // Stock Bajo, Solicitud Lista, etc.
        this.titulo = data.titulo || '';
        this.mensaje = data.mensaje || '';
        this.leida = data.leida || false;
        this.datos_adicionales = data.datos_adicionales || null; // JSON string con ID de referencia
        this.creado_en = data.creado_en || new Date().toISOString();
    }

    marcarLeida() {
        this.leida = true;
    }
}