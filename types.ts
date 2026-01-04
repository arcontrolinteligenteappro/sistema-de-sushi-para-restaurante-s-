
/* Core data structures for SushiMex Enterprise Nexus 15.0 */

export enum Role {
  ADMIN_IT = 'ADMIN_IT',
  PROPIETARIO = 'PROPIETARIO',
  GERENTE = 'GERENTE',
  JEFE_AREA = 'JEFE_AREA',
  CAJERO = 'CAJERO',
  MESERO = 'MESERO',
  REPARTIDOR = 'REPARTIDOR',
  COCINERO = 'COCINERO'
}

export type Language = 'ES' | 'EN';
export type Currency = 'MXN' | 'USD';
export type Theme = 'light' | 'dark' | 'auto';
export type UIMode = 'PC' | 'TABLET';
export type OrderType = 'Dine-in' | 'Takeout' | 'Delivery';

export enum VehicleStatus {
  AVAILABLE = 'Disponible',
  IN_USE = 'En Ruta',
  MAINTENANCE = 'Mantenimiento'
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  clockIn: string; // ISO String
  clockOut?: string; // ISO String
  date: string; // YYYY-MM-DD
}

export interface DeliveryVehicle {
  id: string;
  name: string;
  model: string;
  licensePlate: string;
  status: VehicleStatus;
  currentDriverId?: string;
  location?: { lat: number; lng: number };
}

export interface BranchTheme {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
}

export interface ShiftReport {
  id: string;
  branchId: string;
  userId: string;
  userName: string;
  endedAt: string;
  systemTotals: { cash: number; card: number; transfer: number; };
  declaredTotals: { cash: number; card: number; transfer: number; };
  discrepancies: { cash: number; card: number; transfer: number; };
}

export interface RecipeItem {
  insumoId: string;
  quantity: number; // in base unit of the insumo
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategoryId?: string;
  image?: string;
  recipe?: RecipeItem[];
}

export interface OrderItem {
  productId: string;
  quantity: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Closed';
  extras?: string[];
}

export interface Insumo {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  cost: number;
  supplierId?: string;
}

export interface POItem {
  insumoId: string;
  quantity: number;
  cost: number; // Cost at time of order
}

export interface AiSuggestion {
  insumoId: string;
  suggestedQuantity: number;
  weeklyConsumption: number;
  currentStock: number;
  supplierId?: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  branchId: string;
  items: POItem[];
  totalCost: number;
  status: 'Pending' | 'Sent' | 'Received' | 'Cancelled';
  createdAt: string;
  receivedAt?: string;
}

export interface PayrollPayment {
  id: string;
  period: string;
  baseSalary: number;
  tips: number;
  benefits: number;
  deductions: number;
  amount: number;
  status: 'Paid' | 'Pending';
}

export interface Employee {
  id: string;
  name: string;
  role: Role;
  branchId: string;
  pin: string;
  baseSalary: number; // Now used as fallback or for salaried roles
  payments: PayrollPayment[];
  feedback: any[];
  vacationDaysAccrued: number;
  // New HR Fields
  hireDate: string;
  paymentType: 'hourly' | 'daily';
  hourlyRate: number;
  dailyRate: number;
  workdayHours: number; // e.g., 8 hours for a full day
  shiftStartTime?: string; // e.g., "09:00"
  benefits: number; // Monthly benefits amount
  latePenalty: number; // Amount to deduct for being late
  absencePenalty: number; // Amount to deduct for an absence
  restDays: number[]; // 0 for Sunday, 1 for Monday, etc.
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  isActive: boolean;
  syncWithCloud: boolean;
}

export interface Reservation {
  id: string;
  customerName: string;
  date: string;
  time: string;
  guests: number;
  tableId: string;
  branchId: string;
  status: 'Confirmed' | 'Seated' | 'Cancelled';
}

export interface Table {
  id: string;
  number: number;
  zone?: string;
  status: 'Available' | 'Occupied';
  assignedWaiterId?: string;
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface DeviceStatus {
  id: string;
  name: string;
  type: 'POS_MAIN' | 'POS_DRIVE' | 'KDS_SCREEN' | 'WAITER_TAB' | 'DELIVERY_TERM' | 'ROUTER' | 'OTHER';
  ip: string;
  status: 'Online' | 'Warning' | 'Offline';
  latency: string;
  lastPing: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  branchId: string;
}

export interface User {
  id: string;
  username: string; 
  password?: string;
  name: string;
  role: Role;
  pin: string;
  branchId?: string;
  area?: string;
  salary?: number;
  status: 'Active' | 'OnLeave' | 'Terminated';
  currentVehicleId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  module: string;
}

export interface NotificationSetting {
    sound: string;
    vibration: number; // 0-100
}

export interface BranchInfo {
  id: string;
  name: string;
  themeConfig: BranchTheme;
  config: {
    taxRate: number;
    baseCurrency: Currency;
    address: string;
    phone: string;
  };
  hardware: {
    printer: { type: '80mm' | '58mm'; ip: string; footer: string; showLogo: boolean; };
    biometric: { enabled: boolean; sensitivity: number; status: 'Online' | 'Offline'; };
    alerts: { 
      inventorySound: boolean; 
      lowStockVisual: boolean; 
      notifications?: {
        newOrder: NotificationSetting;
        platformOrder: NotificationSetting;
        orderCancelled: NotificationSetting;
        statusRequest: NotificationSetting;
      };
    };
    projection: { mode: string; enabled: boolean; };
  };
  devices: DeviceStatus[];
}

export interface BusinessConfig {
  name: string;
  slogan: string;
  legalName: string;
  taxId: string;
  logo: string;
  baseCurrency: Currency;
  exchangeRate: number;
  isTouchOptimized: boolean;
  branches: BranchInfo[];
  apiKeys: {
    googleMaps: string;
    uberEats: string;
    deliveryApp: string;
    cloudBackup: string;
  };
  ticketFooter: string;
  socials: { instagram?: string; facebook?: string; };
}

export interface DeliveryDetails {
  customerName: string;
  address: string;
  phone: string;
}

export interface Order {
  id: string;
  branchId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip: number;
  tipMethod?: 'Cash' | 'Card';
  total: number;
  currency: Currency;
  status: 'Open' | 'Preparing' | 'Ready' | 'Dispatched' | 'Closed' | 'Cancelled';
  createdAt: string;
  orderType: OrderType;
  deliveryDetails?: DeliveryDetails;
  customerId?: string;
  customerName?: string;
  deliveryTip?: number;
  tableId?: string;
  waiterId?: string;
  waiterName?: string;
  exchangeRateUsed?: number;
  paymentType?: string;
  referenceNumber?: string;
  amountPaid?: number;
  change?: number;
  deliveryApp?: string;
  courierId?: string;
  closedBy?: string; // Cashier ID
}
