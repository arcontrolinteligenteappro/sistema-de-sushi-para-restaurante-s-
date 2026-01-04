
import React, { useState, useMemo } from 'react';
import { Order, BusinessConfig, Language, Role, User, Product, Employee, ShiftReport, Insumo, AttendanceRecord, AuditLog } from '../types';
import { TRANSLATIONS } from '../constants';
import AIAssistant from './AIAssistant';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import OrderSupervision from './OrderSupervision';

interface Props {
  orders: Order[];
  products: Product[];
  employees: Employee[];
  shiftReports: ShiftReport[];
  business: BusinessConfig;
  language: Language;
  onNavigate: (tab: string) => void;
  user: User;
  insumos: Insumo[];
  attendanceRecords: AttendanceRecord[];
  auditLogs: AuditLog[];
  resolvedTheme: 'light' | 'dark';
  onCreateOrder: (order: Order, quiet?: boolean) => void;
}

const Dashboard: React.FC<Props> = ({ orders, products, employees, shiftReports, business, language, onNavigate, user, insumos, attendanceRecords, auditLogs, resolvedTheme, onCreateOrder }) => {
  const t = TRANSLATIONS[language] as any;
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const isManager = [Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE].includes(user.role);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysClosedOrders = useMemo(() => orders.filter(o => o.status === 'Closed' && o.createdAt.startsWith(todayStr)), [orders, todayStr]);

  const todaysSales = useMemo(() => todaysClosedOrders.reduce((acc, o) => acc + o.total, 0), [todaysClosedOrders]);
  
  const activeStaffCount = useMemo(() => attendanceRecords.filter(r => r.date === todayStr && !r.clockOut).length, [attendanceRecords, todayStr]);

  const lowStockCount = useMemo(() => insumos.filter(i => i.stock <= i.minStock).length, [insumos]);
  
  const salesLast7Days = useMemo(() => {
    const data: { name: string; Ventas: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString(language, { weekday: 'short' });
      const total = orders.filter(o => o.status === 'Closed' && o.createdAt.startsWith(dateStr)).reduce((acc, o) => acc + o.total, 0);
      data.push({ name: dayName, Ventas: total });
    }
    return data;
  }, [orders, language]);
  
  const salesByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    todaysClosedOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          if (!categoryMap[product.category]) categoryMap[product.category] = 0;
          categoryMap[product.category] += product.price * item.quantity;
        }
      });
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [todaysClosedOrders, products]);
  
  const COLORS = ['var(--nexus-primary)', 'var(--nexus-accent)', '#f43f5e', '#f59e0b'];
  const tickColor = resolvedTheme === 'dark' ? '#94A3B8' : '#334155';

  const StatCard: React.FC<{icon: string; label: string; value: string | number; color: string; onClick?: () => void;}> = ({icon, label, value, color, onClick}) => (
    <button onClick={onClick} disabled={!onClick} className={`glass-panel p-8 rounded-[3rem] text-left flex items-start gap-6 group ${onClick ? 'cursor-pointer' : ''}`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-all duration-300 ${color}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="flex flex-col">
        <p className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-500 tracking-widest">{label}</p>
        <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter mt-1">{value}</p>
      </div>
    </button>
  );

  return (
    <div className="space-y-8 pb-20 relative h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="fa-sack-dollar" label="Ventas de Hoy" value={`$${todaysSales.toLocaleString()}`} color="bg-green-500/10 text-green-500" />
        <StatCard icon="fa-users" label="Personal Activo" value={activeStaffCount} color="bg-blue-500/10 text-blue-500" onClick={() => onNavigate('management')} />
        <StatCard icon="fa-boxes-stacked" label="Alertas de Inventario" value={lowStockCount} color="bg-amber-500/10 text-amber-500" onClick={() => onNavigate('supply_chain')} />
        <StatCard icon="fa-file-invoice" label="Tickets Cerrados" value={todaysClosedOrders.length} color="bg-indigo-500/10 text-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[350px]">
        <div className="lg:col-span-3 glass-panel p-8 rounded-[3rem] flex flex-col">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">Ventas (Últimos 7 Días)</h3>
          <div className="flex-1 -ml-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesLast7Days}>
                <defs><linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--nexus-primary)" stopOpacity={0.4}/><stop offset="95%" stopColor="var(--nexus-primary)" stopOpacity={0}/></linearGradient></defs>
                <Tooltip wrapperClassName="!bg-slate-100 dark:!bg-nexus-panel !rounded-2xl !border !border-slate-300/50 dark:!border-white/10" cursor={{stroke: 'var(--nexus-primary)', strokeWidth: 2, strokeDasharray: '5 5'}} />
                <XAxis dataKey="name" tick={{fill: tickColor, fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: tickColor, fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} width={30}/>
                <Area type="monotone" dataKey="Ventas" stroke="var(--nexus-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-2 glass-panel p-8 rounded-[3rem] flex flex-col">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">Ventas por Categoría (Hoy)</h3>
          <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={salesByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                        {salesByCategory.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 800, textTransform: 'uppercase'}}/>
                </PieChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isManager ? (
            <OrderSupervision 
                orders={orders}
                products={products}
                branch={business.branches.find(b => b.id === user.branchId)!}
                language={language}
                onCreateOrder={onCreateOrder}
            />
        ) : (
            <div className="glass-panel p-8 rounded-[3rem] h-[400px] flex flex-col">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">Últimas Órdenes</h3>
              <div className="space-y-2 overflow-y-auto custom-scroll flex-1 pr-2">
                {orders.slice(0, 10).map(o => (
                  <div key={o.id} className="p-3 bg-slate-200/50 dark:bg-black/20 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 dark:text-zinc-300">{o.id}</span>
                    <span className="font-mono text-slate-500 dark:text-zinc-500">${o.total.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${o.status === 'Closed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
        )}
         <div className="glass-panel p-8 rounded-[3rem] h-[400px] flex flex-col">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">Actividad del Sistema</h3>
          <div className="space-y-2 overflow-y-auto custom-scroll flex-1 pr-2">
            {auditLogs.slice(0, 10).map(log => (
              <div key={log.id} className="p-3 bg-slate-200/50 dark:bg-black/20 rounded-xl flex items-center gap-4 text-xs">
                <span className="font-bold text-slate-500 dark:text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="font-bold text-slate-700 dark:text-zinc-300">{log.userName}</span>
                <span className="text-slate-500 dark:text-zinc-400 truncate">{log.action}: {log.details}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {user.role === Role.ADMIN_IT && (
        <button 
          onClick={() => setIsAiAssistantOpen(true)}
          className="fixed bottom-10 right-10 lg:bottom-12 lg:right-12 w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl z-50 hover:scale-110 transition-transform animate-pulse"
          aria-label="Open AI Assistant"
        >
          <i className="fa-solid fa-wand-magic-sparkles text-3xl"></i>
        </button>
      )}

      {isAiAssistantOpen && (
        <AIAssistant 
          isOpen={isAiAssistantOpen}
          onClose={() => setIsAiAssistantOpen(false)}
          language={language}
          data={{ orders, products, employees, shiftReports, business }}
        />
      )}
    </div>
  );
};

export default Dashboard;