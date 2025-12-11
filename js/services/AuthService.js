// ============================================
// SERVICIO DE AUTENTICACIÓN
// Maestranza Unidos S.A.
// ============================================

/**
 * Servicio para manejar la autenticación de usuarios
 * Incluye login, logout, registro y gestión de sesión
 */
class AuthService {
    
    /**
     * Inicia sesión de un usuario
     * @param {string} username - Nombre de usuario
     * @param {string} password - Contraseña
     * @returns {Object} - { success: boolean, user?: Object, message: string }
     */
    static login(username, password) {
        try {
            // Validar campos vacíos
            if (!username || !password) {
                return {
                    success: false,
                    message: 'Por favor ingresa usuario y contraseña'
                };
            }
            
            // Buscar usuario
            const user = UsuarioStorage.findByUsername(username);
            
            if (!user) {
                return {
                    success: false,
                    message: 'Usuario no encontrado'
                };
            }
            
            // Verificar si está activo
            if (!user.activo) {
                return {
                    success: false,
                    message: 'Usuario inactivo. Contacta al administrador'
                };
            }
            
            // Verificar contraseña (en producción usar bcrypt)
            if (user.password !== password) {
                return {
                    success: false,
                    message: 'Contraseña incorrecta'
                };
            }
            
            // Generar token (simulado)
            const token = this.generateToken();
            
            // Guardar sesión
            const sessionData = {
                id: user.id,
                username: user.username,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                token: token,
                login_at: new Date().toISOString()
            };
            
            StorageManager.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
            StorageManager.setItem(STORAGE_KEYS.CURRENT_USER, sessionData);
            
            // Log de actividad
            console.log(`✅ Login exitoso: ${user.nombre} (${user.rol})`);
            
            return {
                success: true,
                user: sessionData,
                message: MENSAJES.LOGIN_SUCCESS
            };
            
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                message: 'Error al iniciar sesión. Intenta nuevamente'
            };
        }
    }
    
    /**
     * Registra un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @returns {Object} - { success: boolean, user?: Object, message: string }
     */
    static register(userData) {
        try {
            // Validar datos requeridos
            const validation = this.validateRegisterData(userData);
            if (!validation.valid) {
                return {
                    success: false,
                    message: validation.message
                };
            }
            
            // Verificar si el usuario ya existe
            const existingUser = UsuarioStorage.findByUsername(userData.username);
            if (existingUser) {
                return {
                    success: false,
                    message: 'El nombre de usuario ya está en uso'
                };
            }
            
            // Verificar si el email ya existe
            const existingEmail = UsuarioStorage.findByEmail(userData.email);
            if (existingEmail) {
                return {
                    success: false,
                    message: 'El correo electrónico ya está registrado'
                };
            }
            
            // Crear nuevo usuario
            const newUser = UsuarioStorage.create({
                username: userData.username.trim(),
                password: userData.password, // En producción: hashear con bcrypt
                nombre: userData.nombre.trim(),
                email: userData.email.trim().toLowerCase(),
                rol: userData.rol
            });
            
            console.log(`✅ Usuario registrado: ${newUser.nombre} (${newUser.rol})`);
            
            return {
                success: true,
                user: newUser,
                message: MENSAJES.REGISTRO_SUCCESS
            };
            
        } catch (error) {
            console.error('Error en registro:', error);
            return {
                success: false,
                message: 'Error al crear la cuenta. Intenta nuevamente'
            };
        }
    }
    
    /**
     * Cierra la sesión del usuario actual
     * @returns {boolean}
     */
    static logout() {
        try {
            const currentUser = this.getCurrentUser();
            
            if (currentUser) {
                console.log(`👋 Logout: ${currentUser.nombre}`);
            }
            
            // Limpiar sesión
            StorageManager.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            StorageManager.removeItem(STORAGE_KEYS.CURRENT_USER);
            
            return true;
        } catch (error) {
            console.error('Error en logout:', error);
            return false;
        }
    }
    
    /**
     * Obtiene el usuario actualmente autenticado
     * @returns {Object|null}
     */
    static getCurrentUser() {
        return StorageManager.getItem(STORAGE_KEYS.CURRENT_USER, null);
    }
    
    /**
     * Verifica si hay un usuario autenticado
     * @returns {boolean}
     */
    static isAuthenticated() {
        const token = StorageManager.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const user = this.getCurrentUser();
        return !!(token && user);
    }
    
    /**
     * Verifica si el usuario tiene un permiso específico
     * @param {string} permiso - Permiso a verificar
     * @returns {boolean}
     */
    static tienePermiso(permiso) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        return tienePermiso(user.rol, permiso);
    }
    
    /**
     * Verifica si el usuario tiene alguno de los roles especificados
     * @param {string|string[]} roles - Rol o array de roles
     * @returns {boolean}
     */
    static tieneRol(roles) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        if (Array.isArray(roles)) {
            return roles.includes(user.rol);
        }
        
        return user.rol === roles;
    }
    
    /**
     * Verifica si el usuario es administrador
     * @returns {boolean}
     */
    static isAdmin() {
        return this.tieneRol(ROLES.ADMIN);
    }
    
    /**
     * Actualiza el perfil del usuario actual
     * @param {Object} data - Datos a actualizar
     * @returns {Object} - { success: boolean, user?: Object, message: string }
     */
    static updateProfile(data) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return {
                    success: false,
                    message: 'No hay sesión activa'
                };
            }
            
            // Actualizar en la base de datos
            const updatedUser = UsuarioStorage.update(currentUser.id, {
                nombre: data.nombre || currentUser.nombre,
                email: data.email || currentUser.email
            });
            
            if (!updatedUser) {
                return {
                    success: false,
                    message: 'Error al actualizar perfil'
                };
            }
            
            // Actualizar sesión
            const sessionData = {
                ...currentUser,
                nombre: updatedUser.nombre,
                email: updatedUser.email
            };
            
            StorageManager.setItem(STORAGE_KEYS.CURRENT_USER, sessionData);
            
            return {
                success: true,
                user: sessionData,
                message: 'Perfil actualizado correctamente'
            };
            
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            return {
                success: false,
                message: 'Error al actualizar perfil'
            };
        }
    }
    
    /**
     * Cambia la contraseña del usuario actual
     * @param {string} oldPassword - Contraseña actual
     * @param {string} newPassword - Nueva contraseña
     * @returns {Object} - { success: boolean, message: string }
     */
    static changePassword(oldPassword, newPassword) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return {
                    success: false,
                    message: 'No hay sesión activa'
                };
            }
            
            // Obtener usuario completo
            const user = UsuarioStorage.findById(currentUser.id);
            if (!user) {
                return {
                    success: false,
                    message: 'Usuario no encontrado'
                };
            }
            
            // Verificar contraseña actual
            if (user.password !== oldPassword) {
                return {
                    success: false,
                    message: 'La contraseña actual es incorrecta'
                };
            }
            
            // Validar nueva contraseña
            if (newPassword.length < 6) {
                return {
                    success: false,
                    message: 'La nueva contraseña debe tener al menos 6 caracteres'
                };
            }
            
            // Actualizar contraseña
            UsuarioStorage.update(user.id, {
                password: newPassword // En producción: hashear
            });
            
            return {
                success: true,
                message: 'Contraseña actualizada correctamente'
            };
            
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            return {
                success: false,
                message: 'Error al cambiar contraseña'
            };
        }
    }
    
    /**
     * Valida los datos de registro
     * @param {Object} data - Datos a validar
     * @returns {Object} - { valid: boolean, message?: string }
     */
    static validateRegisterData(data) {
        // Validar username
        if (!data.username || data.username.trim().length < 3) {
            return {
                valid: false,
                message: 'El nombre de usuario debe tener al menos 3 caracteres'
            };
        }
        
        // Validar nombre
        if (!data.nombre || data.nombre.trim().length < 3) {
            return {
                valid: false,
                message: 'El nombre completo debe tener al menos 3 caracteres'
            };
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            return {
                valid: false,
                message: 'Ingresa un correo electrónico válido'
            };
        }
        
        // Validar password
        if (!data.password || data.password.length < 6) {
            return {
                valid: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            };
        }
        
        // Validar rol
        const rolesValidos = Object.values(ROLES);
        if (!data.rol || !rolesValidos.includes(data.rol)) {
            return {
                valid: false,
                message: 'Selecciona un rol válido'
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Genera un token simulado (UUID simple)
     * En producción usar JWT
     * @returns {string}
     */
    static generateToken() {
        return 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    }
    
    /**
     * Obtiene información del usuario con permisos
     * @returns {Object|null}
     */
    static getUserInfo() {
        const user = this.getCurrentUser();
        if (!user) return null;
        
        return {
            ...user,
            permisos: PERMISOS[user.rol] || [],
            isAdmin: user.rol === ROLES.ADMIN,
            icono: getIconoRol(user.rol)
        };
    }
    
    /**
     * Registra actividad del usuario (para auditoría)
     * @param {string} accion - Descripción de la acción
     * @param {Object} datos - Datos adicionales
     */
    static logActivity(accion, datos = {}) {
        const user = this.getCurrentUser();
        if (!user) return;
        
        const logEntry = {
            usuario_id: user.id,
            usuario_nombre: user.nombre,
            accion: accion,
            datos: datos,
            timestamp: new Date().toISOString()
        };
        
        console.log('Actividad:', logEntry);
        
        // En una implementación real, esto se guardaría en una tabla de auditoría
        // Por ahora solo lo mostramos en consola
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}