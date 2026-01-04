import React, { useState, useEffect } from 'react';
import { Order, Product, BranchInfo, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  orders: Order[];
  products: Product[];
  branch: BranchInfo;
  language: Language;
  onCreateOrder: (order: Order, quiet?: boolean) => void;
}

const OrderSupervision: React.FC<Props> = ({ orders, products, branch, language, onCreateOrder }) => {
  const t = TRANSLATIONS[language] as any;
  const [platformOrders, setPlatformOrders] = useState<any[]>([]);

  // Simulation of incoming platform orders
  useEffect(() => {
    if (!products.length) return; // Guard against running with no products
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const app = (['UberEats', 'DoorDash', 'Grubhub'] as const)[Math.floor(Math.random() * 3)];
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const newOrder = {
          id: `DEL-${Math.floor(Math.random() * 9000) + 1000}`,
          app,
          total: randomProduct.price.toFixed(2),
          items: [{ productId: randomProduct.id, quantity: 1, name: randomProduct.name }],
          timestamp: new Date().toISOString()
        };
        setPlatformOrders(prev => [newOrder, ...prev.slice(0, 9)]);
        
        // Auto-inject order into the system
        const orderSubtotal = Number(newOrder.total);
        const orderTax = orderSubtotal * branch.config.taxRate;
        const orderTotal = orderSubtotal + orderTax;

        const internalOrder: Order = {
          id: newOrder.id,
          branchId: branch.id,
          // FIX: Updated OrderItem status from 'Open' to 'Pending' to match the type definition.
          items: [{ productId: randomProduct.id, quantity: 1, status: 'Pending' }],
          subtotal: orderSubtotal,
          tax: orderTax,
          tip: 0,
          total: orderTotal,
          currency: branch.config.baseCurrency,
          status: 'Open',
          deliveryApp: newOrder.app,
          createdAt: newOrder.timestamp,
          orderType: 'Delivery',
        };
        onCreateOrder(internalOrder, true); // Quietly create order
        
        // Play specific platform order sound
        if (branch.hardware.alerts?.notifications?.platformOrder) {
            try {
                const audio = new Audio(branch.hardware.alerts.notifications.platformOrder.sound);
                audio.play().catch(e => console.error("Platform sound error", e));
            } catch(e) { console.error(e) }
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [products, branch, onCreateOrder]);

  return (
    <div className="glass-panel p-8 rounded-[3rem] h-[400px] flex flex-col">
      <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">Monitor de Órdenes Cloud</h3>
      <div className="flex-1 overflow-y-auto custom-scroll pr-2 space-y-3">
          {platformOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-700">
               <i className="fa-solid fa-satellite-dish text-4xl mb-4 opacity-50"></i>
               <p className="text-xs font-bold uppercase tracking-widest opacity-50">Esperando conexión...</p>
            </div>
          ) : (
            platformOrders.map(o => (
              <div key={o.id} className="p-4 bg-slate-200/50 dark:bg-black/30 rounded-xl flex items-center justify-between animate-in slide-in-from-left duration-500">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    o.app === 'UberEats' ? 'bg-zinc-900 text-emerald-400' :
                    o.app === 'DoorDash' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    <i className={`fa-brands ${o.app === 'UberEats' ? 'fa-uber' : 'fa-person-running'}`}></i>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-tight">{o.id}</p>
                    <p className="text-[9px] text-slate-500 dark:text-zinc-400 font-bold uppercase">{o.app}</p>
                  </div>
                </div>
                 <p className="text-lg font-black text-slate-800 dark:text-white tracking-tighter">${o.total}</p>
              </div>
            ))
          )}
        </div>
    </div>
  );
};

export default OrderSupervision;
