// ============================================
// CONTROLADOR DE LOGIN/REGISTRO
// Maestranza Unidos S.A.
// ============================================

/**
 * Controlador para manejar la página de login y registro
 */
class LoginController {
    
    /**
     * Inicializa el controlador
     */
    static init() {
        console.log('🔐 Inicializando LoginController...');
        this.render();
        this.setupEventListeners();
    }
    
    /**
     * Renderiza la página de login/registro
     */
    static render() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <!-- Panel Izquierdo -->
                    <div class="login-left">
                        <div class="login-logo">
                            <i class="fas fa-industry"></i>
                        </div>
                        <h1>Maestranza Unidos S.A.</h1>
                        <p>Sistema de Control de Inventarios para la gestión eficiente de piezas y componentes industriales</p>
                    </div>
                    
                    <!-- Panel Derecho -->
                    <div class="login-right">
                        <div class="login-header">
                            <h2 id="formTitle">Iniciar Sesión</h2>
                            <p id="formSubtitle">Ingresa tus credenciales para acceder al sistema</p>
                        </div>
                        
                        <div id="alertContainer"></div>
                        
                        <!-- Formulario de Login -->
                        <form id="loginForm">
                            <div class="form-group">
                                <label class="form-label" for="loginUsername">Usuario</label>
                                <div class="input-group">
                                    <i class="fas fa-user input-icon"></i>
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        id="loginUsername" 
                                        placeholder="Ingresa tu usuario" 
                                        required
                                        autocomplete="username"
                                    >
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="loginPassword">Contraseña</label>
                                <div class="input-group">
                                    <i class="fas fa-lock input-icon"></i>
                                    <input 
                                        type="password" 
                                        class="form-control" 
                                        id="loginPassword" 
                                        placeholder="Ingresa tu contraseña" 
                                        required
                                        autocomplete="current-password"
                                    >
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary w-100" id="loginBtn">
                                <span id="loginBtnText">
                                    <i class="fas fa-sign-in-alt me-2"></i>
                                    Iniciar Sesión
                                </span>
                                <span id="loginBtnSpinner" class="d-none">
                                    <span class="spinner-border spinner-border-sm me-2"></span>
                                    Ingresando...
                                </span>
                            </button>
                            
                            <div class="divider">
                                <span>o</span>
                            </div>
                            
                            <div class="register-link">
                                ¿No tienes cuenta? <a href="#" id="showRegisterBtn">Regístrate aquí</a>
                            </div>
                        </form>
                        
                        <!-- Formulario de Registro -->
                        <form id="registerForm" class="d-none">
                            <div class="form-group">
                                <label class="form-label" for="regUsername">Usuario</label>
                                <div class="input-group">
                                    <i class="fas fa-user input-icon"></i>
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        id="regUsername" 
                                        placeholder="Elige un nombre de usuario" 
                                        required
                                        autocomplete="username"
                                    >
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="regNombre">Nombre Completo</label>
                                <div class="input-group">
                                    <i class="fas fa-id-card input-icon"></i>
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        id="regNombre" 
                                        placeholder="Ingresa tu nombre completo" 
                                        required
                                        autocomplete="name"
                                    >
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="regEmail">Correo Electrónico</label>
                                <div class="input-group">
                                    <i class="fas fa-envelope input-icon"></i>
                                    <input 
                                        type="email" 
                                        class="form-control" 
                                        id="regEmail" 
                                        placeholder="tu@email.com" 
                                        required
                                        autocomplete="email"
                                    >
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Selecciona tu Rol</label>
                                <div class="role-selector" id="roleSelector">
                                    <div class="role-option" data-role="${ROLES.GESTOR}">
                                        <i class="fas fa-boxes"></i>
                                        <span>Gestor de Inventario</span>
                                    </div>
                                    <div class="role-option" data-role="${ROLES.BODEGUERO}">
                                        <i class="fas fa-warehouse"></i>
                                        <span>Encargado de Bodega</span>
                                    </div>
                                    <div class="role-option" data-role="${ROLES.AUDITOR}">
                                        <i class="fas fa-clipboard-check"></i>
                                        <span>Auditor</span>
                                    </div>
                                    <div class="role-option" data-role="${ROLES.COMPRADOR}">
                                        <i class="fas fa-shopping-cart"></i>
                                        <span>Comprador</span>
                                    </div>
                                    <div class="role-option" data-role="${ROLES.JEFE_PROD}">
                                        <i class="fas fa-cogs"></i>
                                        <span>Jefe de Producción</span>
                                    </div>
                                    <div class="role-option" data-role="${ROLES.TRABAJADOR}">
                                        <i class="fas fa-hard-hat"></i>
                                        <span>Trabajador de Planta</span>
                                    </div>
                                </div>
                                <input type="hidden" id="regRol" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="regPassword">Contraseña</label>
                                <div class="input-group">
                                    <i class="fas fa-lock input-icon"></i>
                                    <input 
                                        type="password" 
                                        class="form-control" 
                                        id="regPassword" 
                                        placeholder="Crea una contraseña segura (mín. 6 caracteres)" 
                                        required
                                        autocomplete="new-password"
                                    >
                                </div>
                            </div>
                            
                            <button type="submit" class="btn btn-primary w-100" id="registerBtn">
                                <span id="registerBtnText">
                                    <i class="fas fa-user-plus me-2"></i>
                                    Crear Cuenta
                                </span>
                                <span id="registerBtnSpinner" class="d-none">
                                    <span class="spinner-border spinner-border-sm me-2"></span>
                                    Creando cuenta...
                                </span>
                            </button>
                            
                            <div class="divider">
                                <span>o</span>
                            </div>
                            
                            <div class="register-link">
                                ¿Ya tienes cuenta? <a href="#" id="showLoginBtn">Inicia sesión aquí</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Configura los event listeners
     */
    static setupEventListeners() {
        // Toggle entre login y registro
        document.getElementById('showRegisterBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });
        
        document.getElementById('showLoginBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });
        
        // Selector de roles
        for (const option of document.querySelectorAll('.role-option')) {
            option.addEventListener('click', () => {
                this.selectRole(option);
            });
        }
        
        // Formulario de login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Formulario de registro
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }
    
    /**
     * Muestra el formulario de registro
     */
    static showRegisterForm() {
        document.getElementById('loginForm').classList.add('d-none');
        document.getElementById('registerForm').classList.remove('d-none');
        document.getElementById('formTitle').textContent = 'Crear Cuenta';
        document.getElementById('formSubtitle').textContent = 'Completa el formulario para registrarte';
        this.clearAlerts();
    }
    
    /**
     * Muestra el formulario de login
     */
    static showLoginForm() {
        document.getElementById('registerForm').classList.add('d-none');
        document.getElementById('loginForm').classList.remove('d-none');
        document.getElementById('formTitle').textContent = 'Iniciar Sesión';
        document.getElementById('formSubtitle').textContent = 'Ingresa tus credenciales para acceder al sistema';
        this.clearAlerts();
    }
    
    /**
     * Selecciona un rol en el formulario de registro
     * @param {HTMLElement} option - Elemento de rol seleccionado
     */
    static selectRole(option) {
        for (const opt of document.querySelectorAll('.role-option')) {
            opt.classList.remove('active');
        }
        option.classList.add('active');
        document.getElementById('regRol').value = option.dataset.role;
    }
    
    /**
     * Maneja el login
     */
    static async handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        // Mostrar loading
        this.setLoadingState('login', true);
        
        // Simular delay de red (para mejor UX)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Intentar login
        const result = AuthService.login(username, password);
        
        if (result.success) {
            this.showAlert(result.message, 'success');
            
            // Registrar actividad
            AuthService.logActivity('Login exitoso', { username });
            
            // Redirigir al dashboard después de un breve delay
            setTimeout(() => {
                globalThis.location.reload(); // Recarga para cargar el dashboard
            }, 1000);
        } else {
            this.showAlert(result.message, 'danger');
            this.setLoadingState('login', false);
            
            // Shake animation en error
            const form = document.getElementById('loginForm');
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
        }
    }
    
    /**
     * Maneja el registro
     */
    static async handleRegister() {
        const username = document.getElementById('regUsername').value.trim();
        const nombre = document.getElementById('regNombre').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const rol = document.getElementById('regRol').value;
        const password = document.getElementById('regPassword').value;
        
        // Validar que se haya seleccionado un rol
        if (!rol) {
            this.showAlert('Por favor selecciona un rol', 'warning');
            return;
        }
        
        // Mostrar loading
        this.setLoadingState('register', true);
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Intentar registro
        const result = AuthService.register({
            username,
            nombre,
            email,
            rol,
            password
        });
        
        if (result.success) {
            this.showAlert(result.message, 'success');
            Toast.success('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión');
            
            // Cambiar a formulario de login después de un breve delay
            setTimeout(() => {
                this.showLoginForm();
                this.setLoadingState('register', false);
                
                // Limpiar formulario
                document.getElementById('registerForm').reset();
                for (const opt of document.querySelectorAll('.role-option')) {
                    opt.classList.remove('active');
                }
                
                // Pre-llenar el username en el login
                document.getElementById('loginUsername').value = username;
                document.getElementById('loginPassword').focus();
            }, 2000);
        } else {
            this.showAlert(result.message, 'danger');
            this.setLoadingState('register', false);
        }
    }
    
    /**
     * Muestra una alerta en el formulario
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de alerta (success, danger, warning, info)
     */
    static showAlert(mensaje, tipo = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        
        const iconos = {
            success: 'fa-check-circle',
            danger: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        alertContainer.innerHTML = `
            <div class="alert alert-${tipo} show">
                <i class="fas ${iconos[tipo]}"></i>
                ${escaparHTML(mensaje)}
            </div>
        `;
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                alert.classList.remove('show');
                setTimeout(() => {
                    alertContainer.innerHTML = '';
                }, 300);
            }
        }, 5000);
    }
    
    /**
     * Limpia las alertas
     */
    static clearAlerts() {
        document.getElementById('alertContainer').innerHTML = '';
    }
    
    /**
     * Establece el estado de loading en un formulario
     * @param {string} form - 'login' o 'register'
     * @param {boolean} loading - Estado de loading
     */
    static setLoadingState(form, loading) {
        const prefix = form === 'login' ? 'login' : 'register';
        const btnText = document.getElementById(`${prefix}BtnText`);
        const btnSpinner = document.getElementById(`${prefix}BtnSpinner`);
        const btn = document.getElementById(`${prefix}Btn`);
        
        if (loading) {
            btnText.classList.add('d-none');
            btnSpinner.classList.remove('d-none');
            btn.disabled = true;
        } else {
            btnText.classList.remove('d-none');
            btnSpinner.classList.add('d-none');
            btn.disabled = false;
        }
    }
}

// Agregar animación de shake para errores
const shakeStyles = document.createElement('style');
shakeStyles.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.5s;
    }
`;
document.head.appendChild(shakeStyles);

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoginController;
}