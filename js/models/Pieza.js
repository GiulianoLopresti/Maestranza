class Pieza {
    constructor(data = {}) {
        this.id = data.id || null;
        this.numero_serie = data.numero_serie || '';
        this.nombre = data.nombre || '';
        this.descripcion = data.descripcion || '';
        this.ubicacion = data.ubicacion || '';
        this.stock_actual = data.stock_actual || 0;
        this.stock_minimo = data.stock_minimo || 0;
        this.precio_unitario = data.precio_unitario || 0;
        this.unidad_medida = data.unidad_medida || 'Unidad';
        this.proveedor_id = data.proveedor_id || null;
    }

    getEstadoStock() {
        return obtenerEstadoStock(this.stock_actual, this.stock_minimo);
    }
}