class Movimiento {
    constructor(data = {}) {
        this.id = data.id || null;
        this.pieza_id = data.pieza_id || null;
        this.tipo_movimiento = data.tipo_movimiento || 'Entrada'; // Entrada, Salida, Transferencia
        this.cantidad = data.cantidad || 0;
        this.ubicacion_origen = data.ubicacion_origen || '';
        this.ubicacion_destino = data.ubicacion_destino || '';
        this.usuario_id = data.usuario_id || null;
        this.proyecto_id = data.proyecto_id || null;
        this.observaciones = data.observaciones || '';
        this.fecha_movimiento = data.fecha_movimiento || new Date().toISOString();
    }

    toJSON() {
        return {
            id: this.id,
            pieza_id: this.pieza_id,
            tipo_movimiento: this.tipo_movimiento,
            cantidad: this.cantidad,
            ubicacion_origen: this.ubicacion_origen,
            ubicacion_destino: this.ubicacion_destino,
            usuario_id: this.usuario_id,
            proyecto_id: this.proyecto_id,
            observaciones: this.observaciones,
            fecha_movimiento: this.fecha_movimiento
        };
    }
}