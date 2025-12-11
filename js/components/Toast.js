// ============================================
// COMPONENTE TOAST - Notificaciones
// Maestranza Unidos S.A.
// ============================================

/**
 * Sistema de notificaciones toast estilo moderno
 * Muestra mensajes temporales en la esquina superior derecha
 */
class Toast {
    
    /**
     * Muestra una notificación de éxito
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} duracion - Duración en ms (default: 5000)
     */
    static success(mensaje, duracion = 5000) {
        this.show(mensaje, 'success', duracion);
    }
    
    /**
     * Muestra una notificación de error
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} duracion - Duración en ms (default: 6000)
     */
    static error(mensaje, duracion = 6000) {
        this.show(mensaje, 'error', duracion);
    }
    
    /**
     * Muestra una notificación de advertencia
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} duracion - Duración en ms (default: 5000)
     */
    static warning(mensaje, duracion = 5000) {
        this.show(mensaje, 'warning', duracion);
    }
    
    /**
     * Muestra una notificación informativa
     * @param {string} mensaje - Mensaje a mostrar
     * @param {number} duracion - Duración en ms (default: 4000)
     */
    static info(mensaje, duracion = 4000) {
        this.show(mensaje, 'info', duracion);
    }
    
    /**
     * Muestra una notificación genérica
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de notificación (success, error, warning, info)
     * @param {number} duracion - Duración en ms
     */
    static show(mensaje, tipo = 'info', duracion = 5000) {
        const container = this.getContainer();
        const toast = this.createToast(mensaje, tipo);
        
        container.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto-cerrar después de la duración
        if (duracion > 0) {
            setTimeout(() => {
                this.close(toast);
            }, duracion);
        }
        
        // Limitar número de toasts visibles
        this.limitToasts();
    }
    
    /**
     * Obtiene o crea el contenedor de toasts
     * @returns {HTMLElement}
     */
    static getContainer() {
        let container = document.getElementById('toast-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        return container;
    }
    
    /**
     * Crea un elemento toast
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} tipo - Tipo de notificación
     * @returns {HTMLElement}
     */
    static createToast(mensaje, tipo) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        
        const iconos = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        const titulos = {
            success: 'Éxito',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${iconos[tipo]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${titulos[tipo]}</div>
                <div class="toast-message">${escaparHTML(mensaje)}</div>
            </div>
            <button class="toast-close" onclick="Toast.close(this.parentElement)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        return toast;
    }
    
    /**
     * Cierra un toast específico
     * @param {HTMLElement} toast - Elemento toast a cerrar
     */
    static close(toast) {
        if (!toast) return;
        
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }
    
    /**
     * Limita el número de toasts visibles
     */
    static limitToasts() {
        const container = this.getContainer();
        const toasts = container.querySelectorAll('.toast');
        const maxToasts = CONFIG.NOTIFICATIONS.MAX_DISPLAYED || 5;
        
        if (toasts.length > maxToasts) {
            // Cerrar los más antiguos
            for (let i = 0; i < toasts.length - maxToasts; i++) {
                this.close(toasts[i]);
            }
        }
    }
    
    /**
     * Cierra todos los toasts
     */
    static closeAll() {
        const container = this.getContainer();
        const toasts = container.querySelectorAll('.toast');
        
        for (const toast of toasts) {
            this.close(toast);
        }
    }
    
    /**
     * Muestra un toast de confirmación con botones
     * @param {string} mensaje - Mensaje a mostrar
     * @param {Function} onConfirm - Callback al confirmar
     * @param {Function} onCancel - Callback al cancelar
     */
    static confirm(mensaje, onConfirm, onCancel) {
        const container = this.getContainer();
        const toast = document.createElement('div');
        toast.className = 'toast toast-confirm';
        
        const confirmId = generarID();
        const cancelId = generarID();
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-question-circle"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">Confirmación</div>
                <div class="toast-message">${escaparHTML(mensaje)}</div>
                <div class="toast-actions">
                    <button class="btn btn-sm btn-primary" id="${confirmId}">
                        <i class="fas fa-check me-1"></i> Confirmar
                    </button>
                    <button class="btn btn-sm btn-secondary" id="${cancelId}">
                        <i class="fas fa-times me-1"></i> Cancelar
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Event listeners
        document.getElementById(confirmId).addEventListener('click', () => {
            this.close(toast);
            if (onConfirm) onConfirm();
        });
        
        document.getElementById(cancelId).addEventListener('click', () => {
            this.close(toast);
            if (onCancel) onCancel();
        });
    }
    
    /**
     * Muestra un toast con acción personalizada
     * @param {string} mensaje - Mensaje a mostrar
     * @param {string} textoBoton - Texto del botón de acción
     * @param {Function} onAction - Callback al hacer clic en la acción
     * @param {number} duracion - Duración en ms (0 = no auto-cerrar)
     */
    static action(mensaje, textoBoton, onAction, duracion = 0) {
        const container = this.getContainer();
        const toast = document.createElement('div');
        toast.className = 'toast toast-action';
        
        const actionId = generarID();
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="toast-content">
                <div class="toast-message">${escaparHTML(mensaje)}</div>
                <button class="btn btn-sm btn-outline-primary mt-2" id="${actionId}">
                    ${escaparHTML(textoBoton)}
                </button>
            </div>
            <button class="toast-close" onclick="Toast.close(this.parentElement)">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Event listener
        document.getElementById(actionId).addEventListener('click', () => {
            this.close(toast);
            if (onAction) onAction();
        });
        
        // Auto-cerrar si hay duración
        if (duracion > 0) {
            setTimeout(() => {
                this.close(toast);
            }, duracion);
        }
    }
}

// Agregar estilos CSS para los toasts
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 400px;
        pointer-events: none;
    }
    
    .toast {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: var(--white);
        border-radius: var(--radius-xl);
        padding: 16px;
        box-shadow: var(--shadow-xl);
        border-left: 4px solid;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
        min-width: 300px;
    }
    
    .toast.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .toast.hide {
        opacity: 0;
        transform: translateX(400px);
    }
    
    .toast-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
    }
    
    .toast-content {
        flex: 1;
        min-width: 0;
    }
    
    .toast-title {
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-sm);
        margin-bottom: 4px;
        color: var(--dark-slate);
    }
    
    .toast-message {
        font-size: var(--font-size-sm);
        color: var(--gray-700);
        line-height: 1.4;
        word-wrap: break-word;
    }
    
    .toast-close {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: var(--gray-500);
        cursor: pointer;
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
        padding: 0;
    }
    
    .toast-close:hover {
        color: var(--gray-700);
        background: var(--gray-100);
    }
    
    .toast-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
    }
    
    .toast-actions .btn {
        font-size: var(--font-size-xs);
        padding: 6px 12px;
    }
    
    /* Tipos de toast */
    .toast-success {
        border-left-color: var(--success);
    }
    
    .toast-success .toast-icon {
        color: var(--success);
    }
    
    .toast-error {
        border-left-color: var(--danger);
    }
    
    .toast-error .toast-icon {
        color: var(--danger);
    }
    
    .toast-warning {
        border-left-color: var(--warning);
    }
    
    .toast-warning .toast-icon {
        color: var(--warning);
    }
    
    .toast-info {
        border-left-color: var(--info);
    }
    
    .toast-info .toast-icon {
        color: var(--info);
    }
    
    .toast-confirm {
        border-left-color: var(--primary-green);
    }
    
    .toast-confirm .toast-icon {
        color: var(--primary-green);
    }
    
    .toast-action {
        border-left-color: var(--desert-primary);
    }
    
    .toast-action .toast-icon {
        color: var(--desert-primary);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .toast-container {
            right: 12px;
            left: 12px;
            max-width: none;
        }
        
        .toast {
            min-width: auto;
        }
    }
`;

document.head.appendChild(toastStyles);

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Toast;
}