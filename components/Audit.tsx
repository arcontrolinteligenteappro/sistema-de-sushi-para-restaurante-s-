
import React, { useState } from 'react';
import { AuditLog, Language, Role, User } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  logs: AuditLog[];
  language: Language;
  user: User;
}

const Audit: React.FC<Props> = ({ logs, language, user }) => {
  const t = TRANSLATIONS[language] as any;
  const [filter, setFilter] = useState('');

  const filteredLogs = logs.filter(log => 
    log.userName.toLowerCase().includes(filter.toLowerCase()) || 
    log.action.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-nexus-in h-full flex flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-6">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-nexus-secondary/20 text-nexus-secondary rounded-2xl flex items-center justify-center text-3xl"><i className="fa-solid fa-user-shield"></i></div>
            <div>
               <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">{t.audit}</h2>
               <p className="text-[10px] text-nexus-secondary font-black uppercase tracking-[0.5em] mt-2">Seguimiento de Protocolos en Tiempo Real</p>
            </div>
         </div>
         <input 
          type="text" 
          placeholder="Filtrar por Usuario o Acción..." 
          className="nexus-input w-80 text-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
         />
      </header>

      <div className="flex-1 overflow-hidden glass-panel rounded-[3.5rem] flex flex-col">
         <div className="flex-1 overflow-y-auto custom-scroll">
            <table className="w-full text-left">
               <thead className="sticky top-0 bg-slate-200/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-300 dark:border-white/5">
                  <tr className="text-[9px] font-black uppercase text-slate-500 dark:text-zinc-500 tracking-widest">
                     <th className="p-8">Timestamp</th>
                     <th className="p-8">Operador</th>
                     <th className="p-8">Módulo</th>
                     <th className="p-8">Acción</th>
                     <th className="p-8">Detalles</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className="text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors group">
                       <td className="p-8 text-[10px] font-mono text-slate-500 dark:text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                       <td className="p-8">
                          <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{log.userName}</p>
                          <p className="text-[8px] font-bold text-nexus-primary uppercase mt-1">UID: {log.userId.slice(0,8)}</p>
                       </td>
                       <td className="p-8">
                          <span className="bg-slate-200 dark:bg-white/5 px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-slate-300 dark:border-white/5">{log.module}</span>
                       </td>
                       <td className="p-8 text-xs font-black uppercase text-slate-800 dark:text-white">{log.action}</td>
                       <td className="p-8 text-[10px] text-slate-500 dark:text-zinc-500 font-bold max-w-xs truncate">{log.details}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Audit;
