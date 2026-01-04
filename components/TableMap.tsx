
import React, { useState } from 'react';
import { Table, BranchInfo, User, Role } from '../types';

interface Props {
  tables: Table[];
  setTables: (t: Table[]) => void;
  branch: BranchInfo;
  users: User[];
  user: User;
}

const TableMap: React.FC<Props> = ({ tables, setTables, branch, users, user }) => {
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const isManager = [Role.GERENTE, Role.JEFE_AREA, Role.ADMIN_IT, Role.PROPIETARIO, Role.CAJERO].includes(user.role);
  
  const waiters = users.filter(u => u.role === Role.MESERO);

  const assignWaiter = (tableId: string, waiterId: string) => {
    setTables(tables.map(t => t.id === tableId ? { ...t, assignedWaiterId: waiterId } : t));
    setEditingTable(null);
  };
  
  const unassignWaiter = (tableId: string) => {
    setTables(tables.map(t => t.id === tableId ? { ...t, assignedWaiterId: undefined } : t));
    setEditingTable(null);
  }

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in">
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
         <div>
            <h2 className="text-2xl font-black uppercase text-slate-800 dark:text-white tracking-tighter">Gestión de Salón</h2>
            <p className="text-[10px] font-black text-nexus-primary uppercase tracking-widest">Asignación de Zonas y Personal</p>
         </div>
         {isManager && <span className="px-4 py-2 bg-nexus-primary/10 text-nexus-primary text-[9px] rounded-lg font-black uppercase">Modo Gestión Activo</span>}
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-4 pr-6">
         {tables.map(t => {
           const assigned = users.find(u => u.id === t.assignedWaiterId);
           return (
             <button 
              key={t.id}
              onClick={() => isManager && setEditingTable(t)}
              disabled={!isManager}
              className={`aspect-square rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center p-4 space-y-2 relative group ${
                t.status === 'Available' ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
              } ${isManager ? 'cursor-pointer hover:border-nexus-primary' : ''}`}
             >
                <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">#{t.number}</span>
                <div className="text-center">
                   <p className="text-[8px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Mesero:</p>
                   <p className={`text-[10px] font-black uppercase truncate max-w-[80px] ${assigned ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-zinc-700 italic'}`}>
                     {assigned ? assigned.name.split(' ')[0] : 'N/A'}
                   </p>
                </div>
                {isManager && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-[2rem] transition-opacity">
                     <i className="fa-solid fa-user-plus text-white text-2xl"></i>
                  </div>
                )}
             </button>
           );
         })}
      </div>

      {isManager && editingTable && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl p-6">
           <div className="glass-panel w-full max-w-sm p-12 rounded-[4rem] text-center space-y-8 animate-slide-up">
              <div>
                 <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Asignar Mesero</h3>
                 <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest mt-2">Mesa #{editingTable.number}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto custom-scroll pr-2">
                 {waiters.map(w => (
                   <button 
                    key={w.id} 
                    onClick={() => assignWaiter(editingTable.id, w.id)}
                    className="p-5 rounded-3xl bg-slate-200/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/5 hover:border-nexus-primary hover:bg-nexus-primary/5 text-left transition-all"
                   >
                      <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{w.name}</p>
                   </button>
                 ))}
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => unassignWaiter(editingTable.id)} className="flex-1 py-4 bg-red-500/10 text-red-400 rounded-2xl font-black text-[9px] uppercase">Desasignar</button>
                <button onClick={() => setEditingTable(null)} className="flex-1 py-4 bg-slate-200/50 dark:bg-white/5 text-slate-500 dark:text-zinc-500 rounded-2xl font-black text-[9px] uppercase">Cancelar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TableMap;