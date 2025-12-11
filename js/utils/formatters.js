// ============================================
// FORMATEADORES
// Maestranza Unidos S.A.
// ============================================

/**
 * Clase con funciones de formateo para el sistema
 */
class Formatters {
    
    /**
     * Formatea un RUT chileno
     * @param {string} rut - RUT a formatear
     * @returns {string}
     */
    static formatRut(rut) {
        if (!rut) return '';
        
        // Limpiar
        rut = rut.replace(/\./g, '').replace(/-/g, '');
        
        if (rut.length < 2) return rut;
        
        const cuerpo = rut.slice(0, -1);
        const dv = rut.slice(-1);
        
        // Agregar puntos
        let formatted = '';
        let count = 0;
        
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            if (count > 0 && count % 3 === 0) {
                formatted = '.' + formatted;
            }
            formatted = cuerpo[i] + formatted;
            count++;
        }
        
        return `${formatted}-${dv}`;
    }
    
    /**
     * Formatea un teléfono chileno
     * @param {string} phone - Teléfono a formatear
     * @returns {string}
     */
    static formatPhone(phone) {
        if (!phone) return '';
        
        // Limpiar
        const clean = phone.replace(/\D/g, '');
        
        // Si empieza con 56 (código país)
        if (clean.startsWith('56')) {
            if (clean.length === 11) {
                // Celular: +56 9 1234 5678
                return `+56 ${clean.slice(2, 3)} ${clean.slice(3, 7)} ${clean.slice(7)}`;
            } else if (clean.length === 10) {
                // Fijo: +56 52 221 3456
                return `+56 ${clean.slice(2, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
            }
        }
        
        // Sin código país
        if (clean.length === 9) {
            // Celular: 9 1234 5678
            return `${clean.slice(0, 1)} ${clean.slice(1, 5)} ${clean.slice(5)}`;
        } else if (clean.length === 8) {
            // Fijo: 52 221 345
            return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`;
        }
        
        return phone;
    }
    
    /**
     * Formatea bytes a tamaño legible
     * @param {number} bytes - Bytes a formatear
     * @param {number} decimals - Decimales
     * @returns {string}
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    /**
     * Formatea duración en segundos a formato legible
     * @param {number} seconds - Segundos
     * @returns {string}
     */
    static formatDuration(seconds) {
        if (seconds < 60) {
            return `${Math.floor(seconds)}s`;
        } else if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}m ${secs}s`;
        } else if (seconds < 86400) {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${mins}m`;
        } else {
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            return `${days}d ${hours}h`;
        }
    }
    
    /**
     * Formatea un número con separador de miles personalizado
     * @param {number} num - Número a formatear
     * @param {string} separator - Separador (default: '.')
     * @returns {string}
     */
    static formatNumberWithSeparator(num, separator = '.') {
        if (num === null || num === undefined) return '0';
        return Number(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }
    
    /**
     * Formatea un decimal a porcentaje
     * @param {number} decimal - Decimal (0-1)
     * @param {number} decimals - Decimales a mostrar
     * @returns {string}
     */
    static formatPercentage(decimal, decimals = 1) {
        if (decimal === null || decimal === undefined) return '0%';
        return `${(decimal * 100).toFixed(decimals)}%`;
    }
    
    /**
     * Formatea coordenadas
     * @param {number} lat - Latitud
     * @param {number} lng - Longitud
     * @returns {string}
     */
    static formatCoordinates(lat, lng) {
        if (!lat || !lng) return '';
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
    
    /**
     * Formatea nombre de archivo para URL
     * @param {string} filename - Nombre de archivo
     * @returns {string}
     */
    static formatFilename(filename) {
        if (!filename) return '';
        
        return filename
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9.]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }
    
    /**
     * Formatea nombre completo a iniciales
     * @param {string} name - Nombre completo
     * @returns {string}
     */
    static formatInitials(name) {
        if (!name) return '';
        
        const parts = name.trim().split(' ').filter(p => p.length > 0);
        
        if (parts.length === 0) return '';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    
    /**
     * Formatea texto a Title Case
     * @param {string} text - Texto a formatear
     * @returns {string}
     */
    static toTitleCase(text) {
        if (!text) return '';
        
        return text
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    /**
     * Formatea texto a UPPER CASE
     * @param {string} text - Texto a formatear
     * @returns {string}
     */
    static toUpperCase(text) {
        if (!text) return '';
        return text.toUpperCase();
    }
    
    /**
     * Formatea texto a lower case
     * @param {string} text - Texto a formatear
     * @returns {string}
     */
    static toLowerCase(text) {
        if (!text) return '';
        return text.toLowerCase();
    }
    
    /**
     * Formatea número de tarjeta (oculta dígitos del medio)
     * @param {string} cardNumber - Número de tarjeta
     * @returns {string}
     */
    static formatCardNumber(cardNumber) {
        if (!cardNumber) return '';
        
        const clean = cardNumber.replace(/\s/g, '');
        
        if (clean.length < 12) return cardNumber;
        
        const first = clean.substring(0, 4);
        const last = clean.substring(clean.length - 4);
        
        return `${first} **** **** ${last}`;
    }
    
    /**
     * Formatea dirección de manera limpia
     * @param {Object} address - Objeto con datos de dirección
     * @returns {string}
     */
    static formatAddress(address) {
        if (!address) return '';
        
        const parts = [];
        
        if (address.street) parts.push(address.street);
        if (address.number) parts.push(address.number);
        if (address.apartment) parts.push(`Depto. ${address.apartment}`);
        if (address.city) parts.push(address.city);
        if (address.region) parts.push(address.region);
        
        return parts.join(', ');
    }
    
    /**
     * Formatea tiempo relativo en palabras
     * @param {Date|string} date - Fecha
     * @returns {string}
     */
    static formatTimeAgo(date) {
        if (!date) return '';
        
        const now = new Date();
        const then = new Date(date);
        const seconds = Math.floor((now - then) / 1000);
        
        if (seconds < 60) return 'Ahora mismo';
        if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            return `Hace ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
        }
        if (seconds < 86400) {
            const hours = Math.floor(seconds / 3600);
            return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        }
        if (seconds < 604800) {
            const days = Math.floor(seconds / 86400);
            return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
        }
        if (seconds < 2592000) {
            const weeks = Math.floor(seconds / 604800);
            return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
        }
        if (seconds < 31536000) {
            const months = Math.floor(seconds / 2592000);
            return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
        }
        
        const years = Math.floor(seconds / 31536000);
        return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
    }
    
    /**
     * Formatea lista de items con "y" al final
     * @param {string[]} items - Array de items
     * @returns {string}
     */
    static formatList(items) {
        if (!items || items.length === 0) return '';
        if (items.length === 1) return items[0];
        if (items.length === 2) return `${items[0]} y ${items[1]}`;
        
        const last = items[items.length - 1];
        const rest = items.slice(0, -1);
        
        return `${rest.join(', ')} y ${last}`;
    }
    
    /**
     * Formatea rango de fechas
     * @param {Date|string} start - Fecha inicio
     * @param {Date|string} end - Fecha fin
     * @returns {string}
     */
    static formatDateRange(start, end) {
        if (!start || !end) return '';
        
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '';
        
        const startStr = formatearFecha(startDate);
        const endStr = formatearFecha(endDate);
        
        if (startStr === endStr) return startStr;
        
        return `${startStr} - ${endStr}`;
    }
    
    /**
     * Formatea código con prefijo y padding
     * @param {number} num - Número
     * @param {string} prefix - Prefijo (ej: 'INV')
     * @param {number} padding - Cantidad de dígitos
     * @returns {string}
     */
    static formatCode(num, prefix = '', padding = 4) {
        const padded = String(num).padStart(padding, '0');
        return prefix ? `${prefix}-${padded}` : padded;
    }
    
    /**
     * Formatea número de documento chileno (RUT, Pasaporte, etc)
     * @param {string} doc - Documento
     * @param {string} type - Tipo ('rut', 'passport', 'other')
     * @returns {string}
     */
    static formatDocument(doc, type = 'rut') {
        if (!doc) return '';
        
        switch (type.toLowerCase()) {
            case 'rut':
                return this.formatRut(doc);
            case 'passport':
                return doc.toUpperCase();
            default:
                return doc;
        }
    }
    
    /**
     * Formatea stock con unidad de medida
     * @param {number} quantity - Cantidad
     * @param {string} unit - Unidad de medida
     * @returns {string}
     */
    static formatStock(quantity, unit) {
        if (quantity === null || quantity === undefined) return '0';
        return `${formatearNumero(quantity)} ${unit || 'unidades'}`;
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Formatters;
}