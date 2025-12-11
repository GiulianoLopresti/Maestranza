// ============================================
// STORAGE MANAGER - Manejo de LocalStorage
// Maestranza Unidos S.A.
// ============================================

/**
 * Clase para gestionar el almacenamiento en LocalStorage
 * Proporciona métodos para CRUD de datos con validación y manejo de errores
 */
class StorageManager {
    
    /**
     * Guarda un item en localStorage
     * @param {string} key - Clave del item
     * @param {*} value - Valor a guardar (será convertido a JSON)
     * @returns {boolean} - true si se guardó exitosamente
     */
    static setItem(key, value) {
        try {
            const jsonValue = JSON.stringify(value);
            localStorage.setItem(key, jsonValue);
            return true;
        } catch (error) {
            console.error(`Error al guardar en localStorage [${key}]:`, error);
            return false;
        }
    }
    
    /**
     * Obtiene un item de localStorage
     * @param {string} key - Clave del item
     * @param {*} defaultValue - Valor por defecto si no existe
     * @returns {*} - Valor parseado o defaultValue
     */
    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error al leer de localStorage [${key}]:`, error);
            return defaultValue;
        }
    }
    
    /**
     * Elimina un item de localStorage
     * @param {string} key - Clave del item
     * @returns {boolean} - true si se eliminó exitosamente
     */
    static removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error al eliminar de localStorage [${key}]:`, error);
            return false;
        }
    }
    
    /**
     * Limpia todo el localStorage
     * @returns {boolean} - true si se limpió exitosamente
     */
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error al limpiar localStorage:', error);
            return false;
        }
    }
    
    /**
     * Verifica si existe una clave en localStorage
     * @param {string} key - Clave a verificar
     * @returns {boolean}
     */
    static exists(key) {
        return localStorage.getItem(key) !== null;
    }
    
    /**
     * Obtiene todas las claves almacenadas
     * @returns {string[]} - Array con todas las claves
     */
    static getAllKeys() {
        return Object.keys(localStorage);
    }
    
    /**
     * Obtiene el tamaño aproximado del localStorage en bytes
     * @returns {number} - Tamaño en bytes
     */
    static getSize() {
        let size = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                size += localStorage[key].length + key.length;
            }
        }
        return size;
    }
    
    /**
     * Obtiene el tamaño en formato legible (KB, MB)
     * @returns {string}
     */
    static getSizeFormatted() {
        const bytes = this.getSize();
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}

// ============================================
// FUNCIONES ESPECÍFICAS PARA EL SISTEMA
// ============================================

/**
 * Clase para gestionar usuarios en localStorage
 */
class UsuarioStorage {
    
    static getAll() {
        return StorageManager.getItem(STORAGE_KEYS.USUARIOS, []);
    }
    
    static save(usuarios) {
        return StorageManager.setItem(STORAGE_KEYS.USUARIOS, usuarios);
    }
    
    static findById(id) {
        const usuarios = this.getAll();
        return usuarios.find(u => u.id === Number.parseInt(id));
    }
    
    static findByUsername(username) {
        const usuarios = this.getAll();
        return usuarios.find(u => u.username === username);
    }
    
    static findByEmail(email) {
        const usuarios = this.getAll();
        return usuarios.find(u => u.email === email);
    }
    
    static create(usuario) {
        const usuarios = this.getAll();
        const newId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
        const newUsuario = {
            id: newId,
            ...usuario,
            activo: true,
            creado_en: new Date().toISOString(),
            actualizado_en: new Date().toISOString()
        };
        usuarios.push(newUsuario);
        this.save(usuarios);
        return newUsuario;
    }
    
    static update(id, data) {
        const usuarios = this.getAll();
        const index = usuarios.findIndex(u => u.id === Number.parseInt(id));
        if (index !== -1) {
            usuarios[index] = {
                ...usuarios[index],
                ...data,
                actualizado_en: new Date().toISOString()
            };
            this.save(usuarios);
            return usuarios[index];
        }
        return null;
    }
    
    static delete(id) {
        const usuarios = this.getAll();
        const filtered = usuarios.filter(u => u.id !== Number.parseInt(id));
        this.save(filtered);
        return filtered.length < usuarios.length;
    }
}

/**
 * Clase para gestionar piezas en localStorage
 */
class PiezaStorage {
    
    static getAll() {
        return StorageManager.getItem(STORAGE_KEYS.PIEZAS, []);
    }
    
    static save(piezas) {
        return StorageManager.setItem(STORAGE_KEYS.PIEZAS, piezas);
    }
    
    static findById(id) {
        const piezas = this.getAll();
        return piezas.find(p => p.id === Number.parseInt(id));
    }
    
    static findByNumeroSerie(numeroSerie) {
        const piezas = this.getAll();
        return piezas.find(p => p.numero_serie === numeroSerie);
    }
    
    static create(pieza) {
        const piezas = this.getAll();
        const newId = piezas.length > 0 ? Math.max(...piezas.map(p => p.id)) + 1 : 1;
        const newPieza = {
            id: newId,
            ...pieza,
            activo: true,
            creado_en: new Date().toISOString(),
            actualizado_en: new Date().toISOString()
        };
        piezas.push(newPieza);
        this.save(piezas);
        return newPieza;
    }
    
    static update(id, data) {
        const piezas = this.getAll();
        const index = piezas.findIndex(p => p.id === Number.parseInt(id));
        if (index !== -1) {
            piezas[index] = {
                ...piezas[index],
                ...data,
                actualizado_en: new Date().toISOString()
            };
            this.save(piezas);
            return piezas[index];
        }
        return null;
    }
    
    static delete(id) {
        const piezas = this.getAll();
        const filtered = piezas.filter(p => p.id !== Number.parseInt(id));
        this.save(filtered);
        return filtered.length < piezas.length;
    }
    
    static getStockBajo() {
        const piezas = this.getAll();
        return piezas.filter(p => {
            const porcentaje = (p.stock_actual / p.stock_minimo) * 100;
            return porcentaje <= CONFIG.STOCK.LOW_THRESHOLD_PERCENTAGE;
        });
    }
    
    static getStockCritico() {
        const piezas = this.getAll();
        return piezas.filter(p => {
            const porcentaje = (p.stock_actual / p.stock_minimo) * 100;
            return porcentaje <= CONFIG.STOCK.CRITICAL_THRESHOLD_PERCENTAGE;
        });
    }
}

/**
 * Clase para gestionar movimientos en localStorage
 */
class MovimientoStorage {
    
    static getAll() {
        return StorageManager.getItem(STORAGE_KEYS.MOVIMIENTOS, []);
    }
    
    static save(movimientos) {
        return StorageManager.setItem(STORAGE_KEYS.MOVIMIENTOS, movimientos);
    }
    
    static findById(id) {
        const movimientos = this.getAll();
        return movimientos.find(m => m.id === Number.parseInt(id));
    }
    
    static findByPiezaId(piezaId) {
        const movimientos = this.getAll();
        return movimientos.filter(m => m.pieza_id === Number.parseInt(piezaId));
    }
    
    static create(movimiento) {
        const movimientos = this.getAll();
        const newId = movimientos.length > 0 ? Math.max(...movimientos.map(m => m.id)) + 1 : 1;
        const newMovimiento = {
            id: newId,
            ...movimiento,
            fecha_movimiento: movimiento.fecha_movimiento || new Date().toISOString()
        };
        movimientos.push(newMovimiento);
        this.save(movimientos);
        return newMovimiento;
    }
}

/**
 * Clase para gestionar solicitudes en localStorage
 */
class SolicitudStorage {
    
    static getAll() {
        return StorageManager.getItem(STORAGE_KEYS.SOLICITUDES, []);
    }
    
    static save(solicitudes) {
        return StorageManager.setItem(STORAGE_KEYS.SOLICITUDES, solicitudes);
    }
    
    static findById(id) {
        const solicitudes = this.getAll();
        return solicitudes.find(s => s.id === Number.parseInt(id));
    }
    
    static findByUsuarioId(usuarioId) {
        const solicitudes = this.getAll();
        return solicitudes.filter(s => s.usuario_solicitante_id === Number.parseInt(usuarioId));
    }
    
    static create(solicitud) {
        const solicitudes = this.getAll();
        const newId = solicitudes.length > 0 ? Math.max(...solicitudes.map(s => s.id)) + 1 : 1;
        const newSolicitud = {
            id: newId,
            ...solicitud,
            estado: solicitud.estado || ESTADOS_SOLICITUD.PENDIENTE,
            fecha_solicitud: solicitud.fecha_solicitud || new Date().toISOString(),
            creado_en: new Date().toISOString(),
            actualizado_en: new Date().toISOString()
        };
        solicitudes.push(newSolicitud);
        this.save(solicitudes);
        return newSolicitud;
    }
    
    static update(id, data) {
        const solicitudes = this.getAll();
        const index = solicitudes.findIndex(s => s.id === Number.parseInt(id));
        if (index !== -1) {
            solicitudes[index] = {
                ...solicitudes[index],
                ...data,
                actualizado_en: new Date().toISOString()
            };
            this.save(solicitudes);
            return solicitudes[index];
        }
        return null;
    }
}

/**
 * Clase para gestionar notificaciones en localStorage
 */
class NotificacionStorage {
    
    static getAll() {
        return StorageManager.getItem(STORAGE_KEYS.NOTIFICACIONES, []);
    }
    
    static save(notificaciones) {
        return StorageManager.setItem(STORAGE_KEYS.NOTIFICACIONES, notificaciones);
    }
    
    static findById(id) {
        const notificaciones = this.getAll();
        return notificaciones.find(n => n.id === Number.parseInt(id));
    }
    
    static findByUsuarioId(usuarioId) {
        const notificaciones = this.getAll();
        return notificaciones.filter(n => n.usuario_id === Number.parseInt(usuarioId));
    }
    
    static getNoLeidas(usuarioId) {
        const notificaciones = this.findByUsuarioId(usuarioId);
        return notificaciones.filter(n => !n.leida);
    }
    
    static create(notificacion) {
        const notificaciones = this.getAll();
        const newId = notificaciones.length > 0 ? Math.max(...notificaciones.map(n => n.id)) + 1 : 1;
        const newNotificacion = {
            id: newId,
            ...notificacion,
            leida: false,
            creado_en: new Date().toISOString()
        };
        notificaciones.push(newNotificacion);
        this.save(notificaciones);
        return newNotificacion;
    }
    
    static marcarComoLeida(id) {
        const notificaciones = this.getAll();
        const index = notificaciones.findIndex(n => n.id === Number.parseInt(id));
        if (index !== -1) {
            notificaciones[index].leida = true;
            this.save(notificaciones);
            return notificaciones[index];
        }
        return null;
    }
    
    static marcarTodasComoLeidas(usuarioId) {
        const notificaciones = this.getAll();
        let updated = false;
        for (const n of notificaciones) {
            if (n.usuario_id === Number.parseInt(usuarioId) && !n.leida) {
                n.leida = true;
                updated = true;
            }
        }
        if (updated) {
            this.save(notificaciones);
        }
        return updated;
    }
}

/**
 * Clase para gestionar categorías en localStorage
 */
class CategoriaStorage {
    
    static getAll() {
        return StorageManager.getItem(STORAGE_KEYS.CATEGORIAS, []);
    }
    
    static save(categorias) {
        return StorageManager.setItem(STORAGE_KEYS.CATEGORIAS, categorias);
    }
    
    static findById(id) {
        const categorias = this.getAll();
        return categorias.find(c => c.id === Number.parseInt(id));
    }
    
    static create(categoria) {
        const categorias = this.getAll();
        const newId = categorias.length > 0 ? Math.max(...categorias.map(c => c.id)) + 1 : 1;
        const newCategoria = {
            id: newId,
            ...categoria,
            creado_en: new Date().toISOString()
        };
        categorias.push(newCategoria);
        this.save(categorias);
        return newCategoria;
    }
}

// ============================================
// EXPORTAR (para compatibilidad futura)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StorageManager,
        UsuarioStorage,
        PiezaStorage,
        MovimientoStorage,
        SolicitudStorage,
        NotificacionStorage,
        CategoriaStorage
    };
}