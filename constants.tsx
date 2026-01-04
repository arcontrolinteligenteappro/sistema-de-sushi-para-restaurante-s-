
import { Role, User, BranchTheme, BusinessConfig, Language, Employee, AuditLog, Insumo, Product, Supplier, Reservation, Customer, Order, PurchaseOrder, DeliveryVehicle, VehicleStatus, AttendanceRecord } from './types';

export const APP_EDITION = "AR Control: Restaurant Edition";
export const SYSTEM_SLOGAN = "Gestión Inteligente v27.22";
export const CREDITS_NAME = "Elaborado por ChrisRey91";
export const CREDITS_URL = "www.arcontrolinteligente.com";

export const THEME_PRESETS: Record<string, BranchTheme> = {
  sapphire: { primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8', glow: 'rgba(14,165,233,0.3)' },
  emerald: { primary: '#10b981', secondary: '#059669', accent: '#34d399', glow: 'rgba(16,185,129,0.3)' },
  ruby: { primary: '#f43f5e', secondary: '#e11d48', accent: '#fb7185', glow: 'rgba(244,63,94,0.3)' },
  amber: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', glow: 'rgba(245,158,11,0.3)' },
  amethyst: { primary: '#a855f7', secondary: '#9333ea', accent: '#c084fc', glow: 'rgba(168,85,247,0.3)' }
};

export const INITIAL_USERS: User[] = [
  { id: 'it-1', username: 'it@arcontrol.io', password: '1', name: 'CHRIS REY', role: Role.ADMIN_IT, pin: '1991', status: 'Active', branchId: 'b1' },
  { id: 'owner-1', username: 'owner@sushimex.io', password: '2', name: 'PROPIETARIO NEXUS', role: Role.PROPIETARIO, pin: '2025', status: 'Active', branchId: 'b1' },
  { id: 'gerente-1', username: 'gerente@sushimex.io', name: 'GERENTE SUCURSAL', role: Role.GERENTE, pin: '2000', status: 'Active', branchId: 'b1' },
  { id: 'jefe-cocina-1', username: 'jefe.cocina@sushimex.io', name: 'JEFE DE COCINA', role: Role.JEFE_AREA, pin: '3000', status: 'Active', branchId: 'b1', area: 'Cocina' },
  { id: 'caja-1', username: 'caja@sushimex.io', password: '3', name: 'CAJERO TURNO A', role: Role.CAJERO, pin: '1234', status: 'Active', branchId: 'b1' },
  { id: 'mesero-1', username: 'mesero1@sushimex.io', name: 'MESERO TURNO A', role: Role.MESERO, pin: '4000', status: 'Active', branchId: 'b1' },
  { id: 'cocinero-1', username: 'cocinero1@sushimex.io', name: 'COCINERO LINEA', role: Role.COCINERO, pin: '5000', status: 'Active', branchId: 'b1' },
  { id: 'r-1', username: 'repartidor1@sushimex.io', name: 'JUAN PEREZ', role: Role.REPARTIDOR, pin: '5555', status: 'Active', branchId: 'b1' },
  { id: 'r-2', username: 'repartidor2@sushimex.io', name: 'LUIS GOMEZ', role: Role.REPARTIDOR, pin: '6666', status: 'Active', branchId: 'b1', currentVehicleId: 'v-2' }
];

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
    { id: 'att-1', employeeId: 'caja-1', date: new Date().toISOString().split('T')[0], clockIn: new Date(new Date().setHours(9, 5, 0)).toISOString(), clockOut: new Date(new Date().setHours(17, 2, 0)).toISOString() },
    { id: 'att-2', employeeId: 'r-1', date: new Date().toISOString().split('T')[0], clockIn: new Date(new Date().setHours(12, 1, 0)).toISOString() },
];

export const INITIAL_DELIVERY_VEHICLES: DeliveryVehicle[] = [
  { id: 'v-1', name: 'MOTO-01', model: 'Italika DT150', licensePlate: 'XYZ-123', status: VehicleStatus.AVAILABLE, location: { lat: 19.4326, lng: -99.1332 } },
  { id: 'v-2', name: 'MOTO-02', model: 'Honda Cargo 150', licensePlate: 'ABC-456', status: VehicleStatus.IN_USE, currentDriverId: 'r-2', location: { lat: 19.4420, lng: -99.1450 } },
  { id: 'v-3', name: 'MOTO-03', model: 'Suzuki AX100', licensePlate: 'DEF-789', status: VehicleStatus.MAINTENANCE, location: { lat: 19.4250, lng: -99.1380 } }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c-1', name: 'Ricardo Morales', phone: '55-8765-4321', totalSpent: 1250.50 },
  { id: 'c-2', name: 'Laura Jiménez', phone: '55-1234-5678', totalSpent: 3480.00 },
  { id: 'c-3', name: 'Carlos Fernández', phone: '55-9876-5432', totalSpent: 850.75 },
];

export const INITIAL_ORDERS: Order[] = [
    { id: 'SN-5821', branchId: 'b1', items: [{ productId: 'p1', quantity: 2, status: 'Closed' }], subtotal: 490, tax: 78.4, tip: 50, total: 618.4, currency: 'MXN', status: 'Closed', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), orderType: 'Dine-in', tableId: 't2', waiterName: 'MESERO 1', customerId: 'c-2', closedBy: 'caja-1', paymentType: 'Card' },
    { id: 'SN-5822', branchId: 'b1', items: [{ productId: 'p3', quantity: 1, status: 'Closed' }, { productId: 'p4', quantity: 1, status: 'Closed' }], subtotal: 345, tax: 55.2, tip: 35, total: 435.2, currency: 'MXN', status: 'Closed', createdAt: new Date(Date.now() - 86400000).toISOString(), orderType: 'Takeout', customerId: 'c-1', closedBy: 'caja-1', paymentType: 'Cash' },
    { id: 'SN-5823', branchId: 'b1', items: [{ productId: 'p5', quantity: 1, status: 'Closed' }], subtotal: 220, tax: 35.2, tip: 20, total: 275.2, currency: 'MXN', status: 'Dispatched', createdAt: new Date().toISOString(), orderType: 'Delivery', customerId: 'c-3', deliveryDetails: { customerName: 'Carlos Fdz', address: 'Av. Siempreviva 742', phone: '55-9876-5432'}, courierId: 'r-2' },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: 'PO-001', branchId: 'b1', supplierId: 'sup-1', items: [{ insumoId: 'i2', quantity: 5, cost: 2100 }], totalCost: 10500, status: 'Pending', createdAt: new Date().toISOString() },
  { id: 'PO-002', branchId: 'b1', supplierId: 'sup-2', items: [{ insumoId: 'i5', quantity: 10, cost: 60 }], totalCost: 600, status: 'Received', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), receivedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'it-1', name: 'CHRIS REY', role: Role.ADMIN_IT, branchId: 'b1', pin: '1991', baseSalary: 25000,
    payments: [{ id: 'pay-2', period: '2024-07-15', baseSalary: 25000, tips: 0, benefits: 2000, deductions: 1500, amount: 25500, status: 'Paid' }],
    feedback: [], vacationDaysAccrued: 12, hireDate: '2022-01-01', paymentType: 'daily', dailyRate: 1000, hourlyRate: 0, workdayHours: 8, shiftStartTime: '09:00', benefits: 5000, latePenalty: 0, absencePenalty: 0, restDays: [0, 6]
  },
  { id: 'gerente-1', name: 'GERENTE SUCURSAL', role: Role.GERENTE, branchId: 'b1', pin: '2000', baseSalary: 15000, 
    payments: [], feedback: [], vacationDaysAccrued: 10, hireDate: '2022-05-20', paymentType: 'daily', dailyRate: 750, hourlyRate: 0, workdayHours: 9, shiftStartTime: '10:00', benefits: 2500, latePenalty: 0, absencePenalty: 0, restDays: [0]
  },
  { id: 'jefe-cocina-1', name: 'JEFE DE COCINA', role: Role.JEFE_AREA, branchId: 'b1', pin: '3000', baseSalary: 12000, 
    payments: [], feedback: [], vacationDaysAccrued: 8, hireDate: '2023-02-10', paymentType: 'daily', dailyRate: 500, hourlyRate: 0, workdayHours: 8, shiftStartTime: '11:00', benefits: 1500, latePenalty: 50, absencePenalty: 350, restDays: [1]
  },
  { id: 'caja-1', name: 'CAJERO TURNO A', role: Role.CAJERO, branchId: 'b1', pin: '1234', baseSalary: 8000, 
    payments: [{ id: 'pay-1', period: '2024-07-15', baseSalary: 8000, tips: 1250, benefits: 500, deductions: 350, amount: 9400, status: 'Paid' }],
    feedback: [], vacationDaysAccrued: 6, hireDate: '2023-01-15', paymentType: 'daily', dailyRate: 300, hourlyRate: 0, workdayHours: 8, shiftStartTime: '09:00', benefits: 1000, latePenalty: 50, absencePenalty: 300, restDays: [0, 6]
  },
  { id: 'mesero-1', name: 'MESERO TURNO A', role: Role.MESERO, branchId: 'b1', pin: '4000', baseSalary: 5000, 
    payments: [], feedback: [], vacationDaysAccrued: 4, hireDate: '2024-01-05', paymentType: 'hourly', dailyRate: 0, hourlyRate: 40, workdayHours: 8, shiftStartTime: '13:00', benefits: 500, latePenalty: 20, absencePenalty: 150, restDays: [2]
  },
  { id: 'cocinero-1', name: 'COCINERO LINEA', role: Role.COCINERO, branchId: 'b1', pin: '5000', baseSalary: 7500, 
    payments: [], feedback: [], vacationDaysAccrued: 5, hireDate: '2023-11-15', paymentType: 'daily', dailyRate: 280, hourlyRate: 0, workdayHours: 8, shiftStartTime: '12:00', benefits: 800, latePenalty: 30, absencePenalty: 250, restDays: [3]
  },
  { id: 'r-1', name: 'JUAN PEREZ', role: Role.REPARTIDOR, branchId: 'b1', pin: '5555', baseSalary: 6000,
    payments: [], feedback: [], vacationDaysAccrued: 3, hireDate: '2024-03-10', paymentType: 'hourly', dailyRate: 0, hourlyRate: 50, workdayHours: 8, shiftStartTime: '12:00', benefits: 500, latePenalty: 25, absencePenalty: 200, restDays: [2]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: new Date(Date.now() - 3600000).toISOString(), userId: 'it-1', userName: 'CHRIS REY', action: 'USER_LOGIN', details: 'Successful login via Console Access', module: 'Authentication' },
  { id: 'log-2', timestamp: new Date(Date.now() - 1200000).toISOString(), userId: 'caja-1', userName: 'CAJERO TURNO A', action: 'CREATE_ORDER', details: 'Order #SN-5821 created for Takeout. Total: $455.00', module: 'POS' },
  { id: 'log-3', timestamp: new Date(Date.now() - 60000).toISOString(), userId: 'owner-1', userName: 'PROPIETARIO NEXUS', action: 'VIEW_REPORT', details: 'Accessed monthly financial report for MATRIZ CENTRO', module: 'Reports' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
    { id: 'sup-1', name: 'Pescados y Mariscos del Golfo', category: 'Mariscos', phone: '55-5555-1010', email: 'ventas@pescagolfo.com', branchId: 'ALL' },
    { id: 'sup-2', name: 'Verduras Frescas Orgánicas', category: 'Verduras', phone: '55-5555-2020', email: 'pedidos@verduorganicas.com', branchId: 'b1' },
    { id: 'sup-3', 'name': 'Distribuidora de Licores "El Corcho"', category: 'Licores', phone: '55-5555-3030', email: 'contacto@elcorcho.com', branchId: 'ALL' }
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'SASHIMI ESPECIAL', price: 245, category: 'Cocina', recipe: [{insumoId: 'i2', quantity: 0.150}] }, // 150g Atun
  { id: 'p2', name: 'ROLLO DRAGÓN', price: 210, category: 'Cocina', recipe: [{insumoId: 'i1', quantity: 0.100}, {insumoId: 'i5', quantity: 0.080}] }, // 100g Arroz, 80g Aguacate
  { id: 'p3', name: 'MARTINI LYCHEE', price: 165, category: 'Bar', recipe: [{insumoId: 'i8', quantity: 0.1}] }, // part of a bottle
  { id: 'p4', name: 'NIGIRI TRUFA', price: 180, category: 'Cocina', recipe: [{insumoId: 'i1', quantity: 0.050}, {insumoId: 'i7', quantity: 0.005}] }, // 50g Arroz, 5g Trufa
  { id: 'p5', name: 'RAMEN TONKOTSU', price: 220, category: 'Cocina' }, // No recipe for simplicity
  { id: 'p6', name: 'SAKE TEPPAN', price: 320, category: 'Cocina', recipe: [{insumoId: 'i3', quantity: 0.180}] } // 180g Salmon
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  { id: 'res-1', customerName: 'Familia Rodriguez', date: new Date().toISOString().split('T')[0], time: '20:00', guests: 4, tableId: '10', branchId: 'b1', status: 'Confirmed' },
  { id: 'res-2', customerName: 'Ana García', date: new Date().toISOString().split('T')[0], time: '21:30', guests: 2, tableId: '2', branchId: 'b1', status: 'Confirmed' },
];

export const INITIAL_INSUMOS: Insumo[] = [
  { id: 'i1', name: 'ARROZ KOSHIHIKARI', stock: 50, minStock: 10, unit: 'kg', cost: 120, supplierId: 'sup-2' },
  { id: 'i2', name: 'ATÚN ALETA AZUL', stock: 8, minStock: 2, unit: 'kg', cost: 2100, supplierId: 'sup-1' },
  { id: 'i3', name: 'SALMÓN ORA KING', stock: 12, minStock: 3, unit: 'kg', cost: 1800, supplierId: 'sup-1' },
  { id: 'i4', name: 'SALSA SOYA YAMASA', stock: 20, minStock: 5, unit: 'L', cost: 250, supplierId: 'sup-3' },
  { id: 'i5', name: 'AGUACATE HASS', stock: 15, minStock: 5, unit: 'kg', cost: 60, supplierId: 'sup-2' },
  { id: 'i6', name: 'IKURA (Hueva Salmón)', stock: 1, minStock: 0.5, unit: 'kg', cost: 3500, supplierId: 'sup-1' },
  { id: 'i7', name: 'TRUFA NEGRA', stock: 0.5, minStock: 0.1, unit: 'kg', cost: 8000, supplierId: 'sup-2' },
  { id: 'i8', name: 'SAKE JUNMAI', stock: 10, minStock: 2, unit: 'btl', cost: 450, supplierId: 'sup-3' },
];

export const INITIAL_BUSINESS_CONFIG: BusinessConfig = {
  name: "SUSHIMEX ENTERPRISE",
  slogan: "LA EXCELENCIA DEL SABOR ORIENTAL",
  legalName: "Grupo SushiMex S.A. de C.V.",
  taxId: "SME123456XYZ",
  logo: "https://cdn-icons-png.flaticon.com/512/2252/2252075.png",
  baseCurrency: "MXN",
  exchangeRate: 20.00,
  isTouchOptimized: true,
  apiKeys: { googleMaps: 'ACTIVE', uberEats: 'CONNECTED', deliveryApp: 'SYNC', cloudBackup: 'ENCRYPTED' },
  ticketFooter: "SUSHIMEX: EXPERIENCIA GASTRONÓMICA",
  socials: { instagram: "@sushimex", facebook: "SushiMexOficial" },
  branches: [
    {
      id: 'b1',
      name: 'MATRIZ CENTRO',
      themeConfig: THEME_PRESETS.sapphire,
      config: { taxRate: 0.16, baseCurrency: 'MXN', address: 'AV. GASTRONOMÍA 101', phone: '55-1234-5678' },
      hardware: {
        printer: { type: '80mm', ip: '192.168.1.100', footer: 'SUSHIMEX', showLogo: true },
        biometric: { enabled: true, sensitivity: 9, status: 'Online' },
        alerts: { 
          inventorySound: true, 
          lowStockVisual: true,
          notifications: {
            newOrder: { sound: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3', vibration: 50 },
            platformOrder: { sound: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3', vibration: 75 },
            orderCancelled: { sound: 'https://assets.mixkit.co/sfx/preview/mixkit-access-denied-tone-2866.mp3', vibration: 100 },
            statusRequest: { sound: 'https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3', vibration: 30 },
          }
        },
        projection: { mode: 'Menu', enabled: true }
      },
      devices: [
        { id: 'd1', name: 'CAJA-01', type: 'POS_MAIN', ip: '192.168.1.5', status: 'Online', latency: '0.2ms', lastPing: 'Ahora' },
        { id: 'd2', name: 'KDS-COCINA', type: 'KDS_SCREEN', ip: '192.168.1.12', status: 'Online', latency: '1.5ms', lastPing: 'Ahora' }
      ]
    }
  ]
};

export const TRANSLATIONS = {
  ES: {
    dashboard: 'Tablero', 
    pos: 'Caja', 
    attendance: 'Checador',
    attendance_history: 'Asistencia',
    my_calendar: 'Mi Calendario',
    employee_portal: 'Mi Portal',
    identify_operator: 'Acceso Operador', 
    protocol_selector: 'Temas', 
    welcome: 'NEXUS ONLINE',
    network_map: 'Radar Red', 
    supervision: 'Control Global',
    open_accounts: 'Cuentas Abiertas',
    tables_active: 'Mesas Activas',
    system_status: 'Estado del Sistema',
    settings: 'Configuración',
    my_salon: 'Mi Salón',
    assigned_tables: 'Mesas y Zonas Asignadas',
    open_account: 'ABRIR CUENTA',
    staff: 'Personal & Staff',
    suppliers: 'Proveedores',
    payroll: 'Nómina & Pagos',
    branch_reports: 'Reportes de Sucursal',
    company: 'Empresa',
    console: 'Consola',
    salon_management: 'Gestión Salón',
    audit: 'Auditoría',
    payment: 'Pago',
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    confirm_payment: 'Confirmar Pago',
    reservations: 'Reservas',
    crm: 'Clientes',
    operations_hub: 'Hub Operativo',
    link_customer: 'Vincular Cliente',
    search_create_customer: 'Buscar / Crear Cliente',
    customer_name_optional: 'Nombre Cliente (Opcional)',
    link_to_order: 'Vincular a Orden',
    create_link: 'Crear y Vincular',
    no_customer_linked: 'Cliente No Vinculado',
    recipes: 'Recetas',
    supply_chain: 'Suministros',
    profitability_analysis: 'Análisis de Rentabilidad',
    revenue: 'Ingresos',
    cogs: 'Costo (COGS)',
    profit: 'Utilidad',
    ai_assistant_purchasing: 'Asistente de Compras IA',
    ai_suggestion: 'Sugerencia IA',
    weekly_consumption: 'Consumo Semanal',
    generate_pos: 'Generar Órdenes de Compra',
    end_of_shift: 'Cierre de Turno',
    declare_cash: 'Declarar Efectivo',
    discrepancy_report: 'Reporte de Discrepancias',
    system_total: 'Total Sistema',
    declared_total: 'Total Declarado',
    discrepancy: 'Discrepancia',
    closings: 'Cierres',
    ai_assistant: 'Asistente IA',
    ask_me: 'Pregúntame algo...',
    sales_today: '¿Resumen de ventas de hoy?',
    most_profitable: '¿Producto más rentable?',
    best_employee: '¿Empleado con más ventas?',
    edit_user: 'Editar Operador',
    create_user: 'Alta Operador',
    user_name: 'Nombre Completo',
    user_role: 'Rol de Sistema',
    user_pin: 'PIN de Acceso (4 dígitos)',
    user_status: 'Estado',
    save_changes: 'Guardar Cambios',
    delete_user: 'Eliminar Operador',
    scheduled_start_time: 'Hora de Entrada Programada',
    monthly_benefits: 'Beneficios Mensuales',
    edit_supplier: 'Editar Proveedor',
    create_supplier: 'Nuevo Proveedor',
    supplier_name: 'Nombre Proveedor',
    supplier_category: 'Categoría',
    supplier_phone: 'Teléfono',
    supplier_email: 'Email',
    fleet_command: 'Comando de Flota',
    vehicle_status: 'Estado de Vehículos',
    live_map: 'Mapa en Vivo',
    assign_vehicle: 'Asignar Vehículo',
    vehicle_name: 'Nombre Vehículo',
    license_plate: 'Placa',
    vehicle_model: 'Modelo',
    unassign: 'Desasignar',
    light: 'Claro',
    dark: 'Oscuro',
    auto: 'Automático',
    theme: 'Tema Visual',
    interface: 'Interfaz',
    color_palette: 'Paleta de Color',
    interface_prefs: 'Preferencias de Interfaz',
    interface_config: 'Configuración de Interfaz',
    nexus_portal: 'Nexus Portal',
    personal_node_access: 'Acceso Nodo Personal',
    pin_or_id: 'PIN / ID',
    connect_node: 'Conectar Nodo',
    invalid_credentials: 'Credenciales Inválidas',
    station_active: 'Estación Activa',
    home: 'Inicio',
    vacations: 'Vacaciones',
    feedback: 'Feedback',
    financial_nexus: 'Nexus Financiero',
    status_colon: 'Estado: ',
    system_broadcasts: 'Anuncios del Sistema',
    no_critical_messages: 'Sin mensajes críticos de la red',
    suggestion_terminal: 'Terminal de Sugerencias',
    direct_uplink_admin: 'Enlace directo a administración',
    subject: 'Asunto',
    comment_report: 'Comentario / Reporte',
    broadcast_feedback: 'Enviar Feedback',
    feedback_sent_successfully: 'Feedback enviado correctamente.',
    time_off_protocol: 'Protocolo de Ausencia',
    days_available: 'Días disponibles:',
    vacation_request_policy: 'Las solicitudes deben realizarse con un mínimo de 15 ciclos de antelación.',
    start_request: 'Iniciar Solicitud',
  },
  EN: {
    dashboard: 'Stats', 
    pos: 'Register', 
    attendance: 'Clock-In',
    attendance_history: 'Attendance',
    my_calendar: 'My Calendar',
    employee_portal: 'My Portal',
    identify_operator: 'Operator Login', 
    protocol_selector: 'Themes', 
    welcome: 'NEXUS ONLINE',
    network_map: 'Net Radar', 
    supervision: 'Global Monitoring',
    open_accounts: 'Open Accounts',
    tables_active: 'Active Tables',
    system_status: 'System Status',
    settings: 'Settings',
    my_salon: 'My Section',
    assigned_tables: 'Assigned Tables & Zones',
    open_account: 'OPEN TAB',
    staff: 'Personnel & Staff',
    suppliers: 'Suppliers',
    payroll: 'Payroll & Payments',
    branch_reports: 'Branch Reports',
    company: 'Company',
    console: 'Console',
    salon_management: 'Salon Management',
    audit: 'Audit Log',
    payment: 'Payment',
    cash: 'Cash',
    card: 'Card',
    transfer: 'Transfer',
    confirm_payment: 'Confirm Payment',
    reservations: 'Reservations',
    crm: 'Customers',
    operations_hub: 'Operations Hub',
    link_customer: 'Link Customer',
    search_create_customer: 'Search / Create Customer',
    customer_name_optional: 'Customer Name (Optional)',
    link_to_order: 'Link to Order',
    create_link: 'Create & Link',
    no_customer_linked: 'No Customer Linked',
    recipes: 'Recipes',
    supply_chain: 'Supply Chain',
    profitability_analysis: 'Profitability Analysis',
    revenue: 'Revenue',
    cogs: 'Cost (COGS)',
    profit: 'Profit',
    ai_assistant_purchasing: 'AI Purchasing Assistant',
    ai_suggestion: 'AI Suggestion',
    weekly_consumption: 'Weekly Consumption',
    generate_pos: 'Generate Purchase Orders',
    end_of_shift: 'End of Shift',
    declare_cash: 'Declare Cash',
    discrepancy_report: 'Discrepancy Report',
    system_total: 'System Total',
    declared_total: 'Declared Total',
    discrepancy: 'Discrepancy',
    closings: 'Closings',
    ai_assistant: 'AI Assistant',
    ask_me: 'Ask me anything...',
    sales_today: 'Sales summary for today?',
    most_profitable: 'Most profitable product?',
    best_employee: 'Top selling employee?',
    edit_user: 'Edit Operator',
    create_user: 'New Operator',
    user_name: 'Full Name',
    user_role: 'System Role',
    user_pin: 'Access PIN (4 digits)',
    user_status: 'Status',
    save_changes: 'Save Changes',
    delete_user: 'Delete Operator',
    scheduled_start_time: 'Scheduled Start Time',
    monthly_benefits: 'Monthly Benefits',
    edit_supplier: 'Edit Supplier',
    create_supplier: 'New Supplier',
    supplier_name: 'Supplier Name',
    supplier_category: 'Category',
    supplier_phone: 'Phone',
    supplier_email: 'Email',
    fleet_command: 'Fleet Command',
    vehicle_status: 'Vehicle Status',
    live_map: 'Live Map',
    assign_vehicle: 'Assign Vehicle',
    vehicle_name: 'Vehicle Name',
    license_plate: 'Plate',
    vehicle_model: 'Model',
    unassign: 'Unassign',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
    theme: 'Visual Theme',
    interface: 'Interface',
    color_palette: 'Color Palette',
    interface_prefs: 'Interface Preferences',
    interface_config: 'Interface Settings',
    nexus_portal: 'Nexus Portal',
    personal_node_access: 'Personal Node Access',
    pin_or_id: 'PIN / ID',
    connect_node: 'Connect Node',
    invalid_credentials: 'Invalid Credentials',
    station_active: 'Station Active',
    home: 'Home',
    vacations: 'Vacations',
    feedback: 'Feedback',
    financial_nexus: 'Financial Nexus',
    status_colon: 'Status: ',
    system_broadcasts: 'System Broadcasts',
    no_critical_messages: 'No critical messages from the network',
    suggestion_terminal: 'Suggestion Terminal',
    direct_uplink_admin: 'Direct uplink to administration',
    subject: 'Subject',
    comment_report: 'Comment / Report',
    broadcast_feedback: 'Broadcast Feedback',
    feedback_sent_successfully: 'Feedback sent successfully.',
    time_off_protocol: 'Time-Off Protocol',
    days_available: 'Days available:',
    vacation_request_policy: 'Requests must be submitted at least 15 cycles in advance.',
    start_request: 'Start Request',
  }
};
