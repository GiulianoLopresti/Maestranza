class Usuario {
    constructor(data = {}) {
        this.id = data.id || null;
        this.username = data.username || '';
        this.nombre = data.nombre || '';
        this.email = data.email || '';
        this.rol = data.rol || '';
        this.activo = data.activo === undefined ? true : data.activo;
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            nombre: this.nombre,
            email: this.email,
            rol: this.rol,
            activo: this.activo
        };
    }
}