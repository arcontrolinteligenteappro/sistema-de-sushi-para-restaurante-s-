
import React, { useState } from 'react';
import { Customer, Language, Order } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  customers: Customer[];
  orders: Order[];
  language: Language;
}

const CRM: React.FC<Props> = ({ customers, orders, language }) => {
  const t = TRANSLATIONS[language] as any;
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="space-y-8 animate-fade h-full flex flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
         <div>
            <h2 className="text-2xl font-black uppercase text-slate-800 dark:text-white tracking-tighter">Inteligencia de Clientes (CRM)</h2>
            <p className="text-[10px] font-black text-[var(--nexus-primary)] uppercase tracking-widest">Protocolo de Fidelización & Reportes</p>
         </div>
         <input 
          type="text" 
          placeholder="Buscar por Teléfono o Nombre..." 
          className="nexus-input w-72 text-xs py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
         />
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-2">
         {filtered.map(c => {
           const customerOrders = orders.filter(o => o.customerId === c.id);
           return (
             <div key={c.id} className="glass-panel p-8 rounded-[3rem] space-y-6 hover:border-[var(--nexus-primary)] transition-all flex flex-col">
                <div className="flex justify-between items-start">
                   <div className="w-14 h-14 bg-slate-200/50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-xl text-slate-800 dark:text-white font-black">
                      {c.name[0]}
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Total Gastado</p>
                      <p className="text-xl font-black text-slate-800 dark:text-white">${c.totalSpent.toLocaleString()}</p>
                   </div>
                </div>

                <div className="flex-1">
                   <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{c.name}</h4>
                   <p className="text-[10px] font-black text-[var(--nexus-primary)] mt-1">{c.phone}</p>
                </div>

                <div className="space-y-2">
                   <p className="text-[8px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest">Historial de Tickets ({customerOrders.length})</p>
                   <div className="flex flex-wrap gap-2">
                      {customerOrders.length === 0 ? (
                          <div className="flex items-center justify-center w-full h-full">
                            <p className="text-[8px] font-bold text-slate-400 dark:text-zinc-600 uppercase">Sin historial</p>
                          </div>
                      ) : (
                        customerOrders.slice(0, 4).map(o => (
                          <span key={o.id} className="bg-slate-200/50 dark:bg-black/40 px-3 py-1 rounded-lg text-[8px] font-bold text-slate-600 dark:text-zinc-400 border border-slate-300/50 dark:border-white/5">#{o.id}</span>
                        ))
                      )}
                   </div>
                </div>

                <button className="w-full py-4 bg-slate-200/50 dark:bg-white/5 text-[9px] font-black uppercase text-slate-500 dark:text-zinc-500 rounded-2xl hover:bg-[var(--nexus-primary)] hover:text-black transition-all">Ver Perfil Completo</button>
             </div>
           );
         })}
      </div>
    </div>
  );
};

export default CRM;
