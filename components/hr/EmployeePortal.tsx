
import React, { useState } from 'react';
import { Employee, Language, AttendanceRecord } from '../../types';
import { TRANSLATIONS } from '../../constants';

interface Props {
  employee: Employee;
  language: Language;
  onUpdateEmployee: (updated: Employee) => void;
  records: AttendanceRecord[];
}

const EmployeePortal: React.FC<Props> = ({ employee, language, onUpdateEmployee, records }) => {
  const [tab, setTab] = useState<'home' | 'vacations' | 'feedback' | 'attendance'>('home');
  const t = TRANSLATIONS[language];

  const handleFeedback = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newFeedback = {
      id: `FB-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      subject: formData.get('subject') as string,
      comment: formData.get('comment') as string,
      status: 'Pending' as const
    };
    onUpdateEmployee({ ...employee, feedback: [newFeedback, ...employee.feedback] });
    alert(t.feedback_sent_successfully);
    e.currentTarget.reset();
  };

  const tabs = [
    { id: 'home', label: t.home },
    { id: 'vacations', label: t.vacations },
    { id: 'feedback', label: t.feedback },
    { id: 'attendance', label: t.attendance_history },
  ];

  return (
    <div className="space-y-12 animate-fade h-full overflow-y-auto pb-32 no-scrollbar">
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-10">
         <div className="flex items-center space-x-8">
            <div className="w-24 h-24 rounded-[2rem] bg-nexus-secondary/10 text-nexus-secondary flex items-center justify-center text-4xl font-black shadow-2xl">
               {employee.name[0]}
            </div>
            <div>
               <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{employee.name}</h3>
               <p className="text-nexus-primary font-black uppercase tracking-widest text-[10px] mt-2">{employee.role} • {t.station_active}</p>
            </div>
         </div>
         <div className="flex bg-slate-200/50 dark:bg-black/20 p-1 rounded-2xl border border-slate-300/50 dark:border-white/5">
            {tabs.map(t_item => (
              <button 
                key={t_item.id}
                onClick={() => setTab(t_item.id as any)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t_item.id ? 'bg-white/50 dark:bg-white/10 text-slate-800 dark:text-white shadow-xl' : 'text-slate-500 dark:text-zinc-500'}`}
              >
                {t_item.label}
              </button>
            ))}
         </div>
      </header>

      {tab === 'home' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="glass-panel p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 space-y-6">
              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">{t.financial_nexus}</h4>
              <div className="space-y-4">
                 {employee.payments.map(p => (
                   <div key={p.id} className="p-6 bg-slate-200/50 dark:bg-black/40 rounded-2xl border border-slate-300/50 dark:border-white/5 flex justify-between items-center group hover:border-nexus-primary transition-all">
                      <div>
                         <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{p.period}</p>
                         <p className="text-[9px] text-slate-500 dark:text-zinc-500 uppercase mt-1">{t.status_colon} {p.status}</p>
                      </div>
                      <p className="text-xl font-black text-nexus-primary tracking-tighter">${p.amount.toLocaleString()}</p>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="glass-panel p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 space-y-6">
              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">{t.system_broadcasts}</h4>
              <div className="h-48 flex items-center justify-center text-center opacity-30">
                 <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{t.no_critical_messages}</p>
              </div>
           </div>
        </div>
      )}

      {tab === 'feedback' && (
        <div className="max-w-2xl mx-auto glass-panel p-16 rounded-[4rem] border border-slate-200 dark:border-white/5 space-y-12">
           <div className="text-center">
              <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">{t.suggestion_terminal}</h4>
              <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-bold uppercase tracking-widest mt-4">{t.direct_uplink_admin}</p>
           </div>
           <form onSubmit={handleFeedback} className="space-y-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-2">{t.subject}</label>
                 <input name="subject" required className="w-full nexus-input" />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-2">{t.comment_report}</label>
                 <textarea name="comment" required rows={5} className="w-full nexus-input resize-none" />
              </div>
              <button className="w-full py-6 bg-nexus-primary text-slate-900 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-xl">{t.broadcast_feedback}</button>
           </form>
        </div>
      )}

      {tab === 'vacations' && (
        <div className="glass-panel p-12 rounded-[4rem] border border-slate-200 dark:border-white/5 text-center">
           <i className="fa-solid fa-umbrella-beach text-6xl text-nexus-primary opacity-20 mb-8"></i>
           <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{t.time_off_protocol}</h4>
           <p className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-widest mt-4 max-w-sm mx-auto leading-relaxed">
             {t.days_available} <span className="text-nexus-primary font-black">{employee.vacationDaysAccrued}</span>. 
             {t.vacation_request_policy}
           </p>
           <button className="mt-10 px-12 py-5 bg-slate-200/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/5 text-slate-800 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-nexus-primary hover:text-slate-900 transition-all">{t.start_request}</button>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="glass-panel p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 space-y-6">
            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Historial de Asistencia</h4>
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scroll pr-2">
                {records.filter(r => r.employeeId === employee.id)
                  .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(r => (
                    <div key={r.id} className="p-6 bg-slate-200/50 dark:bg-black/40 rounded-2xl border border-slate-300/50 dark:border-white/5 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{new Date(r.date).toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="font-mono text-xs text-right">
                           <p className="text-green-500">IN: {new Date(r.clockIn).toLocaleTimeString()}</p>
                           {r.clockOut ? <p className="text-red-500">OUT: {new Date(r.clockOut).toLocaleTimeString()}</p> : <p className="text-slate-500">--:--</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )}
    </div>
  );
};

export default EmployeePortal;
