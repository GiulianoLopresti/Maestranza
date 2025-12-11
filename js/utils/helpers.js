// ============================================
// FUNCIONES AUXILIARES Y HELPERS
// Maestranza Unidos S.A.
// ============================================

/**
 * FORMATEO DE FECHAS
 */

/**
 * Formatea una fecha a formato chileno (DD/MM/YYYY)
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string}
 */
function formatearFecha(fecha) {
    if (!fecha) return '-';
    
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '-';
    
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
}

/**
 * Formatea una fecha con hora (DD/MM/YYYY HH:mm)
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string}
 */
function formatearFechaHora(fecha) {
    if (!fecha) return '-';
    
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '-';
    
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

/**
 * Convierte fecha a formato relativo (hace 2 horas, hace 3 días, etc)
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string}
 */
function formatearFechaRelativa(fecha) {
    if (!fecha) return '-';
    
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '-';
    
    const ahora = new Date();
    const diferencia = ahora - date;
    
    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const meses = Math.floor(dias / 30);
    const anios = Math.floor(dias / 365);
    
    if (segundos < 60) return 'Hace unos segundos';
    if (minutos < 60) return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    if (horas < 24) return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    if (dias < 30) return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    if (meses < 12) return `Hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    return `Hace ${anios} ${anios === 1 ? 'año' : 'años'}`;
}

/**
 * FORMATEO DE NÚMEROS Y MONEDA
 */

/**
 * Formatea un número con separador de miles
 * @param {number} numero - Número a formatear
 * @returns {string}
 */
function formatearNumero(numero) {
    if (numero === null || numero === undefined) return '0';
    return Number(numero).toLocaleString('es-CL');
}

/**
 * Formatea un precio en pesos chilenos
 * @param {number} precio - Precio a formatear
 * @returns {string}
 */
function formatearPrecio(precio) {
    if (precio === null || precio === undefined) return '$0';
    return `$${Number(precio).toLocaleString('es-CL')}`;
}

/**
 * Formatea un porcentaje
 * @param {number} valor - Valor a formatear
 * @param {number} decimales - Número de decimales (default: 1)
 * @returns {string}
 */
function formatearPorcentaje(valor, decimales = 1) {
    if (valor === null || valor === undefined) return '0%';
    return `${Number(valor).toFixed(decimales)}%`;
}

/**
 * VALIDACIONES
 */

/**
 * Valida un RUT chileno
 * @param {string} rut - RUT a validar
 * @returns {boolean}
 */
function validarRut(rut) {
    if (!rut) return false;
    
    // Limpiar el RUT
    rut = rut.replaceAll(/\./g, '').replaceAll(/-/g, '');
    
    if (rut.length < 2) return false;
    
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplo = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * multiplo;
        multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }
    
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : String(dvEsperado);
    
    return dv === dvCalculado;
}

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
function validarEmail(email) {
    if (!email) return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida un teléfono chileno
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean}
 */
function validarTelefono(telefono) {
    if (!telefono) return false;
    // Formato: +56 9 1234 5678 o +56 52 221 3456
    const regex = /^\+?56\s?[2-9]\s?\d{4}\s?\d{4}$/;
    return regex.test(telefono.replaceAll(/\s/g, ''));
}

/**
 * STRINGS
 */

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string}
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Trunca un texto a cierta longitud
 * @param {string} texto - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string}
 */
function truncarTexto(texto, maxLength = 50) {
    if (!texto) return '';
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
}

/**
 * Slugifica un texto (para URLs)
 * @param {string} texto - Texto a slugificar
 * @returns {string}
 */
function slugify(texto) {
    if (!texto) return '';
    
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replaceAll(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replaceAll(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
        .trim()
        .replaceAll(/\s+/g, '-') // Espacios a guiones
        .replaceAll(/-+/g, '-'); // Múltiples guiones a uno solo
}

/**
 * ARRAYS
 */

/**
 * Ordena un array de objetos por una propiedad
 * @param {Array} array - Array a ordenar
 * @param {string} propiedad - Propiedad por la cual ordenar
 * @param {string} orden - 'asc' o 'desc'
 * @returns {Array}
 */
function ordenarPor(array, propiedad, orden = 'asc') {
    if (!Array.isArray(array)) return [];
    
    return [...array].sort((a, b) => {
        const valorA = a[propiedad];
        const valorB = b[propiedad];
        
        if (valorA < valorB) return orden === 'asc' ? -1 : 1;
        if (valorA > valorB) return orden === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Filtra un array de objetos por búsqueda de texto
 * @param {Array} array - Array a filtrar
 * @param {string} busqueda - Texto de búsqueda
 * @param {string[]} propiedades - Propiedades donde buscar
 * @returns {Array}
 */
function filtrarPorTexto(array, busqueda, propiedades) {
    if (!Array.isArray(array) || !busqueda) return array;
    
    const textoBusqueda = busqueda.toLowerCase().trim();
    
    return array.filter(item => {
        return propiedades.some(prop => {
            const valor = String(item[prop] || '').toLowerCase();
            return valor.includes(textoBusqueda);
        });
    });
}

/**
 * Pagina un array
 * @param {Array} array - Array a paginar
 * @param {number} pagina - Número de página (1-indexed)
 * @param {number} tamañoPagina - Tamaño de página
 * @returns {Object} - { datos, total, paginas }
 */
function paginar(array, pagina = 1, tamañoPagina = 10) {
    if (!Array.isArray(array)) return { datos: [], total: 0, paginas: 0 };
    
    const total = array.length;
    const paginas = Math.ceil(total / tamañoPagina);
    const inicio = (pagina - 1) * tamañoPagina;
    const fin = inicio + tamañoPagina;
    const datos = array.slice(inicio, fin);
    
    return {
        datos,
        total,
        paginas,
        paginaActual: pagina,
        tamañoPagina
    };
}

/**
 * OBJETOS
 */

/**
 * Clona profundamente un objeto
 * @param {*} obj - Objeto a clonar
 * @returns {*}
 */
function clonar(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    return structuredClone(obj);
}

/**
 * Compara dos objetos
 * @param {Object} obj1 - Primer objeto
 * @param {Object} obj2 - Segundo objeto
 * @returns {boolean}
 */
function sonIguales(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * DOM UTILITIES
 */

/**
 * Escapea HTML para prevenir XSS
 * @param {string} texto - Texto a escapar
 * @returns {string}
 */
function escaparHTML(texto) {
    if (!texto) return '';
    
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

/**
 * Muestra un elemento con animación
 * @param {HTMLElement} elemento - Elemento a mostrar
 */
function mostrar(elemento) {
    if (!elemento) return;
    elemento.classList.remove('d-none');
    elemento.classList.add('fade-in');
}

/**
 * Oculta un elemento
 * @param {HTMLElement} elemento - Elemento a ocultar
 */
function ocultar(elemento) {
    if (!elemento) return;
    elemento.classList.add('d-none');
}

/**
 * Toggle de un elemento
 * @param {HTMLElement} elemento - Elemento a hacer toggle
 */
function toggle(elemento) {
    if (!elemento) return;
    elemento.classList.toggle('d-none');
}

/**
 * UTILIDADES DE STOCK
 */

/**
 * Calcula el porcentaje de stock actual vs mínimo
 * @param {number} stockActual - Stock actual
 * @param {number} stockMinimo - Stock mínimo
 * @returns {number}
 */
function calcularPorcentajeStock(stockActual, stockMinimo) {
    if (!stockMinimo || stockMinimo === 0) return 100;
    return Math.round((stockActual / stockMinimo) * 100);
}

/**
 * Determina el estado del stock
 * @param {number} stockActual - Stock actual
 * @param {number} stockMinimo - Stock mínimo
 * @returns {string} - 'critico', 'bajo', 'normal'
 */
function obtenerEstadoStock(stockActual, stockMinimo) {
    const porcentaje = calcularPorcentajeStock(stockActual, stockMinimo);
    
    if (porcentaje <= CONFIG.STOCK.CRITICAL_THRESHOLD_PERCENTAGE) {
        return 'critico';
    } else if (porcentaje <= CONFIG.STOCK.LOW_THRESHOLD_PERCENTAGE) {
        return 'bajo';
    } else {
        return 'normal';
    }
}

/**
 * Obtiene la clase de badge según el estado del stock
 * @param {number} stockActual - Stock actual
 * @param {number} stockMinimo - Stock mínimo
 * @returns {string}
 */
function obtenerClaseBadgeStock(stockActual, stockMinimo) {
    const estado = obtenerEstadoStock(stockActual, stockMinimo);
    
    switch (estado) {
        case 'critico': return 'badge-danger';
        case 'bajo': return 'badge-warning';
        default: return 'badge-success';
    }
}

/**
 * UTILIDADES DE ARCHIVOS
 */

/**
 * Convierte un archivo a Base64
 * @param {File} file - Archivo a convertir
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(new Error(error));
        reader.readAsDataURL(file);
    });
}

/**
 * Valida el tamaño de un archivo
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB
 * @returns {boolean}
 */
function validarTamañoArchivo(file, maxSizeMB = 5) {
    if (!file) return false;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

/**
 * Valida la extensión de un archivo
 * @param {File} file - Archivo a validar
 * @param {string[]} extensionesPermitidas - Extensiones permitidas
 * @returns {boolean}
 */
function validarExtensionArchivo(file, extensionesPermitidas = []) {
    if (!file) return false;
    const extension = file.name.split('.').pop().toLowerCase();
    return extensionesPermitidas.includes(extension);
}

/**
 * DEBOUNCE Y THROTTLE
 */

/**
 * Debounce - Retrasa la ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function}
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle - Limita la frecuencia de ejecución
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite en ms
 * @returns {Function}
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * GENERADORES
 */

/**
 * Genera un ID único
 * @returns {string}
 */
function generarID() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Genera un código aleatorio
 * @param {number} longitud - Longitud del código
 * @returns {string}
 */
function generarCodigo(longitud = 8) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < longitud; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
}

/**
 * EXPORTAR FUNCIONES
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Fechas
        formatearFecha,
        formatearFechaHora,
        formatearFechaRelativa,
        
        // Números
        formatearNumero,
        formatearPrecio,
        formatearPorcentaje,
        
        // Validaciones
        validarRut,
        validarEmail,
        validarTelefono,
        
        // Strings
        capitalize,
        truncarTexto,
        slugify,
        
        // Arrays
        ordenarPor,
        filtrarPorTexto,
        paginar,
        
        // Objetos
        clonar,
        sonIguales,
        
        // DOM
        escaparHTML,
        mostrar,
        ocultar,
        toggle,
        
        // Stock
        calcularPorcentajeStock,
        obtenerEstadoStock,
        obtenerClaseBadgeStock,
        
        // Archivos
        fileToBase64,
        validarTamañoArchivo,
        validarExtensionArchivo,
        
        // Utilidades
        debounce,
        throttle,
        generarID,
        generarCodigo
    };
}