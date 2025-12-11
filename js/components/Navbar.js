class Navbar {
    static render(titulo = 'Dashboard') {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return '';
        
        // Buscar notificaciones no leídas (Simulado)
        const notifCount = NotificacionStorage.getNoLeidas ? NotificacionStorage.getNoLeidas(currentUser.id).length : 0;
        const badgeHtml = notifCount > 0 ? `<span class="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-circle p-1">${notifCount}</span>` : '';

        return `
            <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 py-3">
                <div class="d-flex align-items-center">
                    <button class="btn btn-link d-lg-none me-3" id="sidebarToggle"><i class="fas fa-bars"></i></button>
                    <h4 class="m-0">${titulo}</h4>
                </div>
                
                <div class="ms-auto d-flex align-items-center gap-3">
                    <div class="position-relative cursor-pointer" onclick="App.navigate('/notificaciones')">
                        <i class="fas fa-bell fa-lg text-secondary"></i>
                        ${badgeHtml}
                    </div>
                    <div class="dropdown">
                        <div class="d-flex align-items-center cursor-pointer" data-bs-toggle="dropdown">
                            <div class="avatar-circle me-2 bg-primary text-white d-flex align-items-center justify-content-center rounded-circle" style="width: 35px; height: 35px;">
                                ${currentUser.nombre.charAt(0)}
                            </div>
                            <div class="d-none d-md-block">
                                <small class="d-block fw-bold">${currentUser.nombre}</small>
                                <small class="text-muted" style="font-size: 0.75rem;">${currentUser.rol}</small>
                            </div>
                        </div>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item text-danger" href="#" onclick="handleLogout()"><i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        `;
    }

    static init() {
        // Lógica para toggle sidebar en móvil
        const toggle = document.getElementById('sidebarToggle');
        if(toggle) {
            toggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('active');
            });
        }
    }
    
    // Método auxiliar para actualizar badge dinámicamente
    static updateNotificationBadge() {
        // Implementación futura
    }
}