
import React, { useState } from 'react';
import { Order, Product, User, Language, Role } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  orders: Order[];
  products: Product[];
  users: User[];
  language: Language;
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onAssignCourier: (orderId: string, courierId: string) => void;
  user: User;
}

type KDSView = 'Cocina' | 'Bar' | 'Logística' | 'Reparto';

const KDSViewComponent: React.FC<{
  orders: Order[];
  products: Product[];
  onUpdateStatus: (id: string, status: Order['status']) => void;
  station: 'Cocina' | 'Bar';
}> = ({ orders, products, onUpdateStatus, station }) => {
  const activeOrders = orders.filter(o =>
    o.status !== 'Closed' &&
    o.status !== 'Cancelled' &&
    o.items.some(item => {
      const p = products.find(prod => prod.id === item.productId);
      return p?.category === station;
    })
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-amber-500 text-white';
      case 'Preparing': return 'bg-nexus-accent text-white';
      case 'Ready': return 'bg-nexus-primary text-black animate-pulse';
      default: return 'bg-slate-300 dark:bg-zinc-800 text-slate-800 dark:text-white';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 h-full overflow-y-auto no-scrollbar pr-2">
      {activeOrders.map(o => (
        <div key={o.id} className="glass-panel rounded-[3.5rem] flex flex-col overflow-hidden animate-slide-up group h-fit">
           <div className={`p-8 flex justify-between items-center ${getStatusColor(o.status)}`}>
              <div>
                 <h4 className="text-2xl font-black uppercase tracking-tighter">{o.id}</h4>
                 <p className="text-[10px] font-bold uppercase opacity-80">{o.tableId ? `MESA #${o.tableId}` : (o.orderType === 'Delivery' ? 'REPARTO' : 'PARA LLEVAR')}</p>
              </div>
              <div className="text-right">
                 <p className="text-[11px] font-black uppercase tracking-widest">{o.status === 'Open' ? 'RECIBIDO' : o.status === 'Preparing' ? 'EN PROCESO' : 'LISTO'}</p>
                 <p className="text-[9px] font-mono mt-1 opacity-60">T: {new Date(o.createdAt).toLocaleTimeString()}</p>
              </div>
           </div>
           <div className="p-8 flex-1 space-y-6 overflow-y-auto max-h-[300px] no-scrollbar">
              {o.items.filter(item => products.find(p => p.id === item.productId)?.category === station).map((item, idx) => {
                  const p = products.find(prod => prod.id === item.productId);
                  return (
                    <div key={idx} className="flex items-start space-x-5 group/item">
                      <div className="w-10 h-10 rounded-2xl bg-slate-200/50 dark:bg-black/40 border border-slate-300/50 dark:border-white/10 flex items-center justify-center font-black text-sm text-nexus-primary group-hover/item:scale-110 transition-transform">{item.quantity}</div>
                      <div><p className="font-bold text-base lg:text-lg uppercase tracking-tight text-slate-800 dark:text-white">{p?.name}</p></div>
                    </div>
                  );
              })}
           </div>
           <div className="p-8 pt-0 grid grid-cols-1 gap-4">
              {o.status === 'Open' && <button onClick={() => onUpdateStatus(o.id, 'Preparing')} className="w-full py-6 bg-nexus-accent text-white rounded-3xl font-black text-[12px] uppercase tracking-widest touch-active shadow-xl shadow-nexus-accent/20">COMENZAR</button>}
              {o.status === 'Preparing' && <button onClick={() => onUpdateStatus(o.id, 'Ready')} className="w-full py-6 bg-nexus-primary text-black rounded-3xl font-black text-[12px] uppercase tracking-widest touch-active shadow-xl shadow-nexus-primary/20">TERMINAR</button>}
              {o.status === 'Ready' && <button className="w-full py-6 bg-slate-300 dark:bg-zinc-800 text-slate-800 dark:text-white rounded-3xl font-black text-[12px] uppercase tracking-widest touch-active">ENTREGADO</button>}
           </div>
        </div>
      ))}
    </div>
  );
};

const LogisticsViewComponent: React.FC<{
  orders: Order[];
  users: User[];
  user: User;
  onAssignCourier: (orderId: string, courierId: string) => void;
}> = ({ orders, users, user, onAssignCourier }) => {
  const isManager = [Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE].includes(user.role);
  const couriers = users.filter(u => u.role === Role.REPARTIDOR);
  const pendingOrders = orders.filter(o => o.status === 'Ready' && o.orderType === 'Delivery' && !o.courierId);

  return (
    <div className="glass-panel rounded-[2.5rem] flex flex-col overflow-hidden bg-slate-200/30 dark:bg-black/40 h-full">
      <div className="p-8 border-b border-slate-300/50 dark:border-white/5 bg-[var(--nexus-accent)]/10">
        <h3 className="text-xs font-black uppercase text-[var(--nexus-accent)] tracking-widest">Cola de Despacho ({pendingOrders.length})</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {pendingOrders.map(o => (
          <div key={o.id} className="p-6 bg-slate-200/50 dark:bg-white/5 rounded-3xl border border-slate-300/50 dark:border-white/10 space-y-6">
             <div className="flex justify-between items-center">
                <div>
                   <p className="text-lg font-black text-slate-800 dark:text-white">{o.id}</p>
                   <p className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase">{o.deliveryDetails?.customerName || 'Anónimo'}</p>
                </div>
             </div>
             {isManager && (
               <select className="w-full nexus-input text-xs uppercase" onChange={(e) => onAssignCourier(o.id, e.target.value)} defaultValue="">
                  <option value="" disabled>Seleccionar Repartidor</option>
                  {couriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};

const DeliveryKDSViewComponent: React.FC<{
  orders: Order[];
  users: User[];
  onUpdateStatus: (id: string, status: Order['status']) => void;
}> = ({ orders, users, onUpdateStatus }) => {
  const dispatchedOrders = orders.filter(o => o.orderType === 'Delivery' && o.status === 'Dispatched');
  
  return(
    <div className="glass-panel rounded-[3rem] flex flex-col overflow-hidden h-full">
      <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-sky-500/10">
        <h3 className="text-sm font-black uppercase text-sky-600 dark:text-sky-400 tracking-widest">En Ruta ({dispatchedOrders.length})</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {dispatchedOrders.map(o => {
          const courier = users.find(u => u.id === o.courierId);
          return (
            <div key={o.id} className="p-6 bg-slate-200/50 dark:bg-black/40 rounded-2xl border border-slate-300/50 dark:border-white/5 space-y-4">
              <div>
                <p className="font-black text-slate-800 dark:text-white uppercase">{o.id}</p>
                <p className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 uppercase mt-1">{o.deliveryDetails?.address || 'Dirección no especificada'}</p>
              </div>
              <div className="p-3 bg-slate-300/50 dark:bg-black/20 rounded-lg text-center text-[9px] font-black uppercase text-slate-500 dark:text-zinc-400 tracking-widest flex items-center justify-center gap-2">
                <i className="fa-solid fa-user-astronaut text-sky-500"></i>
                <span>{courier?.name || 'Repartidor Asignado'}</span>
              </div>
              <button onClick={() => onUpdateStatus(o.id, 'Closed')} className="w-full py-4 bg-sky-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/10">Marcar como Entregado</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OperationsHub: React.FC<Props> = ({ orders, products, users, language, onUpdateStatus, onAssignCourier, user }) => {
    const [activeKDS, setActiveKDS] = useState<KDSView>(user.role === Role.REPARTIDOR ? 'Reparto' : 'Cocina');
    
    const visibleTabs: KDSView[] = [
      'Cocina',
      'Bar',
      ...([Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE, Role.CAJERO].includes(user.role) ? ['Logística' as KDSView] : []),
      ...([Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE, Role.REPARTIDOR].includes(user.role) ? ['Reparto' as KDSView] : [])
    ];
    
    // Remove duplicates
    const uniqueTabs = [...new Set(visibleTabs)];

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Hub Operativo Central</h2>
                    <p className="text-[10px] text-nexus-primary font-black uppercase tracking-[0.5em] mt-1">Sincronización de Producción y Logística</p>
                </div>
                <div className="flex bg-slate-200/50 dark:bg-black/20 p-1.5 rounded-2xl border border-slate-300/50 dark:border-white/5">
                    {uniqueTabs.map(view => (
                        <button key={view} onClick={() => setActiveKDS(view)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeKDS === view ? 'bg-nexus-primary text-slate-900 shadow-xl' : 'text-slate-500 dark:text-zinc-500'}`}>
                            {view}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                {activeKDS === 'Cocina' && <KDSViewComponent station="Cocina" orders={orders} products={products} onUpdateStatus={onUpdateStatus} />}
                {activeKDS === 'Bar' && <KDSViewComponent station="Bar" orders={orders} products={products} onUpdateStatus={onUpdateStatus} />}
                {activeKDS === 'Logística' && <LogisticsViewComponent orders={orders} users={users} user={user} onAssignCourier={onAssignCourier} />}
                {activeKDS === 'Reparto' && <DeliveryKDSViewComponent orders={orders} users={users} onUpdateStatus={onUpdateStatus} />}
            </div>
        </div>
    );
};

export default OperationsHub;
