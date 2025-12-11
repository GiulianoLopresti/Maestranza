// ============================================
// CONFIGURACIÓN GLOBAL DEL SISTEMA
// Maestranza Unidos S.A. - Sistema de Inventario
// ============================================

const CONFIG = {
    APP_NAME: 'Maestranza Unidos S.A.',
    APP_VERSION: '1.0.0',
    APP_DESCRIPTION: 'Sistema de Control de Inventarios',
    COMPANY_LOCATION: 'Copiapó, Región de Atacama',
    
    // Configuración de paginación
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
    },
    
    // Configuración de stock
    STOCK: {
        LOW_THRESHOLD_PERCENTAGE: 20, // % para considerar stock bajo
        CRITICAL_THRESHOLD_PERCENTAGE: 10 // % para considerar stock crítico
    },
    
    // Configuración de notificaciones
    NOTIFICATIONS: {
        AUTO_DISMISS_TIME: 5000, // ms
        MAX_DISPLAYED: 5
    },
    
    // Configuración de fechas
    DATE_FORMAT: 'DD/MM/YYYY',
    DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
    
    // Configuración de moneda
    CURRENCY: 'CLP',
    CURRENCY_SYMBOL: '$'
};

// ============================================
// ROLES DEL SISTEMA
// ============================================

const ROLES = {
    ADMIN: 'Administrador',
    GESTOR: 'Gestor de Inventario',
    BODEGUERO: 'Encargado de Bodega',
    AUDITOR: 'Auditor',
    COMPRADOR: 'Comprador',
    JEFE_PROD: 'Jefe de Producción',
    TRABAJADOR: 'Trabajador de Planta'
};

// ============================================
// PERMISOS POR ROL
// ============================================

const PERMISOS = {
    [ROLES.ADMIN]: ['*'], // Todos los permisos
    
    [ROLES.GESTOR]: [
        'inventario.crear',
        'inventario.editar',
        'inventario.ver',
        'inventario.eliminar',
        'movimientos.registrar',
        'movimientos.ver',
        'reportes.generar',
        'reportes.ver',
        'categorias.gestionar',
        'proyectos.ver'
    ],
    
    [ROLES.BODEGUERO]: [
        'inventario.ver',
        'inventario.editar',
        'movimientos.registrar',
        'movimientos.ver',
        'solicitudes.gestionar',
        'solicitudes.ver',
        'categorias.asignar',
        'incidencias.resolver'
    ],
    
    [ROLES.AUDITOR]: [
        'inventario.ver',
        'movimientos.ver',
        'historial.ver',
        'reportes.generar',
        'reportes.ver',
        'solicitudes.ver'
    ],
    
    [ROLES.COMPRADOR]: [
        'inventario.ver',
        'notificaciones.ver',
        'proveedores.gestionar',
        'proveedores.ver',
        'ordenes.crear',
        'ordenes.ver',
        'reportes.ver'
    ],
    
    [ROLES.JEFE_PROD]: [
        'inventario.ver',
        'disponibilidad.consultar',
        'proyectos.gestionar',
        'proyectos.ver',
        'reportes.generar',
        'reportes.ver',
        'solicitudes.ver',
        'solicitudes.crear'
    ],
    
    [ROLES.TRABAJADOR]: [
        'inventario.ver',
        'solicitudes.crear',
        'solicitudes.ver',
        'incidencias.reportar'
    ]
};

// ============================================
// TIPOS DE MOVIMIENTO
// ============================================

const TIPOS_MOVIMIENTO = {
    ENTRADA: 'Entrada',
    SALIDA: 'Salida',
    TRANSFERENCIA: 'Transferencia',
    AJUSTE: 'Ajuste de Inventario',
    DEVOLUCION: 'Devolución'
};

// ============================================
// ESTADOS DE SOLICITUDES
// ============================================

const ESTADOS_SOLICITUD = {
    PENDIENTE: 'Pendiente',
    EN_PREPARACION: 'En Preparación',
    LISTA: 'Lista para Retiro',
    ENTREGADA: 'Entregada',
    CANCELADA: 'Cancelada',
    CON_INCIDENCIA: 'Con Incidencia'
};

// Colores para estados de solicitudes
const COLORES_ESTADO_SOLICITUD = {
    [ESTADOS_SOLICITUD.PENDIENTE]: 'warning',
    [ESTADOS_SOLICITUD.EN_PREPARACION]: 'info',
    [ESTADOS_SOLICITUD.LISTA]: 'success',
    [ESTADOS_SOLICITUD.ENTREGADA]: 'secondary',
    [ESTADOS_SOLICITUD.CANCELADA]: 'danger',
    [ESTADOS_SOLICITUD.CON_INCIDENCIA]: 'danger'
};

// ============================================
// TIPOS DE INCIDENCIAS
// ============================================

const TIPOS_INCIDENCIA = {
    DANADO: 'Pieza Dañada',
    INCORRECTO: 'Pieza Incorrecta',
    FALTANTE: 'Faltante',
    EXCEDENTE: 'Excedente',
    OTRO: 'Otro'
};

// ============================================
// ESTADOS DE INCIDENCIAS
// ============================================

const ESTADOS_INCIDENCIA = {
    REPORTADA: 'Reportada',
    EN_REVISION: 'En Revisión',
    RESUELTA: 'Resuelta',
    RECHAZADA: 'Rechazada'
};

// ============================================
// ESTADOS DE PROYECTOS
// ============================================

const ESTADOS_PROYECTO = {
    PLANIFICACION: 'En Planificación',
    EN_CURSO: 'En Curso',
    PAUSADO: 'Pausado',
    COMPLETADO: 'Completado',
    CANCELADO: 'Cancelado'
};

// Colores para estados de proyectos
const COLORES_ESTADO_PROYECTO = {
    [ESTADOS_PROYECTO.PLANIFICACION]: 'info',
    [ESTADOS_PROYECTO.EN_CURSO]: 'success',
    [ESTADOS_PROYECTO.PAUSADO]: 'warning',
    [ESTADOS_PROYECTO.COMPLETADO]: 'secondary',
    [ESTADOS_PROYECTO.CANCELADO]: 'danger'
};

// ============================================
// TIPOS DE NOTIFICACIÓN
// ============================================

const TIPOS_NOTIFICACION = {
    STOCK_BAJO: 'Stock Bajo',
    STOCK_CRITICO: 'Stock Crítico',
    SOLICITUD_LISTA: 'Solicitud Lista',
    INCIDENCIA: 'Incidencia Reportada',
    NUEVA_SOLICITUD: 'Nueva Solicitud',
    SISTEMA: 'Sistema',
    RECORDATORIO: 'Recordatorio'
};

// Iconos para tipos de notificación
const ICONOS_NOTIFICACION = {
    [TIPOS_NOTIFICACION.STOCK_BAJO]: 'fa-exclamation-triangle',
    [TIPOS_NOTIFICACION.STOCK_CRITICO]: 'fa-exclamation-circle',
    [TIPOS_NOTIFICACION.SOLICITUD_LISTA]: 'fa-check-circle',
    [TIPOS_NOTIFICACION.INCIDENCIA]: 'fa-bug',
    [TIPOS_NOTIFICACION.NUEVA_SOLICITUD]: 'fa-bell',
    [TIPOS_NOTIFICACION.SISTEMA]: 'fa-info-circle',
    [TIPOS_NOTIFICACION.RECORDATORIO]: 'fa-clock'
};

// ============================================
// UNIDADES DE MEDIDA
// ============================================

const UNIDADES_MEDIDA = {
    UNIDAD: 'Unidad',
    KG: 'Kilogramo',
    MT: 'Metro',
    LT: 'Litro',
    M2: 'Metro Cuadrado',
    M3: 'Metro Cúbico',
    PAR: 'Par',
    JUEGO: 'Juego',
    CAJA: 'Caja',
    PALLET: 'Pallet',
    TONELADA: 'Tonelada',
    GALON: 'Galón'
};

// ============================================
// FRECUENCIAS PARA REPORTES PROGRAMADOS
// ============================================

const FRECUENCIAS_REPORTE = {
    DIARIO: 'Diario',
    SEMANAL: 'Semanal',
    QUINCENAL: 'Quincenal',
    MENSUAL: 'Mensual',
    TRIMESTRAL: 'Trimestral'
};

// ============================================
// TIPOS DE REPORTES
// ============================================

const TIPOS_REPORTE = {
    INVENTARIO_GENERAL: 'Inventario General',
    STOCK_BAJO: 'Stock Bajo Mínimo',
    MOVIMIENTOS: 'Movimientos de Inventario',
    POR_PROYECTO: 'Consumo por Proyecto',
    POR_CATEGORIA: 'Inventario por Categoría',
    ACTIVIDAD_USUARIOS: 'Actividad de Usuarios',
    VALORIZADO: 'Inventario Valorizado',
    VENCIMIENTOS: 'Próximos a Vencer',
    SOLICITUDES: 'Reporte de Solicitudes'
};

// ============================================
// COLORES PARA CATEGORÍAS
// ============================================

const COLORES_CATEGORIA = [
    { hex: '#00684A', nombre: 'Verde Bosque' },
    { hex: '#13AA52', nombre: 'Verde Esmeralda' },
    { hex: '#D4A574', nombre: 'Arena Desierto' },
    { hex: '#C87152', nombre: 'Terracota' },
    { hex: '#1D3848', nombre: 'Slate Oscuro' },
    { hex: '#29B6F6', nombre: 'Azul Cielo' },
    { hex: '#FFA726', nombre: 'Naranja' },
    { hex: '#AB47BC', nombre: 'Púrpura' },
    { hex: '#66BB6A', nombre: 'Verde Suave' },
    { hex: '#78909C', nombre: 'Gris Azulado' },
    { hex: '#8D6E63', nombre: 'Marrón' },
    { hex: '#26A69A', nombre: 'Verde Azulado' }
];

// ============================================
// RUTAS DE NAVEGACIÓN (SPA)
// ============================================

const RUTAS = {
    // Auth
    LOGIN: '/login',
    REGISTER: '/register',
    
    // Dashboard
    DASHBOARD: '/dashboard',
    
    // Inventario
    INVENTARIO: '/inventario',
    INVENTARIO_NUEVO: '/inventario/nuevo',
    INVENTARIO_DETALLE: '/inventario/:id',
    INVENTARIO_EDITAR: '/inventario/:id/editar',
    
    // Movimientos
    MOVIMIENTOS: '/movimientos',
    MOVIMIENTOS_REGISTRAR: '/movimientos/registrar',
    
    // Solicitudes
    SOLICITUDES: '/solicitudes',
    SOLICITUDES_NUEVA: '/solicitudes/nueva',
    SOLICITUDES_DETALLE: '/solicitudes/:id',
    
    // Notificaciones
    NOTIFICACIONES: '/notificaciones',
    
    // Reportes
    REPORTES: '/reportes',
    REPORTES_INVENTARIO: '/reportes/inventario',
    REPORTES_MOVIMIENTOS: '/reportes/movimientos',
    REPORTES_PROYECTOS: '/reportes/proyectos',
    
    // Proyectos
    PROYECTOS: '/proyectos',
    PROYECTOS_DETALLE: '/proyectos/:id',
    
    // Proveedores
    PROVEEDORES: '/proveedores',
    
    // Configuración
    CONFIGURACION: '/configuracion',
    CONFIGURACION_PERFIL: '/configuracion/perfil',
    CONFIGURACION_SISTEMA: '/configuracion/sistema'
};

// ============================================
// ICONOS PARA ROLES
// ============================================

const ICONOS_ROLES = {
    [ROLES.ADMIN]: 'fa-user-shield',
    [ROLES.GESTOR]: 'fa-boxes',
    [ROLES.BODEGUERO]: 'fa-warehouse',
    [ROLES.AUDITOR]: 'fa-clipboard-check',
    [ROLES.COMPRADOR]: 'fa-shopping-cart',
    [ROLES.JEFE_PROD]: 'fa-cogs',
    [ROLES.TRABAJADOR]: 'fa-hard-hat'
};

// ============================================
// KEYS DE LOCALSTORAGE
// ============================================

const STORAGE_KEYS = {
    // Sistema
    APP_INITIALIZED: 'app_initialized',
    APP_CONFIG: 'app_config',
    
    // Auth
    AUTH_TOKEN: 'auth_token',
    CURRENT_USER: 'current_user',
    
    // Datos principales
    USUARIOS: 'usuarios',
    PIEZAS: 'piezas',
    CATEGORIAS: 'categorias',
    MOVIMIENTOS: 'movimientos',
    SOLICITUDES: 'solicitudes',
    SOLICITUDES_DETALLE: 'solicitudes_detalle',
    NOTIFICACIONES: 'notificaciones',
    PROYECTOS: 'proyectos',
    PROVEEDORES: 'proveedores',
    KITS: 'kits',
    KITS_DETALLE: 'kits_detalle',
    INCIDENCIAS: 'incidencias',
    REPORTES_PROGRAMADOS: 'reportes_programados',
    
    // Preferencias
    USER_PREFERENCES: 'user_preferences'
};

// ============================================
// MENSAJES DEL SISTEMA
// ============================================

const MENSAJES = {
    // Éxito
    LOGIN_SUCCESS: 'Inicio de sesión exitoso',
    REGISTRO_SUCCESS: 'Cuenta creada exitosamente',
    GUARDADO_SUCCESS: 'Guardado exitosamente',
    ELIMINADO_SUCCESS: 'Eliminado exitosamente',
    ACTUALIZADO_SUCCESS: 'Actualizado exitosamente',
    
    // Errores
    LOGIN_ERROR: 'Usuario o contraseña incorrectos',
    REGISTRO_ERROR: 'Error al crear la cuenta',
    GUARDADO_ERROR: 'Error al guardar',
    ELIMINADO_ERROR: 'Error al eliminar',
    CAMPO_REQUERIDO: 'Este campo es requerido',
    EMAIL_INVALIDO: 'Email inválido',
    
    // Confirmaciones
    CONFIRM_DELETE: '¿Estás seguro de que deseas eliminar este elemento?',
    CONFIRM_LOGOUT: '¿Estás seguro de que deseas cerrar sesión?',
    
    // Información
    SIN_DATOS: 'No hay datos para mostrar',
    CARGANDO: 'Cargando...'
};

// ============================================
// FUNCIONES AUXILIARES DE CONFIGURACIÓN
// ============================================

/**
 * Verifica si el usuario tiene un permiso específico
 * @param {string} rol - Rol del usuario
 * @param {string} permiso - Permiso a verificar
 * @returns {boolean}
 */
function tienePermiso(rol, permiso) {
    if (!PERMISOS[rol]) return false;
    if (PERMISOS[rol].includes('*')) return true;
    return PERMISOS[rol].includes(permiso);
}

/**
 * Obtiene el color del badge según el estado de la solicitud
 * @param {string} estado - Estado de la solicitud
 * @returns {string}
 */
function getColorEstadoSolicitud(estado) {
    return COLORES_ESTADO_SOLICITUD[estado] || 'secondary';
}

/**
 * Obtiene el color del badge según el estado del proyecto
 * @param {string} estado - Estado del proyecto
 * @returns {string}
 */
function getColorEstadoProyecto(estado) {
    return COLORES_ESTADO_PROYECTO[estado] || 'secondary';
}

/**
 * Obtiene el icono según el tipo de notificación
 * @param {string} tipo - Tipo de notificación
 * @returns {string}
 */
function getIconoNotificacion(tipo) {
    return ICONOS_NOTIFICACION[tipo] || 'fa-bell';
}

/**
 * Obtiene el icono según el rol
 * @param {string} rol - Rol del usuario
 * @returns {string}
 */
function getIconoRol(rol) {
    return ICONOS_ROLES[rol] || 'fa-user';
}

// Exportar configuración (para uso futuro si se migra a módulos)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        ROLES,
        PERMISOS,
        TIPOS_MOVIMIENTO,
        ESTADOS_SOLICITUD,
        TIPOS_INCIDENCIA,
        ESTADOS_INCIDENCIA,
        ESTADOS_PROYECTO,
        TIPOS_NOTIFICACION,
        UNIDADES_MEDIDA,
        FRECUENCIAS_REPORTE,
        TIPOS_REPORTE,
        COLORES_CATEGORIA,
        RUTAS,
        STORAGE_KEYS,
        MENSAJES,
        tienePermiso,
        getColorEstadoSolicitud,
        getColorEstadoProyecto,
        getIconoNotificacion,
        getIconoRol
    };
}