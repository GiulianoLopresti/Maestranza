// ============================================
// SERVICIO DE RESPALDO AUTOMÁTICO
// HU #9 - Respaldo ante cortes de energía
// ============================================

/**
 * Servicio para gestionar respaldos automáticos del sistema
 * Realiza backups periódicos y ante cambios críticos
 */
class BackupService {
    
    static BACKUP_INTERVAL = 60 * 60 * 1000; // 1 hora
    static MAX_BACKUPS = 10; // Máximo de respaldos a mantener
    static intervalId = null;
    
    /**
     * Inicializa el sistema de respaldo automático
     */
    static init() {
        console.log('💾 Inicializando sistema de respaldo automático...');
        
        // Verificar si hay respaldos previos
        this.verificarRespaldos();
        
        // Programar respaldo periódico
        this.programarRespaldoAutomatico();
        
        // Listener para respaldo ante cierre de página
        globalThis.addEventListener('beforeunload', () => {
            this.crearRespaldo('manual', 'Respaldo antes de cerrar sesión');
        });
        
        // Listener para detectar online/offline
        globalThis.addEventListener('offline', () => {
            console.warn('⚠️ Conexión perdida - Creando respaldo de emergencia');
            this.crearRespaldo('emergencia', 'Respaldo por pérdida de conexión');
        });
        
        globalThis.addEventListener('online', () => {
            console.log('✅ Conexión restaurada');
        });
        
        console.log('✅ Sistema de respaldo configurado');
    }
    
    /**
     * Crea un respaldo completo del sistema
     * @param {string} tipo - Tipo de respaldo (automatico, manual, emergencia)
     * @param {string} descripcion - Descripción del respaldo
     * @returns {Object}
     */
    static crearRespaldo(tipo = 'automatico', descripcion = '') {
        try {
            const timestamp = new Date().toISOString();
            
            // Recopilar todos los datos del sistema
            const datos = {
                version: CONFIG.APP_VERSION,
                timestamp,
                tipo,
                descripcion,
                tamaño: StorageManager.getSize(),
                datos: {
                    usuarios: UsuarioStorage.getAll(),
                    piezas: PiezaStorage.getAll(),
                    categorias: CategoriaStorage.getAll(),
                    movimientos: MovimientoStorage.getAll(),
                    solicitudes: SolicitudStorage.getAll(),
                    solicitudes_detalle: StorageManager.getItem(STORAGE_KEYS.SOLICITUDES_DETALLE, []),
                    notificaciones: NotificacionStorage.getAll(),
                    proyectos: StorageManager.getItem(STORAGE_KEYS.PROYECTOS, []),
                    proveedores: StorageManager.getItem(STORAGE_KEYS.PROVEEDORES, []),
                    kits: StorageManager.getItem(STORAGE_KEYS.KITS, []),
                    kits_detalle: StorageManager.getItem(STORAGE_KEYS.KITS_DETALLE, []),
                    incidencias: StorageManager.getItem(STORAGE_KEYS.INCIDENCIAS, []),
                    reportes_programados: StorageManager.getItem(STORAGE_KEYS.REPORTES_PROGRAMADOS, []),
                    piezas_categorias: StorageManager.getItem('piezas_categorias', []),
                    ordenes_compra: StorageManager.getItem('ordenes_compra', []),
                    config_reposicion: StorageManager.getItem('config_reposicion_automatica', {}),
                    app_config: StorageManager.getItem(STORAGE_KEYS.APP_CONFIG, {})
                }
            };
            
            // Guardar respaldo
            const backupId = `backup_${Date.now()}`;
            const backup = {
                id: backupId,
                timestamp,
                tipo,
                descripcion,
                tamaño: JSON.stringify(datos).length,
                datos
            };
            
            // Obtener respaldos existentes
            let backups = this.getBackups();
            
            // Agregar nuevo respaldo
            backups.push(backup);
            
            // Mantener solo los últimos MAX_BACKUPS
            if (backups.length > this.MAX_BACKUPS) {
                backups = backups.slice(-this.MAX_BACKUPS);
            }
            
            // Guardar lista de respaldos
            StorageManager.setItem('system_backups', backups);
            
            console.log(`✅ Respaldo creado: ${backupId} (${this.formatBytes(backup.tamaño)})`);
            
            return backup;
            
        } catch (error) {
            console.error('❌ Error al crear respaldo:', error);
            return null;
        }
    }
    
    /**
     * Obtiene todos los respaldos
     * @returns {Array}
     */
    static getBackups() {
        return StorageManager.getItem('system_backups', []);
    }
    
    /**
     * Obtiene un respaldo por ID
     * @param {string} id - ID del respaldo
     * @returns {Object|null}
     */
    static getBackupById(id) {
        const backups = this.getBackups();
        return backups.find(b => b.id === id) || null;
    }
    
    /**
     * Restaura el sistema desde un respaldo
     * @param {string} backupId - ID del respaldo
     * @returns {boolean}
     */
    static restaurarRespaldo(backupId) {
        try {
            const backup = this.getBackupById(backupId);
            if (!backup) {
                console.error('Respaldo no encontrado');
                return false;
            }
            
            console.log(`🔄 Restaurando respaldo: ${backupId}...`);
            
            const datos = backup.datos;
            
            // Restaurar todos los datos
            StorageManager.setItem(STORAGE_KEYS.USUARIOS, datos.usuarios);
            StorageManager.setItem(STORAGE_KEYS.PIEZAS, datos.piezas);
            StorageManager.setItem(STORAGE_KEYS.CATEGORIAS, datos.categorias);
            StorageManager.setItem(STORAGE_KEYS.MOVIMIENTOS, datos.movimientos);
            StorageManager.setItem(STORAGE_KEYS.SOLICITUDES, datos.solicitudes);
            StorageManager.setItem(STORAGE_KEYS.SOLICITUDES_DETALLE, datos.solicitudes_detalle);
            StorageManager.setItem(STORAGE_KEYS.NOTIFICACIONES, datos.notificaciones);
            StorageManager.setItem(STORAGE_KEYS.PROYECTOS, datos.proyectos);
            StorageManager.setItem(STORAGE_KEYS.PROVEEDORES, datos.proveedores);
            StorageManager.setItem(STORAGE_KEYS.KITS, datos.kits);
            StorageManager.setItem(STORAGE_KEYS.KITS_DETALLE, datos.kits_detalle);
            StorageManager.setItem(STORAGE_KEYS.INCIDENCIAS, datos.incidencias);
            StorageManager.setItem(STORAGE_KEYS.REPORTES_PROGRAMADOS, datos.reportes_programados);
            StorageManager.setItem('piezas_categorias', datos.piezas_categorias);
            StorageManager.setItem('ordenes_compra', datos.ordenes_compra || []);
            StorageManager.setItem('config_reposicion_automatica', datos.config_reposicion || {});
            StorageManager.setItem(STORAGE_KEYS.APP_CONFIG, datos.app_config);
            
            console.log('✅ Respaldo restaurado exitosamente');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error al restaurar respaldo:', error);
            return false;
        }
    }
    
    /**
     * Elimina un respaldo
     * @param {string} backupId - ID del respaldo
     * @returns {boolean}
     */
    static eliminarRespaldo(backupId) {
        try {
            let backups = this.getBackups();
            backups = backups.filter(b => b.id !== backupId);
            StorageManager.setItem('system_backups', backups);
            console.log(`🗑️ Respaldo eliminado: ${backupId}`);
            return true;
        } catch (error) {
            console.error('Error al eliminar respaldo:', error);
            return false;
        }
    }
    
    /**
     * Descarga un respaldo como archivo JSON
     * @param {string} backupId - ID del respaldo
     */
    static descargarRespaldo(backupId) {
        const backup = this.getBackupById(backupId);
        if (!backup) {
            Toast.error('Respaldo no encontrado');
            return;
        }
        
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${backup.id}_${backup.timestamp.split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        Toast.success('Respaldo descargado exitosamente');
    }
    
    /**
     * Programa respaldos automáticos periódicos
     */
    static programarRespaldoAutomatico() {
        // Limpiar intervalo anterior si existe
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Programar nuevo intervalo
        this.intervalId = setInterval(() => {
            console.log('⏰ Ejecutando respaldo automático programado...');
            this.crearRespaldo('automatico', 'Respaldo automático programado');
        }, this.BACKUP_INTERVAL);
        
        console.log(`⏰ Respaldo automático programado cada ${this.BACKUP_INTERVAL / 60000} minutos`);
    }
    
    /**
     * Detiene los respaldos automáticos
     */
    static detenerRespaldoAutomatico() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏸️ Respaldo automático detenido');
        }
    }
    
    /**
     * Verifica la integridad de los respaldos
     */
    static verificarRespaldos() {
        const backups = this.getBackups();
        console.log(`📊 Respaldos disponibles: ${backups.length}`);
        
        if (backups.length > 0) {
            const ultimo = backups[backups.length - 1];
            console.log(`📅 Último respaldo: ${formatearFechaHora(ultimo.timestamp)} (${this.formatBytes(ultimo.tamaño)})`);
        } else {
            console.log('ℹ️ No hay respaldos previos');
            // Crear primer respaldo
            this.crearRespaldo('automatico', 'Primer respaldo del sistema');
        }
    }
    
    /**
     * Obtiene estadísticas de los respaldos
     * @returns {Object}
     */
    static getEstadisticas() {
        const backups = this.getBackups();
        const tamañoTotal = backups.reduce((sum, b) => sum + b.tamaño, 0);
        
        return {
            total: backups.length,
            tamañoTotal: this.formatBytes(tamañoTotal),
            ultimoRespaldo: backups.length > 0 ? backups[backups.length - 1].timestamp : null,
            porTipo: {
                automatico: backups.filter(b => b.tipo === 'automatico').length,
                manual: backups.filter(b => b.tipo === 'manual').length,
                emergencia: backups.filter(b => b.tipo === 'emergencia').length
            }
        };
    }
    
    /**
     * Formatea bytes a formato legible
     * @param {number} bytes
     * @returns {string}
     */
    static formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    
    /**
     * Crea un respaldo manual desde la interfaz
     */
    static crearRespaldoManual() {
        const backup = this.crearRespaldo('manual', 'Respaldo manual creado por el usuario');
        if (backup) {
            Toast.success('Respaldo creado exitosamente');
            return backup;
        } else {
            Toast.error('Error al crear respaldo');
            return null;
        }
    }
}

// Inicializar sistema de respaldo al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    BackupService.init();
});

// Funciones globales para consola
globalThis.crearBackup = () => BackupService.crearRespaldoManual();
globalThis.verBackups = () => {
    const stats = BackupService.getEstadisticas();
    console.table(stats);
    return BackupService.getBackups();
};
globalThis.restaurarBackup = (id) => {
    if (confirm('⚠️ ¿Estás seguro? Esto sobrescribirá todos los datos actuales.')) {
        const success = BackupService.restaurarRespaldo(id);
        if (success) {
            alert('✅ Respaldo restaurado. La página se recargará.');
            globalThis.location.reload();
        }
    }
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackupService;
}