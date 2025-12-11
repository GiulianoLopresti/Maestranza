// ============================================
// APLICACIÓN PRINCIPAL
// Maestranza Unidos S.A. - Sistema de Inventario
// ============================================

/**
 * Clase principal de la aplicación
 * Maneja la inicialización y el flujo general
 */
class App {
    
    /**
     * Inicializa la aplicación
     */
    static init() {
        console.log('🚀 Iniciando aplicación...');
        console.log(`📱 ${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}`);
        
        // Inicializar datos si es la primera vez
        this.initializeData();
        
        // Verificar autenticación
        this.checkAuthentication();
        
        // Configurar event listeners globales
        this.setupGlobalEventListeners();
        
        console.log('✅ Aplicación iniciada correctamente');
    }
    
    /**
     * Inicializa los datos mock si es necesario
     */
    static initializeData() {
        if (StorageManager.exists(STORAGE_KEYS.APP_INITIALIZED)) {
            console.log('✅ Sistema ya inicializado');
            
            // Mostrar estadísticas en consola (solo en desarrollo)
            if (globalThis.location.hostname === 'localhost' || globalThis.location.hostname === '127.0.0.1') {
                const stats = getEstadisticasSistema();
                console.log('📊 Estadísticas del sistema:', stats);
            }
        } else {
            console.log('📦 Primera ejecución detectada. Inicializando datos...');
            
            const initialized = initMockData();
            
            if (initialized) {
                console.log('✅ Datos inicializados correctamente');
                Toast.success('Sistema inicializado correctamente', 3000);
            } else {
                console.error('❌ Error al inicializar datos');
                Toast.error('Error al inicializar el sistema', 5000);
            }
        }
    }
    
    /**
     * Verifica el estado de autenticación y carga la vista apropiada
     */
    static checkAuthentication() {
        const isAuthenticated = AuthService.isAuthenticated();
        const currentUser = AuthService.getCurrentUser();
        
        if (isAuthenticated && currentUser) {
            console.log(`👤 Usuario autenticado: ${currentUser.nombre} (${currentUser.rol})`);
            this.loadDashboard();
        } else {
            console.log('🔓 Usuario no autenticado. Mostrando login...');
            this.loadLogin();
        }
    }
    
    /**
     * Carga la página de login
     */
    static loadLogin() {
        LoginController.init();
    }
    
    /**
     * Carga el dashboard
     */
    static loadDashboard() {
        const currentUser = AuthService.getCurrentUser();
        
        // Cargar el dashboard real
        DashboardController.init();
        
        // Mostrar mensaje de bienvenida
        Toast.success(`¡Bienvenido ${currentUser.nombre}!`, 3000);
        
        // Log de actividad
        AuthService.logActivity('Acceso al dashboard', {
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Maneja el logout
     */
    static handleLogout() {
        Toast.confirm(
            '¿Estás seguro de que deseas cerrar sesión?',
            () => {
                const success = AuthService.logout();
                
                if (success) {
                    Toast.success('Sesión cerrada exitosamente', 2000);
                    
                    // Recargar después de un breve delay
                    setTimeout(() => {
                        globalThis.location.reload();
                    }, 1000);
                } else {
                    Toast.error('Error al cerrar sesión', 3000);
                }
            }
        );
    }
    
    /**
     * Configura event listeners globales
     */
    static setupGlobalEventListeners() {
        // Manejar errores globales
        globalThis.addEventListener('error', (event) => {
            console.error('❌ Error global:', event.error);
            
            // En producción, podrías enviar esto a un servicio de logging
            if (globalThis.location.hostname !== 'localhost' && globalThis.location.hostname !== '127.0.0.1') {
                // Enviar a servicio de logging
                console.log('Enviaría error a servicio de logging');
            }
        });
        
        // Manejar promesas rechazadas
        globalThis.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Promesa rechazada:', event.reason);
        });
        
        // Manejar cambios de estado online/offline
        globalThis.addEventListener('online', () => {
            Toast.success('Conexión restaurada', 2000);
        });
        
        globalThis.addEventListener('offline', () => {
            Toast.warning('Sin conexión a internet', 3000);
        });
        
        // Prevenir pérdida de datos en formularios
        globalThis.addEventListener('beforeunload', (event) => {
            // Aquí podrías verificar si hay cambios sin guardar
            // Por ahora, solo lo dejamos preparado para futuras implementaciones
        });
        
        // Atajos de teclado globales (para desarrollo)
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + K = Buscar (próximamente)
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                console.log('Búsqueda rápida (próximamente)');
            }
            
            // Ctrl/Cmd + / = Ayuda (próximamente)
            if ((event.ctrlKey || event.metaKey) && event.key === '/') {
                event.preventDefault();
                console.log('Ayuda (próximamente)');
            }
        });
    }
    
    /**
     * Maneja la navegación entre vistas (para futuro router)
     * @param {string} ruta - Ruta a navegar
     */
    static navigate(ruta) {
        console.log(`📍 Navegando a: ${ruta}`);
        
        // Implementación del router vendrá después
        // Por ahora solo lo dejamos preparado
        
        switch (ruta) {
            case RUTAS.LOGIN:
                this.loadLogin();
                break;
            case RUTAS.DASHBOARD:
                this.loadDashboard();
                break;
            default:
                console.warn(`Ruta no encontrada: ${ruta}`);
        }
    }
    
    /**
     * Obtiene información del sistema
     * @returns {Object}
     */
    static getSystemInfo() {
        return {
            appName: CONFIG.APP_NAME,
            version: CONFIG.APP_VERSION,
            initialized: StorageManager.exists(STORAGE_KEYS.APP_INITIALIZED),
            authenticated: AuthService.isAuthenticated(),
            currentUser: AuthService.getCurrentUser(),
            storageSize: StorageManager.getSizeFormatted(),
            stats: getEstadisticasSistema()
        };
    }
}

// ============================================
// INICIALIZACIÓN AL CARGAR EL DOM
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado');
    
    // Mostrar información de la aplicación
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           🏭 MAESTRANZA UNIDOS S.A.                       ║
║           Sistema de Control de Inventarios              ║
║                                                           ║
║           Version: ${CONFIG.APP_VERSION}                               ║
║           Location: ${CONFIG.COMPANY_LOCATION}      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
    
    // Inicializar aplicación
    try {
        App.init();
    } catch (error) {
        console.error('❌ Error fatal al inicializar aplicación:', error);
        Toast.error('Error al iniciar la aplicación. Recarga la página.', 0);
    }
});

// ============================================
// FUNCIONES GLOBALES ÚTILES
// ============================================

// Hacer App disponible globalmente
globalThis.App = App;

// Hacer función de logout disponible globalmente
globalThis.handleLogout = () => App.handleLogout();

// Función de ayuda para debugging
globalThis.debugInfo = () => {
    const info = App.getSystemInfo();
    console.table(info);
    return info;
};

// Mensaje de bienvenida en consola
console.log('%c👋 ¡Hola Desarrollador!', 'color: #00684A; font-size: 20px; font-weight: bold;');
console.log('%cSistema de Inventario - Maestranza Unidos S.A.', 'color: #13AA52; font-size: 14px;');
console.log('%cPrueba estas funciones en la consola:', 'color: #666; font-size: 12px;');
console.log('%c  → mostrarEstadisticas()', 'color: #00684A; font-family: monospace;');
console.log('%c  → exportarDatos()', 'color: #00684A; font-family: monospace;');
console.log('%c  → debugInfo()', 'color: #00684A; font-family: monospace;');
console.log('%c  → resetSistema() ⚠️', 'color: #EF5350; font-family: monospace;');

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}