class Router {
    static init() {
        // Manejar navegación inicial basada en URL (si usas hash)
        globalThis.addEventListener('load', () => this.handleRoute());
        globalThis.addEventListener('hashchange', () => this.handleRoute());
    }

    static handleRoute() {
        const hash = globalThis.location.hash.slice(1) || '/dashboard';
        console.log('Navegando a:', hash);
        App.navigate(hash);
    }
}

// Sobrescribir App.navigate para usar los controladores
App.navigate = function(ruta) {
    switch(ruta) {
        case '/dashboard': DashboardController.init(); break;
        case '/inventario': InventarioController.init(); break;
        case '/movimientos': MovimientoController.init(); break;
        case '/solicitudes': SolicitudController.init(); break;
        case '/reportes': ReporteController.init(); break;
        case '/login': LoginController.init(); break;
        case '/notificaciones': NotificacionController.init(); break;
        case '/disponibilidad': DisponibilidadController.init(); break;
        case '/ordenes': OrdenesController.init(); break;
        case '/configuracion': ConfiguracionController.init(); break;
        default: DashboardController.init();
    }
    // Actualizar active en sidebar
    for (const el of document.querySelectorAll('.sidebar-nav-item')) {
        el.classList.remove('active');
        if(el.dataset.route === ruta) el.classList.add('active');
    }
};