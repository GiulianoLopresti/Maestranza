// ============================================
// INICIALIZACIÓN DE DATOS DEL SISTEMA
// Maestranza Unidos S.A.
// ============================================

/**
 * Inicializa todos los datos mock en localStorage
 * Solo se ejecuta si el sistema no ha sido inicializado previamente
 */
function initMockData() {
    console.log(' Iniciando sistema...');
    
    // Verificar si ya está inicializado
    if (StorageManager.exists(STORAGE_KEYS.APP_INITIALIZED)) {
        console.log(' Sistema ya inicializado');
        return false;
    }
    
    console.log(' Cargando datos de ejemplo...');
    
    try {
        // 1. Inicializar usuarios
        console.log(' Cargando usuarios...');
        StorageManager.setItem(STORAGE_KEYS.USUARIOS, MOCK_USUARIOS);
        console.log(`   ✓ ${MOCK_USUARIOS.length} usuarios cargados`);
        
        // 2. Inicializar categorías
        console.log('  Cargando categorías...');
        StorageManager.setItem(STORAGE_KEYS.CATEGORIAS, MOCK_CATEGORIAS);
        console.log(`   ✓ ${MOCK_CATEGORIAS.length} categorías cargadas`);
        
        // 3. Inicializar proveedores
        console.log(' Cargando proveedores...');
        StorageManager.setItem(STORAGE_KEYS.PROVEEDORES, MOCK_PROVEEDORES);
        console.log(`   ✓ ${MOCK_PROVEEDORES.length} proveedores cargados`);
        
        // 4. Inicializar proyectos
        console.log(' Cargando proyectos...');
        StorageManager.setItem(STORAGE_KEYS.PROYECTOS, MOCK_PROYECTOS);
        console.log(`   ✓ ${MOCK_PROYECTOS.length} proyectos cargados`);
        
        // 5. Inicializar piezas
        console.log(' Cargando piezas de inventario...');
        StorageManager.setItem(STORAGE_KEYS.PIEZAS, MOCK_PIEZAS);
        console.log(`   ✓ ${MOCK_PIEZAS.length} piezas cargadas`);
        
        // 6. Inicializar relación piezas-categorías
        console.log(' Vinculando piezas con categorías...');
        StorageManager.setItem('piezas_categorias', MOCK_PIEZAS_CATEGORIAS);
        console.log(`   ✓ ${MOCK_PIEZAS_CATEGORIAS.length} relaciones creadas`);
        
        // 7. Inicializar movimientos
        console.log(' Cargando movimientos de inventario...');
        StorageManager.setItem(STORAGE_KEYS.MOVIMIENTOS, MOCK_MOVIMIENTOS);
        console.log(`   ✓ ${MOCK_MOVIMIENTOS.length} movimientos cargados`);
        
        // 8. Inicializar arrays vacíos para otras entidades
        console.log(' Inicializando estructuras vacías...');
        StorageManager.setItem(STORAGE_KEYS.SOLICITUDES, []);
        StorageManager.setItem(STORAGE_KEYS.SOLICITUDES_DETALLE, []);
        StorageManager.setItem(STORAGE_KEYS.NOTIFICACIONES, []);
        StorageManager.setItem(STORAGE_KEYS.INCIDENCIAS, []);
        StorageManager.setItem(STORAGE_KEYS.KITS, []);
        StorageManager.setItem(STORAGE_KEYS.KITS_DETALLE, []);
        StorageManager.setItem(STORAGE_KEYS.REPORTES_PROGRAMADOS, []);
        console.log('   ✓ Estructuras inicializadas');
        
        // 9. Generar notificaciones iniciales para stock bajo
        console.log('Generando notificaciones de stock bajo...');
        generarNotificacionesStockBajo();
        
        // 10. Configuración de la aplicación
        const appConfig = {
            version: CONFIG.APP_VERSION,
            inicializado_en: new Date().toISOString(),
            ultima_actualizacion: new Date().toISOString()
        };
        StorageManager.setItem(STORAGE_KEYS.APP_CONFIG, appConfig);
        
        // 11. Marcar como inicializado
        StorageManager.setItem(STORAGE_KEYS.APP_INITIALIZED, true);
        
        console.log('Sistema inicializado correctamente');
        console.log(`Tamaño de datos: ${StorageManager.getSizeFormatted()}`);
        
        // Mostrar información de usuarios de prueba
        mostrarInfoUsuariosPrueba();
        
        return true;
        
    } catch (error) {
        console.error('❌ Error al inicializar el sistema:', error);
        return false;
    }
}

/**
 * Genera notificaciones automáticas para piezas con stock bajo
 */
function generarNotificacionesStockBajo() {
    const piezas = PiezaStorage.getAll();
    const notificaciones = [];
    let idNotif = 1;
    
    for (const pieza of piezas) {
        const porcentajeStock = (pieza.stock_actual / pieza.stock_minimo) * 100;
        
        // Stock crítico (< 10%)
        if (porcentajeStock <= CONFIG.STOCK.CRITICAL_THRESHOLD_PERCENTAGE) {
            notificaciones.push({
                id: idNotif++,
                usuario_id: 5, // Comprador
                tipo_notificacion: TIPOS_NOTIFICACION.STOCK_CRITICO,
                titulo: 'Stock Crítico',
                mensaje: `La pieza "${pieza.nombre}" (${pieza.numero_serie}) tiene stock crítico: ${pieza.stock_actual} unidades (mínimo: ${pieza.stock_minimo})`,
                leida: false,
                datos_adicionales: JSON.stringify({ pieza_id: pieza.id }),
                creado_en: new Date().toISOString()
            });
        }
        // Stock bajo (< 20%)
        else if (porcentajeStock <= CONFIG.STOCK.LOW_THRESHOLD_PERCENTAGE) {
            notificaciones.push({
                id: idNotif++,
                usuario_id: 5, // Comprador
                tipo_notificacion: TIPOS_NOTIFICACION.STOCK_BAJO,
                titulo: 'Stock Bajo',
                mensaje: `La pieza "${pieza.nombre}" (${pieza.numero_serie}) tiene stock bajo: ${pieza.stock_actual} unidades (mínimo: ${pieza.stock_minimo})`,
                leida: false,
                datos_adicionales: JSON.stringify({ pieza_id: pieza.id }),
                creado_en: new Date().toISOString()
            });
        }
    }
    
    if (notificaciones.length > 0) {
        StorageManager.setItem(STORAGE_KEYS.NOTIFICACIONES, notificaciones);
        console.log(`   ✓ ${notificaciones.length} notificaciones de stock generadas`);
    }
}

/**
 * Muestra información de los usuarios de prueba en la consola
 */
function mostrarInfoUsuariosPrueba() {
    console.log('\n' + '='.repeat(60));
    console.log('👤 USUARIOS DE PRUEBA DISPONIBLES');
    console.log('='.repeat(60));
    
    const usuariosInfo = [
        { username: 'admin', password: 'admin123', rol: 'Administrador' },
        { username: 'gestor1', password: 'gestor123', rol: 'Gestor de Inventario' },
        { username: 'bodeguero1', password: 'bodega123', rol: 'Encargado de Bodega' },
        { username: 'auditor1', password: 'audit123', rol: 'Auditor' },
        { username: 'comprador1', password: 'compra123', rol: 'Comprador' },
        { username: 'jefeprod1', password: 'prod123', rol: 'Jefe de Producción' },
        { username: 'trabajador1', password: 'trab123', rol: 'Trabajador de Planta' }
    ];
    
    for (const user of usuariosInfo) {
        console.log(`\n${user.rol}:`);
        console.log(`  Usuario: ${user.username}`);
        console.log(`  Contraseña: ${user.password}`);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Reinicia el sistema eliminando todos los datos
 * ⚠️ USAR CON PRECAUCIÓN - Elimina todos los datos
 */
function resetSistema() {
    if (confirm('ADVERTENCIA: Esto eliminará TODOS los datos del sistema. ¿Estás seguro?')) {
        console.log('Reiniciando sistema...');
        StorageManager.clear();
        console.log('Sistema reiniciado. Recarga la página para inicializar nuevamente.');
        return true;
    }
    return false;
}

/**
 * Actualiza los datos mock (útil durante desarrollo)
 */
function actualizarDatosMock() {
    console.log('🔄 Actualizando datos mock...');
    
    try {
        // Actualizar solo los datos que no son dinámicos
        StorageManager.setItem(STORAGE_KEYS.CATEGORIAS, MOCK_CATEGORIAS);
        StorageManager.setItem(STORAGE_KEYS.PROVEEDORES, MOCK_PROVEEDORES);
        
        // Actualizar configuración
        const appConfig = StorageManager.getItem(STORAGE_KEYS.APP_CONFIG);
        if (appConfig) {
            appConfig.ultima_actualizacion = new Date().toISOString();
            StorageManager.setItem(STORAGE_KEYS.APP_CONFIG, appConfig);
        }
        
        console.log('Datos actualizados correctamente');
        return true;
    } catch (error) {
        console.error('Error al actualizar datos:', error);
        return false;
    }
}

/**
 * Obtiene estadísticas del sistema
 */
function getEstadisticasSistema() {
    const stats = {
        usuarios: UsuarioStorage.getAll().length,
        piezas: PiezaStorage.getAll().length,
        categorias: CategoriaStorage.getAll().length,
        movimientos: MovimientoStorage.getAll().length,
        solicitudes: SolicitudStorage.getAll().length,
        notificaciones: NotificacionStorage.getAll().length,
        stock_bajo: PiezaStorage.getStockBajo().length,
        stock_critico: PiezaStorage.getStockCritico().length,
        tamaño_storage: StorageManager.getSizeFormatted(),
        inicializado: StorageManager.exists(STORAGE_KEYS.APP_INITIALIZED),
        config: StorageManager.getItem(STORAGE_KEYS.APP_CONFIG)
    };
    
    return stats;
}

/**
 * Muestra estadísticas del sistema en consola
 */
function mostrarEstadisticas() {
    const stats = getEstadisticasSistema();
    
    console.log('\n' + '='.repeat(60));
    console.log('ESTADÍSTICAS DEL SISTEMA');
    console.log('='.repeat(60));
    console.log(`Usuarios registrados: ${stats.usuarios}`);
    console.log(`Piezas en inventario: ${stats.piezas}`);
    console.log(`Categorías: ${stats.categorias}`);
    console.log(`Movimientos registrados: ${stats.movimientos}`);
    console.log(`Solicitudes: ${stats.solicitudes}`);
    console.log(`Notificaciones: ${stats.notificaciones}`);
    console.log(`Piezas con stock bajo: ${stats.stock_bajo}`);
    console.log(`Piezas con stock crítico: ${stats.stock_critico}`);
    console.log(`Tamaño en storage: ${stats.tamaño_storage}`);
    console.log('='.repeat(60) + '\n');
    
    return stats;
}

/**
 * Exporta todos los datos del sistema como JSON
 * Útil para respaldos o debugging
 */
function exportarDatos() {
    const datos = {
        exportado_en: new Date().toISOString(),
        version: CONFIG.APP_VERSION,
        usuarios: UsuarioStorage.getAll(),
        piezas: PiezaStorage.getAll(),
        categorias: CategoriaStorage.getAll(),
        movimientos: MovimientoStorage.getAll(),
        solicitudes: SolicitudStorage.getAll(),
        notificaciones: NotificacionStorage.getAll(),
        config: StorageManager.getItem(STORAGE_KEYS.APP_CONFIG)
    };
    
    const dataStr = JSON.stringify(datos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `maestranza_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('✅ Datos exportados correctamente');
}

// Funciones disponibles en consola para debugging
globalThis.resetSistema = resetSistema;
globalThis.mostrarEstadisticas = mostrarEstadisticas;
globalThis.exportarDatos = exportarDatos;
globalThis.actualizarDatosMock = actualizarDatosMock;
globalThis.getEstadisticasSistema = getEstadisticasSistema;
// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMockData,
        resetSistema,
        actualizarDatosMock,
        getEstadisticasSistema,
        mostrarEstadisticas,
        exportarDatos
    };
}