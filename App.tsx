
import React, { useState, useEffect, useMemo } from "react";
// FIX: Imported OrderItem type to resolve 'Cannot find name' error on line 90.
import { User, Language, BusinessConfig, Theme, Role, Product, Order, OrderItem, UIMode, Table, Insumo, Employee, AuditLog, Supplier, Reservation, Customer, PurchaseOrder, POItem, ShiftReport, DeliveryVehicle, AttendanceRecord } from './types';
// FIX: Imported TRANSLATIONS constant to resolve 'Cannot find name' error.
import { INITIAL_USERS, APP_EDITION, INITIAL_BUSINESS_CONFIG, INITIAL_PRODUCTS, CREDITS_NAME, CREDITS_URL, SYSTEM_SLOGAN, INITIAL_INSUMOS, INITIAL_EMPLOYEES, INITIAL_AUDIT_LOGS, INITIAL_SUPPLIERS, THEME_PRESETS, INITIAL_RESERVATIONS, INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_PURCHASE_ORDERS, INITIAL_DELIVERY_VEHICLES, INITIAL_ATTENDANCE_RECORDS, TRANSLATIONS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Login from './components/Login';
import Management from './components/Management';
import POS from './components/POS';
import NetworkMonitor from './components/NetworkMonitor';
import Attendance from './components/Attendance';
import WaiterHub from './components/WaiterHub';
import TableMap from './components/TableMap';
import Audit from './components/Audit';
import GlobalCalculator from './components/GlobalCalculator';
import CRM from './components/CRM';
import OperationsHub from './components/OperationsHub';
import SupplyChain from './components/SupplyChain';
import EndOfShift from './components/EndOfShift';
import FleetCommand from './components/FleetCommand';
import MyCalendar from './components/hr/MyCalendar';
import Background from './components/Background';
import BiometricClock from './components/BiometricClock';
import EmployeePortal from './components/hr/EmployeePortal';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('ES');
  const [theme, setTheme] = useState<Theme>('auto');
  const [uiMode, setUiMode] = useState<UIMode>('PC');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [business, setBusiness] = useState<BusinessConfig>(INITIAL_BUSINESS_CONFIG);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [currentThemePreset, setCurrentThemePreset] = useState('sapphire');
  
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [insumos, setInsumos] = useState<Insumo[]>(INITIAL_INSUMOS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [shiftReports, setShiftReports] = useState<ShiftReport[]>([]);
  const [deliveryVehicles, setDeliveryVehicles] = useState<DeliveryVehicle[]>(INITIAL_DELIVERY_VEHICLES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [tables, setTables] = useState<Table[]>([
    { id: 't1', number: 1, status: 'Available', zone: 'Terraza' },
    { id: 't2', number: 2, status: 'Occupied', zone: 'Terraza', assignedWaiterId: 'mesero-1' },
    { id: 't3', number: 3, status: 'Available', zone: 'Salón Principal' },
    { id: 't4', number: 4, status: 'Available', zone: 'Salón Principal' },
    { id: 't5', number: 5, status: 'Available', zone: 'Salón Principal' }
  ]);

  useEffect(() => {
    if (theme === 'auto') {
      const hour = new Date().getHours();
      setResolvedTheme((hour >= 18 || hour < 6) ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }
  }, [theme]);

  const currentBranch = useMemo(() => {
    if (!user) return business.branches[0];
    return business.branches.find(b => b.id === user.branchId) || business.branches[0];
  }, [user, business.branches]);

  useEffect(() => {
    const root = document.documentElement;
    const colors = THEME_PRESETS[currentThemePreset];
    root.style.setProperty('--nexus-primary', colors.primary);
    root.style.setProperty('--nexus-secondary', colors.secondary);
    root.style.setProperty('--nexus-accent', colors.accent);
    if (resolvedTheme === 'light') {
      document.body.classList.remove('dark');
    } else {
      document.body.classList.add('dark');
    }
  }, [currentThemePreset, resolvedTheme]);

  const handleLogin = (u: User, m: UIMode) => {
    setUser(u);
    setUiMode(m);
    const role = u.role;
    if (role === Role.MESERO) setActiveTab('waiterhub');
    else if (role === Role.CAJERO) setActiveTab('pos');
    else if (role === Role.COCINERO || role === Role.REPARTIDOR) setActiveTab('operations_hub');
    else setActiveTab('dashboard');
  };

  if (!user) return (
    <>
      <Background />
      <Login 
        onLogin={handleLogin} 
        language={language} 
        setLanguage={setLanguage} 
        theme={theme} 
        setTheme={setTheme} 
        users={users} 
        business={business} 
        uiMode={uiMode}
        setUiMode={setUiMode}
        currentThemePreset={currentThemePreset}
        setCurrentThemePreset={setCurrentThemePreset}
      />
    </>
  );

  const depleteStock = (orderItems: OrderItem[]) => {
      setInsumos(currentInsumos => {
          const insumosCopy = JSON.parse(JSON.stringify(currentInsumos)); // Deep copy for safe mutation
          orderItems.forEach(orderItem => {
              const product = products.find(p => p.id === orderItem.productId);
              if (product && product.recipe) {
                  product.recipe.forEach(recipeItem => {
                      const insumoIndex = insumosCopy.findIndex((i: Insumo) => i.id === recipeItem.insumoId);
                      if (insumoIndex !== -1) {
                          const totalDepletion = recipeItem.quantity * orderItem.quantity;
                          insumosCopy[insumoIndex].stock -= totalDepletion;
                      }
                  });
              }
          });
          return insumosCopy;
      });
  };

  const handleCreateOrder = (order: Order, quiet?: boolean) => {
    if (order.status === 'Closed') {
        depleteStock(order.items);
    }
    setOrders(prev => [order, ...prev]);
    if (order.tableId) {
      setTables(prev => prev.map(t => t.id === order.tableId ? {...t, status: 'Occupied', assignedWaiterId: order.waiterId} : t));
    }
     if (!quiet && currentBranch.hardware.alerts?.notifications?.newOrder) {
        try {
            const audio = new Audio(currentBranch.hardware.alerts.notifications.newOrder.sound);
            audio.play().catch(e => console.error("Audio error", e));
        } catch(e) { console.error(e) }
    }
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    const previousOrder = orders.find(o => o.id === updatedOrder.id);
    
    if (updatedOrder.status === 'Closed' && previousOrder?.status !== 'Closed') {
        depleteStock(updatedOrder.items);
    }

    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    
    if (updatedOrder.status === 'Closed' && updatedOrder.tableId) {
      setTables(prev => prev.map(t => t.id === updatedOrder.tableId ? {...t, status: 'Available', assignedWaiterId: undefined} : t));
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {...o, status} : o));
  };
  
  const handleAssignCourier = (orderId: string, courierId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {...o, courierId, status: 'Dispatched'} : o));
  };
  
  const handleCreatePO = (po: PurchaseOrder) => {
    setPurchaseOrders(prev => [po, ...prev]);
  };
  
  const handleUpdatePO = (updatedPO: PurchaseOrder) => {
    // If PO is received, update inventory
    if (updatedPO.status === 'Received') {
      setInsumos(prevInsumos => {
        const newInsumos = [...prevInsumos];
        updatedPO.items.forEach(item => {
          const insumoIndex = newInsumos.findIndex(i => i.id === item.insumoId);
          if (insumoIndex !== -1) {
            newInsumos[insumoIndex].stock += item.quantity;
          }
        });
        return newInsumos;
      });
    }
    setPurchaseOrders(prev => prev.map(po => po.id === updatedPO.id ? updatedPO : po));
  };
  
  const handleShiftEnd = (report: ShiftReport) => {
    setShiftReports(prev => [report, ...prev]);
    setActiveTab('pos'); // Return to POS screen after closing shift
  };
  
  const handleClockAction = (employeeId: string, type: 'in' | 'out') => {
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = attendanceRecords.find(r => r.employeeId === employeeId && r.date === today);

    if (type === 'in' && !existingRecord) {
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId,
        date: today,
        clockIn: new Date().toISOString(),
      };
      setAttendanceRecords(prev => [...prev, newRecord]);
    } else if (type === 'out' && existingRecord && !existingRecord.clockOut) {
      setAttendanceRecords(prev => prev.map(r => r.id === existingRecord.id ? { ...r, clockOut: new Date().toISOString() } : r));
    }
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
  };

  const currentUserAsEmployee = employees.find(e => e.id === user.id);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Background />
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        language={language} 
        setLanguage={setLanguage}
        theme={theme} 
        setTheme={setTheme}
        currentThemePreset={currentThemePreset}
        setCurrentThemePreset={setCurrentThemePreset}
      />
      <BiometricClock employees={employees} branch={currentBranch} language={language} onClockAction={handleClockAction} />
      
      <main className="flex-1 m-2 lg:m-4 rounded-[2rem] lg:rounded-[3rem] overflow-hidden flex flex-col relative z-10 border glass-panel shadow-2xl">
          {isCalculatorOpen && <GlobalCalculator onClose={() => setIsCalculatorOpen(false)} language={language} />}

          <header className="h-20 lg:h-24 px-8 flex items-center justify-between border-b shrink-0 bg-white/30 dark:bg-black/20 border-slate-200 dark:border-white/5">
             <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-nexus-primary text-slate-900 shadow-lg">
                    <img src={business.logo} className="w-8 h-8" alt="logo" />
                </div>
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                       <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">{business.name}</h1>
                       <span className="px-3 py-1 bg-nexus-primary/10 text-nexus-primary rounded-lg border border-nexus-primary/20 text-[9px] font-black uppercase tracking-widest">{currentBranch.name}</span>
                    </div>
                    <p className="text-[10px] font-black text-nexus-primary uppercase tracking-[0.4em] opacity-80">{SYSTEM_SLOGAN}</p>
                </div>
             </div>

             <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                    <p className="text-[11px] font-black uppercase text-slate-700 dark:text-white tracking-widest">{user.name}</p>
                    <p className="text-[8px] font-black uppercase text-nexus-primary opacity-60">{user.role}</p>
                </div>
                <button onClick={() => setUser(null)} className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-200 dark:bg-white/5 text-nexus-primary hover:bg-red-600 hover:text-white transition-all">
                    <i className="fa-solid fa-power-off"></i>
                </button>
             </div>
          </header>

          <div key={activeTab} className="flex-1 overflow-hidden p-6 lg:p-8 custom-scroll animate-quantum-in">
               {activeTab === 'dashboard' && <Dashboard onCreateOrder={handleCreateOrder} orders={orders} products={products} employees={employees} shiftReports={shiftReports} business={business} language={language} onNavigate={setActiveTab} user={user} insumos={insumos} attendanceRecords={attendanceRecords} auditLogs={auditLogs} resolvedTheme={resolvedTheme} />}
               {activeTab === 'pos' && <POS products={products} currentBranch={currentBranch} user={user} business={business} language={language} onCreateOrder={handleCreateOrder} onUpdateOrder={handleUpdateOrder} tables={tables} users={users} orders={orders} reservations={reservations} setReservations={setReservations} customers={customers} setCustomers={setCustomers} />}
               {activeTab === 'operations_hub' && <OperationsHub orders={orders} products={products} users={users} language={language} onUpdateStatus={handleUpdateOrderStatus} onAssignCourier={handleAssignCourier} user={user} />}
               {activeTab === 'supply_chain' && <SupplyChain insumos={insumos} setInsumos={setInsumos} suppliers={suppliers} purchaseOrders={purchaseOrders} onCreatePO={handleCreatePO} onUpdatePO={handleUpdatePO} branch={currentBranch} language={language} orders={orders} products={products} />}
               {activeTab === 'fleet_command' && <FleetCommand vehicles={deliveryVehicles} setVehicles={setDeliveryVehicles} users={users} setUsers={setUsers} orders={orders} language={language} />}
               {activeTab === 'network' && <NetworkMonitor branch={currentBranch} language={language} />}
               {activeTab === 'management' && <Management users={users} setUsers={setUsers} suppliers={suppliers} setSuppliers={setSuppliers} branches={business.branches} currentUser={user} language={language} onNavigate={setActiveTab} employees={employees} setEmployees={setEmployees} orders={orders} insumos={insumos} business={business} resolvedTheme={resolvedTheme} customers={customers} products={products} setProducts={setProducts} shiftReports={shiftReports} attendanceRecords={attendanceRecords} />}
               {/* FIX: Corrected prop name from `setConfig` to `setBusiness` to match the state setter from useState. */}
               {activeTab === 'settings' && <Settings config={business} setConfig={setBusiness} lang={language} user={user} />}
               {activeTab === 'attendance' && <Attendance user={user} language={language} onClockAction={handleClockAction} records={attendanceRecords} />}
               {activeTab === 'my_calendar' && currentUserAsEmployee && <MyCalendar employee={currentUserAsEmployee} records={attendanceRecords} language={language} />}
               {activeTab === 'employee_portal' && currentUserAsEmployee && <EmployeePortal employee={currentUserAsEmployee} language={language} onUpdateEmployee={handleUpdateEmployee} records={attendanceRecords} />}
               {activeTab === 'waiterhub' && <WaiterHub orders={orders} user={user} language={language} onUpdateStatus={handleUpdateOrderStatus} tables={tables} products={products} onCreateOrder={handleCreateOrder} currentBranch={currentBranch} />}
               {activeTab === 'tablemap' && <TableMap tables={tables} setTables={setTables} branch={currentBranch} users={users} user={user} />}
               {activeTab === 'audit' && <Audit logs={auditLogs} language={language} user={user} />}
               {activeTab === 'crm' && <CRM customers={customers} orders={orders} language={language} />}
               {activeTab === 'end_of_shift' && <EndOfShift user={user} orders={orders} onShiftEnd={handleShiftEnd} language={language} />}
          </div>

          <footer className="h-10 px-8 flex items-center justify-between text-[8px] font-black uppercase text-slate-500 dark:text-zinc-700 bg-white/50 dark:bg-black/40 border-t border-slate-200 dark:border-white/5 shrink-0">
             <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsCalculatorOpen(prev => !prev)}
                  className="w-10 h-10 -my-2 rounded-full flex items-center justify-center text-slate-500 dark:text-zinc-500 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-nexus-primary transition-all"
                  aria-label="Toggle Calculator"
                >
                  <i className="fa-solid fa-calculator"></i>
                </button>
                <span className="tracking-widest">{APP_EDITION}</span>
                <span className="w-1 h-1 bg-slate-300 dark:bg-zinc-800 rounded-full"></span>
                <span className="text-slate-400 dark:text-zinc-500 tracking-widest">{SYSTEM_SLOGAN}</span>
             </div>
             <div className="text-right">
                <a href={`https://${CREDITS_URL}`} target="_blank" rel="noreferrer" className="hover:text-nexus-primary transition-all tracking-widest">
                  AR Control Inteligente
                </a>
                <p className="text-slate-400 dark:text-zinc-500 tracking-widest">{CREDITS_NAME}</p>
             </div>
          </footer>
      </main>
    </div>
  );
};

export default App;