// ============================================
// DATOS MOCK PARA EL SISTEMA
// Maestranza Unidos S.A.
// ============================================

/**
 * Usuarios de ejemplo con diferentes roles
 */
const MOCK_USUARIOS = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123', // En producción esto estaría hasheado
        nombre: 'Administrador del Sistema',
        email: 'admin@maestranza.cl',
        rol: ROLES.ADMIN,
        activo: true,
        creado_en: '2024-01-15T10:00:00',
        actualizado_en: '2024-01-15T10:00:00'
    },
    {
        id: 2,
        username: 'gestor1',
        password: 'gestor123',
        nombre: 'Carlos Mendoza',
        email: 'carlos.mendoza@maestranza.cl',
        rol: ROLES.GESTOR,
        activo: true,
        creado_en: '2024-01-16T09:00:00',
        actualizado_en: '2024-01-16T09:00:00'
    },
    {
        id: 3,
        username: 'bodeguero1',
        password: 'bodega123',
        nombre: 'María González',
        email: 'maria.gonzalez@maestranza.cl',
        rol: ROLES.BODEGUERO,
        activo: true,
        creado_en: '2024-01-17T08:30:00',
        actualizado_en: '2024-01-17T08:30:00'
    },
    {
        id: 4,
        username: 'auditor1',
        password: 'audit123',
        nombre: 'Roberto Silva',
        email: 'roberto.silva@maestranza.cl',
        rol: ROLES.AUDITOR,
        activo: true,
        creado_en: '2024-01-18T11:00:00',
        actualizado_en: '2024-01-18T11:00:00'
    },
    {
        id: 5,
        username: 'comprador1',
        password: 'compra123',
        nombre: 'Ana Martínez',
        email: 'ana.martinez@maestranza.cl',
        rol: ROLES.COMPRADOR,
        activo: true,
        creado_en: '2024-01-19T10:30:00',
        actualizado_en: '2024-01-19T10:30:00'
    },
    {
        id: 6,
        username: 'jefeprod1',
        password: 'prod123',
        nombre: 'Luis Ramírez',
        email: 'luis.ramirez@maestranza.cl',
        rol: ROLES.JEFE_PROD,
        activo: true,
        creado_en: '2024-01-20T09:15:00',
        actualizado_en: '2024-01-20T09:15:00'
    },
    {
        id: 7,
        username: 'trabajador1',
        password: 'trab123',
        nombre: 'Pedro Flores',
        email: 'pedro.flores@maestranza.cl',
        rol: ROLES.TRABAJADOR,
        activo: true,
        creado_en: '2024-01-21T08:00:00',
        actualizado_en: '2024-01-21T08:00:00'
    }
];

/**
 * Categorías de inventario
 */
const MOCK_CATEGORIAS = [
    {
        id: 1,
        nombre: 'Herramientas Manuales',
        descripcion: 'Herramientas de mano para trabajos de mantenimiento',
        color: '#00684A',
        creado_en: '2024-01-10T10:00:00'
    },
    {
        id: 2,
        nombre: 'Herramientas Eléctricas',
        descripcion: 'Herramientas que funcionan con electricidad',
        color: '#13AA52',
        creado_en: '2024-01-10T10:05:00'
    },
    {
        id: 3,
        nombre: 'Repuestos Mecánicos',
        descripcion: 'Piezas de repuesto para maquinaria',
        color: '#D4A574',
        creado_en: '2024-01-10T10:10:00'
    },
    {
        id: 4,
        nombre: 'Materiales de Soldadura',
        descripcion: 'Electrodos, varillas y consumibles de soldadura',
        color: '#C87152',
        creado_en: '2024-01-10T10:15:00'
    },
    {
        id: 5,
        nombre: 'Lubricantes',
        descripcion: 'Aceites, grasas y lubricantes industriales',
        color: '#FFA726',
        creado_en: '2024-01-10T10:20:00'
    },
    {
        id: 6,
        nombre: 'EPP',
        descripcion: 'Equipos de Protección Personal',
        color: '#29B6F6',
        creado_en: '2024-01-10T10:25:00'
    },
    {
        id: 7,
        nombre: 'Materiales Eléctricos',
        descripcion: 'Cables, conectores y componentes eléctricos',
        color: '#AB47BC',
        creado_en: '2024-01-10T10:30:00'
    },
    {
        id: 8,
        nombre: 'Rodamientos',
        descripcion: 'Rodamientos y cojinetes industriales',
        color: '#78909C',
        creado_en: '2024-01-10T10:35:00'
    }
];

/**
 * Proveedores
 */
const MOCK_PROVEEDORES = [
    {
        id: 1,
        nombre: 'Distribuidora Industrial del Norte',
        rut: '76.123.456-7',
        contacto: 'Juan Pérez',
        email: 'ventas@dinorte.cl',
        telefono: '+56 52 221 3456',
        direccion: 'Av. Copayapu 485, Copiapó',
        terminos_pago: 'Net 30',
        activo: true,
        creado_en: '2024-01-05T10:00:00'
    },
    {
        id: 2,
        nombre: 'Ferretería Industrial Atacama',
        rut: '77.234.567-8',
        contacto: 'Carmen Soto',
        email: 'cotizaciones@ferreind.cl',
        telefono: '+56 52 221 7890',
        direccion: 'Los Carrera 890, Copiapó',
        terminos_pago: 'Net 45',
        activo: true,
        creado_en: '2024-01-06T11:00:00'
    },
    {
        id: 3,
        nombre: 'Suministros Técnicos Ltda.',
        rut: '78.345.678-9',
        contacto: 'Ricardo Torres',
        email: 'ventas@sumtec.cl',
        telefono: '+56 52 221 4567',
        direccion: 'Colipí 340, Copiapó',
        terminos_pago: 'Net 60',
        activo: true,
        creado_en: '2024-01-07T09:00:00'
    }
];

/**
 * Proyectos activos
 */
const MOCK_PROYECTOS = [
    {
        id: 1,
        codigo: 'PROY-2024-001',
        nombre: 'Mantenimiento Camiones Mineros',
        descripcion: 'Mantenimiento preventivo y correctivo de flota de camiones',
        fecha_inicio: '2024-02-01',
        fecha_fin_estimada: '2024-06-30',
        estado: ESTADOS_PROYECTO.EN_CURSO,
        responsable_id: 6,
        creado_en: '2024-01-25T10:00:00'
    },
    {
        id: 2,
        codigo: 'PROY-2024-002',
        nombre: 'Fabricación Estructura Metálica Planta',
        descripcion: 'Construcción de estructura metálica para nueva planta de procesamiento',
        fecha_inicio: '2024-03-15',
        fecha_fin_estimada: '2024-09-30',
        estado: ESTADOS_PROYECTO.EN_CURSO,
        responsable_id: 6,
        creado_en: '2024-03-10T09:00:00'
    },
    {
        id: 3,
        codigo: 'PROY-2024-003',
        nombre: 'Reparación Palas Cargadoras',
        descripcion: 'Reparación mayor de 3 palas cargadoras',
        fecha_inicio: '2024-04-01',
        fecha_fin_estimada: '2024-05-15',
        estado: ESTADOS_PROYECTO.PLANIFICACION,
        responsable_id: 6,
        creado_en: '2024-03-28T11:00:00'
    }
];

/**
 * Piezas de inventario
 */
const MOCK_PIEZAS = [
    // Herramientas Manuales
    {
        id: 1,
        numero_serie: 'HM-001',
        nombre: 'Juego de Llaves Combinadas',
        descripcion: 'Juego de llaves combinadas de 8 a 32mm, 12 piezas',
        ubicacion: 'Estante A1-B2',
        stock_actual: 15,
        stock_minimo: 5,
        precio_unitario: 45000,
        unidad_medida: UNIDADES_MEDIDA.JUEGO,
        fecha_vencimiento: null,
        lote: null,
        proveedor_id: 1,
        activo: true,
        creado_en: '2024-01-15T10:00:00',
        actualizado_en: '2024-01-15T10:00:00'
    },
    {
        id: 2,
        numero_serie: 'HM-002',
        nombre: 'Martillo de Bola 1kg',
        descripcion: 'Martillo de bola con mango de fibra de vidrio',
        ubicacion: 'Estante A1-B3',
        stock_actual: 8,
        stock_minimo: 10,
        precio_unitario: 12000,
        unidad_medida: UNIDADES_MEDIDA.UNIDAD,
        fecha_vencimiento: null,
        lote: null,
        proveedor_id: 1,
        activo: true,
        creado_en: '2024-01-15T10:05:00',
        actualizado_en: '2024-01-15T10:05:00'
    },
    {
        id: 3,
        numero_serie: 'HM-003',
        nombre: 'Alicate Universal 8"',
        descripcion: 'Alicate universal cromado con empuñadura ergonómica',
        ubicacion: 'Estante A1-B4',
        stock_actual: 25,
        stock_minimo: 15,
        precio_unitario: 8500,
        unidad_medida: UNIDADES_MEDIDA.UNIDAD,
        fecha_vencimiento: null,
        lote: null,
        proveedor_id: 2,
        activo: true,
        creado_en: '2024-01-15T10:10:00',
        actualizado_en: '2024-01-15T10:10:00'
    },
    
    // Herramientas Eléctricas
    {
        id: 4,
        numero_serie: 'HE-001',
        nombre: 'Taladro Percutor 750W',
        descripcion: 'Taladro percutor profesional con velocidad variable',
        ubicacion: 'Estante B2-C1',
        stock_actual: 5,
        stock_minimo: 3,
        precio_unitario: 89000,
        unidad_medida: UNIDADES_MEDIDA.UNIDAD,
        fecha_vencimiento: null,
        lote: null,
        proveedor_id: 2,
        activo: true,
        creado_en: '2024-01-16T09:00:00',
        actualizado_en: '2024-01-16T09:00:00'
    },
    {
        id: 5,
        numero_serie: 'HE-002',
        nombre: 'Esmeril Angular 7"',
        descripcion: 'Esmeril angular 2200W con sistema de seguridad',
        ubicacion: 'Estante B2-C2',
        stock_actual: 2,
        stock_minimo: 4,
        precio_unitario: 125000,
        unidad_medida: UNIDADES_MEDIDA.UNIDAD,
        fecha_vencimiento: null,
        lote: null,
        proveedor_id: 2,
        activo: true,
        creado_en: '2024-01-16T09:05:00',
        actualizado_en: '2024-01-16T09:05:00'
    },
    
    // Repuestos Mecánicos
    {
        id: 6,
        numero_serie: 'RM-001',
        nombre: 'Filtro de Aceite CAT 1R-0750',
        descripcion: 'Filtro de aceite para motores Caterpillar',
        ubicacion: 'Estante C1-D2',
        stock_actual: 45,
        stock_minimo: 30,
        precio_unitario: 18500,
        unidad_medida: UNIDADES_MEDIDA.UNIDAD,
        fecha_vencimiento: null,
        lote: 'L2024-01',
        proveedor_id: 3,
        activo: true,
        creado_en: '2024-01-17T10:00:00',
        actualizado_en: '2024-01-17T10:00:00'
    },
    {
        id: 7,
        numero_serie: 'RM-002',
        nombre: 'Correa en V B-65',
        descripcion: 'Correa trapezoidal tipo B, longitud 65"',
        ubicacion: 'Estante C1-D3',
        stock_actual: 12,
        stock_minimo: 20,
        precio_unitario: 7800,
        unidad_medida: UNIDADES_MEDIDA.UNIDAD,
        fecha_vencimiento: null,
        lote: 'L2024-02',
        proveedor_id: 3,
        activo: true,
        creado_en: '2024-01-17T10:05:00',
        actualizado_en: '2024-01-17T10:05:00'
    },
    
    // Materiales de Soldadura
    {
        id: 8,
        numero_serie: 'MS-001',
        nombre: 'Electrodos E6013 3.2mm',
        descripcion: 'Electrodos de soldadura para acero al carbono',
        ubicacion: 'Estante D1-E1',
        stock_actual: 150,
        stock_minimo: 100,
        precio_unitario: 250,
        unidad_medida: UNIDADES_MEDIDA.UNIDAD,
        fecha_vencimiento: '2025-12-31',
        lote: 'L2024-S01',
        proveedor_id: 1,
        activo: true,
        creado_en: '2024-01-18T09:00:00',
        actualizado_en: '2024-01-18T09:00:00'
    },
    {
        id: 9,
        numero_serie: 'MS-002',
        nombre: 'Alambre MIG ER70S-6 0.9mm',
        descripcion: 'Alambre de soldadura MIG para acero, bobina 15kg',
        ubicacion: 'Estante D1-E2',
        stock_actual: 8,
        stock_minimo: 10,
        precio_unitario: 42000,
        unidad_medida: UNIDADES_MEDIDA.KG,
        fecha_vencimiento: null,
        lote: 'L2024-S02',
        proveedor_id: 1,
        activo: true,
        creado_en: '2024-01-18T09:05:00',
        actualizado_en: '2024-01-18T09:05:00'
    },
    
    // Lubricantes
    {
        id: 10,
        numero_serie: 'LUB-001',
        nombre: 'Aceite Hidráulico ISO 68',
        descripcion: 'Aceite hidráulico premium para sistemas industriales',
        ubicacion: 'Bodega Químicos A-5',
        stock_actual: 25,
        stock_minimo: 40,
        precio_unitario: 15000,
        unidad_medida: UNIDADES_MEDIDA.LT,
        fecha_vencimiento: '2026-06-30',
        lote: 'L2024-H01',
        proveedor_id: 2,
        activo: true,
        creado_en: '2024-01-19T10:00:00',
        actualizado_en: '2024-01-19T10:00:00'
    },
    {
        id: 11,
        numero_serie: 'LUB-002',
        nombre: 'Grasa Multipropósito EP-2',
        descripcion: 'Grasa de litio para rodamientos y engranajes',
        ubicacion: 'Bodega Químicos A-6',
        stock_actual: 18,
        stock_minimo: 25,
        precio_unitario: 8500,
        unidad_medida: UNIDADES_MEDIDA.KG,
        fecha_vencimiento: '2025-12-31',
        lote: 'L2024-G01',
        proveedor_id: 2,
        activo: true,
        creado_en: '2024-01-19T10:05:00',
        actualizado_en: '2024-01-19T10:05:00'
    },
    
    // EPP
    {
        id: 12,
        numero_serie: 'EPP-001',
        nombre: 'Casco de Seguridad Tipo I',
        descripcion: 'Casco de seguridad industrial con ajuste de matraca',
        ubicacion: 'Estante EPP-A1',
        stock_actual: 35,
        stock_minimo: 50,
        precio_unitario: 12000,
        unidad_medida: UNIDADES_MEDIDA.UNIDAD,
        fecha_vencimiento: null,
        lote: 'L2024-EPP01',
        proveedor_id: 1,
        activo: true,
        creado_en: '2024-01-20T09:00:00',
        actualizado_en: '2024-01-20T09:00:00'
    },
    {
        id: 13,
        numero_serie: 'EPP-002',
        nombre: 'Guantes de Cuero Reforzados',
        descripcion: 'Guantes de cuero con refuerzo en palma',
        ubicacion: 'Estante EPP-A2',
        stock_actual: 5,
        stock_minimo: 30,
        precio_unitario: 4500,
        unidad_medida: UNIDADES_MEDIDA.PAR,
        fecha_vencimiento: null,
        lote: 'L2024-EPP02',
        proveedor_id: 1,
        activo: true,
        creado_en: '2024-01-20T09:05:00',
        actualizado_en: '2024-01-20T09:05:00'
    },
    {
        id: 14,
        numero_serie: 'EPP-003',
        nombre: 'Lentes de Seguridad Claros',
        descripcion: 'Lentes de seguridad con protección UV',
        ubicacion: 'Estante EPP-A3',
        stock_actual: 60,
        stock_minimo: 40,
        precio_unitario: 3200,
        unidad_medida: UNIDADES_MEDIDA.UNIDAD,
        fecha_vencimiento: null,
        lote: 'L2024-EPP03',
        proveedor_id: 1,
        activo: true,
        creado_en: '2024-01-20T09:10:00',
        actualizado_en: '2024-01-20T09:10:00'
    },
    
    // Rodamientos
    {
        id: 15,
        numero_serie: 'ROD-001',
        nombre: 'Rodamiento 6205-2RS',
        descripcion: 'Rodamiento rígido de bolas sellado',
        ubicacion: 'Estante F1-G2',
        stock_actual: 22,
        stock_minimo: 15,
        precio_unitario: 6500,
        unidad_medida: UNIDADES_MEDIDA.UNIDAD,
        fecha_vencimiento: null,
        lote: 'L2024-R01',
        proveedor_id: 3,
        activo: true,
        creado_en: '2024-01-21T10:00:00',
        actualizado_en: '2024-01-21T10:00:00'
    }
];

/**
 * Relación entre piezas y categorías
 */
const MOCK_PIEZAS_CATEGORIAS = [
    { id: 1, pieza_id: 1, categoria_id: 1, asignado_en: '2024-01-15T10:00:00' },
    { id: 2, pieza_id: 2, categoria_id: 1, asignado_en: '2024-01-15T10:05:00' },
    { id: 3, pieza_id: 3, categoria_id: 1, asignado_en: '2024-01-15T10:10:00' },
    { id: 4, pieza_id: 4, categoria_id: 2, asignado_en: '2024-01-16T09:00:00' },
    { id: 5, pieza_id: 5, categoria_id: 2, asignado_en: '2024-01-16T09:05:00' },
    { id: 6, pieza_id: 6, categoria_id: 3, asignado_en: '2024-01-17T10:00:00' },
    { id: 7, pieza_id: 7, categoria_id: 3, asignado_en: '2024-01-17T10:05:00' },
    { id: 8, pieza_id: 8, categoria_id: 4, asignado_en: '2024-01-18T09:00:00' },
    { id: 9, pieza_id: 9, categoria_id: 4, asignado_en: '2024-01-18T09:05:00' },
    { id: 10, pieza_id: 10, categoria_id: 5, asignado_en: '2024-01-19T10:00:00' },
    { id: 11, pieza_id: 11, categoria_id: 5, asignado_en: '2024-01-19T10:05:00' },
    { id: 12, pieza_id: 12, categoria_id: 6, asignado_en: '2024-01-20T09:00:00' },
    { id: 13, pieza_id: 13, categoria_id: 6, asignado_en: '2024-01-20T09:05:00' },
    { id: 14, pieza_id: 14, categoria_id: 6, asignado_en: '2024-01-20T09:10:00' },
    { id: 15, pieza_id: 15, categoria_id: 8, asignado_en: '2024-01-21T10:00:00' }
];

/**
 * Movimientos de inventario de ejemplo
 */
const MOCK_MOVIMIENTOS = [
    {
        id: 1,
        pieza_id: 1,
        tipo_movimiento: TIPOS_MOVIMIENTO.ENTRADA,
        cantidad: 20,
        ubicacion_origen: 'Proveedor',
        ubicacion_destino: 'Estante A1-B2',
        usuario_id: 2,
        proyecto_id: null,
        observaciones: 'Compra inicial',
        fecha_movimiento: '2024-01-15T10:00:00'
    },
    {
        id: 2,
        pieza_id: 1,
        tipo_movimiento: TIPOS_MOVIMIENTO.SALIDA,
        cantidad: 5,
        ubicacion_origen: 'Estante A1-B2',
        ubicacion_destino: 'Proyecto PROY-2024-001',
        usuario_id: 3,
        proyecto_id: 1,
        observaciones: 'Entrega para mantenimiento de camiones',
        fecha_movimiento: '2024-02-10T14:30:00'
    },
    {
        id: 3,
        pieza_id: 12,
        tipo_movimiento: TIPOS_MOVIMIENTO.ENTRADA,
        cantidad: 50,
        ubicacion_origen: 'Proveedor',
        ubicacion_destino: 'Estante EPP-A1',
        usuario_id: 2,
        proyecto_id: null,
        observaciones: 'Reposición stock EPP',
        fecha_movimiento: '2024-01-20T09:00:00'
    },
    {
        id: 4,
        pieza_id: 12,
        tipo_movimiento: TIPOS_MOVIMIENTO.SALIDA,
        cantidad: 15,
        ubicacion_origen: 'Estante EPP-A1',
        ubicacion_destino: 'Bodega Central',
        usuario_id: 3,
        proyecto_id: null,
        observaciones: 'Distribución a trabajadores',
        fecha_movimiento: '2024-03-05T11:00:00'
    }
];

// Exportar datos mock
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MOCK_USUARIOS,
        MOCK_CATEGORIAS,
        MOCK_PROVEEDORES,
        MOCK_PROYECTOS,
        MOCK_PIEZAS,
        MOCK_PIEZAS_CATEGORIAS,
        MOCK_MOVIMIENTOS
    };
}