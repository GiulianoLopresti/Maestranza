// ============================================
// VALIDADORES
// Maestranza Unidos S.A.
// ============================================

/**
 * Clase con funciones de validación para el sistema
 */
class Validators {
    
    /**
     * Valida si un campo está vacío
     * @param {*} value - Valor a validar
     * @returns {boolean}
     */
    static isRequired(value) {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
    }
    
    /**
     * Valida longitud mínima de un string
     * @param {string} value - Valor a validar
     * @param {number} minLength - Longitud mínima
     * @returns {boolean}
     */
    static minLength(value, minLength) {
        if (!value) return false;
        return String(value).length >= minLength;
    }
    
    /**
     * Valida longitud máxima de un string
     * @param {string} value - Valor a validar
     * @param {number} maxLength - Longitud máxima
     * @returns {boolean}
     */
    static maxLength(value, maxLength) {
        if (!value) return true; // Si está vacío, no valida max length
        return String(value).length <= maxLength;
    }
    
    /**
     * Valida formato de email
     * @param {string} email - Email a validar
     * @returns {boolean}
     */
    static isEmail(email) {
        if (!email) return false;
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email.trim());
    }
    
    /**
     * Valida RUT chileno
     * @param {string} rut - RUT a validar
     * @returns {boolean}
     */
    static isValidRut(rut) {
        if (!rut) return false;
        
        // Limpiar el RUT
        rut = rut.replaceAll('.', '').replaceAll('-', '');
        
        if (rut.length < 2) return false;
        
        const cuerpo = rut.slice(0, -1);
        const dv = rut.slice(-1).toUpperCase();
        
        // Verificar que el cuerpo sea numérico
        if (!/^\d+$/.test(cuerpo)) return false;
        
        // Calcular dígito verificador
        let suma = 0;
        let multiplo = 2;
        
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += Number.parseInt(cuerpo.charAt(i)) * multiplo;
            multiplo = multiplo === 7 ? 2 : multiplo + 1;
        }
        
        const dvEsperado = 11 - (suma % 11);
        
        let dvCalculado;
        if (dvEsperado === 11) {
            dvCalculado = '0';
        } else if (dvEsperado === 10) {
            dvCalculado = 'K';
        } else {
            dvCalculado = String(dvEsperado);
        }
        
        return dv === dvCalculado;
    }
    
    /**
     * Valida número de teléfono chileno
     * @param {string} phone - Teléfono a validar
     * @returns {boolean}
     */
    static isValidPhone(phone) {
        if (!phone) return false;
        // Formato: +56912345678 o 912345678 o +56 52 221 3456
        const cleanPhone = phone.replaceAll(/\s/g, '');
        const regex = /^(\+?56)?[2-9]\d{8}$/;
        return regex.test(cleanPhone);
    }
    
    /**
     * Valida que sea un número
     * @param {*} value - Valor a validar
     * @returns {boolean}
     */
    static isNumber(value) {
        if (value === null || value === undefined || value === '') return false;
        return !Number.isNaN(Number(value));
    }
    
    /**
     * Valida que sea un número entero
     * @param {*} value - Valor a validar
     * @returns {boolean}
     */
    static isInteger(value) {
        if (!this.isNumber(value)) return false;
        return Number.isInteger(Number(value));
    }
    
    /**
     * Valida que sea un número positivo
     * @param {*} value - Valor a validar
     * @returns {boolean}
     */
    static isPositive(value) {
        if (!this.isNumber(value)) return false;
        return Number(value) > 0;
    }
    
    /**
     * Valida que sea un número no negativo (>= 0)
     * @param {*} value - Valor a validar
     * @returns {boolean}
     */
    static isNonNegative(value) {
        if (!this.isNumber(value)) return false;
        return Number(value) >= 0;
    }
    
    /**
     * Valida rango numérico
     * @param {number} value - Valor a validar
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {boolean}
     */
    static inRange(value, min, max) {
        if (!this.isNumber(value)) return false;
        const num = Number(value);
        return num >= min && num <= max;
    }
    
    /**
     * Valida formato de fecha
     * @param {string} date - Fecha a validar
     * @returns {boolean}
     */
    static isValidDate(date) {
        if (!date) return false;
        const d = new Date(date);
        return !Number.isNaN(d.getTime());
    }
    
    /**
     * Valida que una fecha sea futura
     * @param {string} date - Fecha a validar
     * @returns {boolean}
     */
    static isFutureDate(date) {
        if (!this.isValidDate(date)) return false;
        return new Date(date) > new Date();
    }
    
    /**
     * Valida que una fecha sea pasada
     * @param {string} date - Fecha a validar
     * @returns {boolean}
     */
    static isPastDate(date) {
        if (!this.isValidDate(date)) return false;
        return new Date(date) < new Date();
    }
    
    /**
     * Valida formato de URL
     * @param {string} url - URL a validar
     * @returns {boolean}
     */
    static isURL(url) {
        if (!url) return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Valida contraseña segura
     * @param {string} password - Contraseña a validar
     * @param {Object} options - Opciones de validación
     * @returns {Object} - { valid: boolean, errors: string[] }
     */
    static isStrongPassword(password, options = {}) {
        const {
            minLength = 6,
            requireUppercase = false,
            requireLowercase = false,
            requireNumbers = false,
            requireSpecialChars = false
        } = options;
        
        const errors = [];
        
        if (!password) {
            errors.push('La contraseña es requerida');
            return { valid: false, errors };
        }
        
        if (password.length < minLength) {
            errors.push(`La contraseña debe tener al menos ${minLength} caracteres`);
        }
        
        if (requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('La contraseña debe contener al menos una mayúscula');
        }
        
        if (requireLowercase && !/[a-z]/.test(password)) {
            errors.push('La contraseña debe contener al menos una minúscula');
        }
        
        if (requireNumbers && !/\d/.test(password)) {
            errors.push('La contraseña debe contener al menos un número');
        }
        
        if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('La contraseña debe contener al menos un carácter especial');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Valida que dos valores sean iguales
     * @param {*} value1 - Primer valor
     * @param {*} value2 - Segundo valor
     * @returns {boolean}
     */
    static isEqual(value1, value2) {
        return value1 === value2;
    }
    
    /**
     * Valida formato de código postal chileno
     * @param {string} postalCode - Código postal
     * @returns {boolean}
     */
    static isValidPostalCode(postalCode) {
        if (!postalCode) return false;
        // Chile usa códigos de 7 dígitos
        return /^\d{7}$/.test(postalCode);
    }
    
    /**
     * Valida formato de número de serie
     * @param {string} serialNumber - Número de serie
     * @returns {boolean}
     */
    static isValidSerialNumber(serialNumber) {
        if (!serialNumber) return false;
        // Formato: 2-20 caracteres alfanuméricos, puede incluir guiones
        return /^[A-Z0-9-]{2,20}$/i.test(serialNumber);
    }
    
    /**
     * Valida extensión de archivo
     * @param {string} filename - Nombre del archivo
     * @param {string[]} allowedExtensions - Extensiones permitidas
     * @returns {boolean}
     */
    static hasValidExtension(filename, allowedExtensions) {
        if (!filename || !allowedExtensions || allowedExtensions.length === 0) return false;
        const extension = filename.split('.').pop().toLowerCase();
        return allowedExtensions.map(ext => ext.toLowerCase()).includes(extension);
    }
    
    /**
     * Valida tamaño de archivo
     * @param {number} sizeInBytes - Tamaño en bytes
     * @param {number} maxSizeMB - Tamaño máximo en MB
     * @returns {boolean}
     */
    static isValidFileSize(sizeInBytes, maxSizeMB) {
        if (!sizeInBytes || !maxSizeMB) return false;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return sizeInBytes <= maxSizeBytes;
    }
    
    /**
     * Valida un objeto según un schema
     * @param {Object} obj - Objeto a validar
     * @param {Object} schema - Schema de validación
     * @returns {Object} - { valid: boolean, errors: Object }
     */
    static validateObject(obj, schema) {
        const errors = {};
        let valid = true;
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = obj[field];
            const fieldErrors = [];
            
            // Required
            if (rules.required && !this.isRequired(value)) {
                fieldErrors.push(`${field} es requerido`);
                valid = false;
            }
            
            // Type validation
            if (value && rules.type) {
                switch (rules.type) {
                    case 'email':
                        if (!this.isEmail(value)) {
                            fieldErrors.push(`${field} debe ser un email válido`);
                            valid = false;
                        }
                        break;
                    case 'number':
                        if (!this.isNumber(value)) {
                            fieldErrors.push(`${field} debe ser un número`);
                            valid = false;
                        }
                        break;
                    case 'integer':
                        if (!this.isInteger(value)) {
                            fieldErrors.push(`${field} debe ser un número entero`);
                            valid = false;
                        }
                        break;
                    case 'date':
                        if (!this.isValidDate(value)) {
                            fieldErrors.push(`${field} debe ser una fecha válida`);
                            valid = false;
                        }
                        break;
                    case 'url':
                        if (!this.isURL(value)) {
                            fieldErrors.push(`${field} debe ser una URL válida`);
                            valid = false;
                        }
                        break;
                }
            }
            
            // Min/Max length
            if (value && rules.minLength && !this.minLength(value, rules.minLength)) {
                fieldErrors.push(`${field} debe tener al menos ${rules.minLength} caracteres`);
                valid = false;
            }
            
            if (value && rules.maxLength && !this.maxLength(value, rules.maxLength)) {
                fieldErrors.push(`${field} no puede exceder ${rules.maxLength} caracteres`);
                valid = false;
            }
            
            // Min/Max value
            if (value && rules.min !== undefined && Number(value) < rules.min) {
                fieldErrors.push(`${field} debe ser mayor o igual a ${rules.min}`);
                valid = false;
            }
            
            if (value && rules.max !== undefined && Number(value) > rules.max) {
                fieldErrors.push(`${field} debe ser menor o igual a ${rules.max}`);
                valid = false;
            }
            
            // Custom validator
            if (value && rules.custom && typeof rules.custom === 'function') {
                const customResult = rules.custom(value);
                if (!customResult.valid) {
                    fieldErrors.push(...customResult.errors);
                    valid = false;
                }
            }
            
            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
            }
        }
        
        return { valid, errors };
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validators;
}