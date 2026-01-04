
import React, { useState } from 'react';
import { Order, User, Language, Role, Table, Product, OrderItem, BranchInfo } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  orders: Order[];
  user: User;
  language: Language;
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onCreateOrder: (order: Order) => void;
  tables: Table[];
  products: Product[];
  currentBranch: BranchInfo;
}

const WaiterHub: React.FC<Props> = ({ orders, user, language, onUpdateStatus, tables, products, onCreateOrder, currentBranch }) => {
  const t = TRANSLATIONS[language] as any;
  const myTables = tables.filter(t => t.assignedWaiterId === user.id);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  
  const handleOpenOrder = () => {
    if (!selectedTable || cart.length === 0) return;

    const subtotal = cart.reduce((acc, item) => {
        const p = products.find(prod => prod.id === item.productId);
        return acc + (p ? p.price * item.quantity : 0);
    }, 0);
    const tax = subtotal * currentBranch.config.taxRate;
    const total = subtotal + tax;

    const newOrder: Order = {
      id: `SN-${Date.now().toString().slice(-4)}`,
      branchId: user.branchId!,
      items: cart,
      subtotal,
      tax,
      tip: 0,
      total,
      currency: 'MXN',
      status: 'Open',
      createdAt: new Date().toISOString(),
      orderType: 'Dine-in',
      tableId: selectedTable.id,
      waiterId: user.id,
      waiterName: user.name,
    };
    
    onCreateOrder(newOrder);
    setSelectedTable(null);
    setCart([]);
  };

  if (selectedTable) {
    // Simplified order taking view
    return (
      <div className="h-full flex flex-col animate-fade-in">
        <header className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-white/5">
          <h3 className="text-xl font-black uppercase text-slate-800 dark:text-white">Comanda Mesa #{selectedTable.number}</h3>
          <button onClick={() => { setSelectedTable(null); setCart([]); }} className="px-6 py-2 bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-zinc-400 rounded-xl text-[10px] uppercase font-black">Cerrar</button>
        </header>
        <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
          <div className="col-span-8 grid grid-cols-4 gap-3 overflow-y-auto custom-scroll pr-2">
            {products.map(p => (
              <button key={p.id} onClick={() => {
                const existing = cart.find(c => c.productId === p.id);
                if (existing) setCart(cart.map(c => c.productId === p.id ? { ...c, quantity: c.quantity + 1 } : c));
                else setCart([...cart, { productId: p.id, quantity: 1, status: 'Pending' }]);
              }} className="p-4 rounded-lg bg-slate-200/50 dark:bg-white/5 text-left h-24 flex flex-col justify-between hover:border hover:border-nexus-primary">
                <p className="text-[10px] font-black uppercase text-slate-800 dark:text-white">{p.name}</p>
                <p className="text-lg font-bold text-nexus-primary">${p.price}</p>
              </button>
            ))}
          </div>
          <div className="col-span-4 bg-slate-200/30 dark:bg-black/40 rounded-lg flex flex-col p-4">
            <h4 className="text-sm font-bold uppercase mb-4 text-slate-800 dark:text-white">Resumen</h4>
            <div className="flex-1 space-y-2 overflow-y-auto custom-scroll pr-1">
              {cart.map((item, i) => {
                 const product = products.find(p => p.id === item.productId);
                 return (
                    <div key={i} className="text-xs flex justify-between items-center bg-slate-300/40 dark:bg-black/20 p-2 rounded text-slate-700 dark:text-white">
                        <span className="truncate w-32">{product?.name}</span>
                        <span className="font-bold">{item.quantity}x</span>
                    </div>
                 )
              })}
            </div>
            <button onClick={handleOpenOrder} disabled={cart.length === 0} className="mt-4 w-full py-4 bg-nexus-primary text-black rounded-lg font-bold uppercase disabled:opacity-30">Enviar a Cocina</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade pb-20">
      <header className="flex items-center justify-between">
         <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Mi Salón: {user.name}</h2>
            <p className="text-[10px] text-nexus-primary font-black uppercase tracking-[0.5em] mt-2">{t.assigned_tables}</p>
         </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {myTables.length === 0 ? (
           <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-20">
              <i className="fa-solid fa-map-signs text-8xl mb-6"></i>
              <p className="text-sm font-black uppercase tracking-[0.5em]">No tiene mesas asignadas</p>
           </div>
        ) : (
          myTables.map(table => {
            const tableOrder = orders.find(o => o.tableId === table.id && o.status !== 'Closed');
            return (
              <button 
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`aspect-square rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center p-6 space-y-3 group ${
                  table.status === 'Available' ? 'border-green-500/20 bg-green-500/5 hover:border-green-500' : 'border-red-500/20 bg-red-500/5 hover:border-red-500'
                }`}
              >
                 <span className="text-4xl font-black text-slate-800 dark:text-white leading-none">#{table.number}</span>
                 {tableOrder ? (
                   <div className="text-center">
                      <p className="text-[9px] font-bold text-nexus-primary uppercase">{tableOrder.status}</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">${tableOrder.total.toFixed(2)}</p>
                   </div>
                 ) : (
                   <p className="text-xs font-bold text-green-400 uppercase">{t.open_account}</p>
                 )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WaiterHub;
