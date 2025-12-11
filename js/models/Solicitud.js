class Solicitud {
    constructor(data = {}) {
        this.id = data.id || null;
        this.usuario_solicitante_id = data.usuario_solicitante_id || null;
        this.items = data.items || []; // Array de { pieza_id, cantidad }
        this.estado = data.estado || 'Pendiente';
        this.fecha_solicitud = data.fecha_solicitud || new Date().toISOString();
        this.prioridad = data.prioridad || 'Media';
        this.proyecto_id = data.proyecto_id || null;
    this.comentarios = data.comentarios || '';
}

toJSON() {
        return {
            id: this.id,
            usuario_solicitante_id: this.usuario_solicitante_id,
            items: this.items,
            estado: this.estado,
            fecha_solicitud: this.fecha_solicitud,
            prioridad: this.prioridad,
            proyecto_id: this.proyecto_id,
            comentarios: this.comentarios
        };
    }
}