
import React, { useState, useEffect } from 'react';
import { User, Language, AttendanceRecord } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  user: User;
  language: Language;
  onClockAction: (employeeId: string, type: 'in' | 'out') => void;
  records: AttendanceRecord[];
}

const Attendance: React.FC<Props> = ({ user, language, onClockAction, records }) => {
  const t = TRANSLATIONS[language] as any;
  const [currentTime, setCurrentTime] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.employeeId === user.id && r.date === today);
  const userRecords = records.filter(r => r.employeeId === user.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const canClockIn = !todayRecord;
  const canClockOut = todayRecord && !todayRecord.clockOut;

  const handleAction = (type: 'in' | 'out') => {
    onClockAction(user.id, type);
    setSuccessMessage(`Registro de ${type === 'in' ? 'entrada' : 'salida'} exitoso a las ${new Date().toLocaleTimeString()}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const getStatus = () => {
    if (todayRecord) {
        if (todayRecord.clockOut) {
            return { text: `Turno finalizado a las ${new Date(todayRecord.clockOut).toLocaleTimeString()}`, color: 'text-slate-500 dark:text-zinc-500' };
        }
        return { text: `Entrada registrada a las ${new Date(todayRecord.clockIn).toLocaleTimeString()}`, color: 'text-green-500 animate-pulse' };
    }
    return { text: 'Listo para iniciar turno', color: 'text-slate-500 dark:text-zinc-500' };
  }
  
  const status = getStatus();

  return (
    <div className="h-full flex flex-col lg:flex-row items-center justify-center gap-12 animate-nexus-in p-8">
       <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
            <p className="text-6xl md:text-9xl font-black tracking-tighter text-slate-800 dark:text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="font-bold text-lg text-slate-500 dark:text-zinc-500 uppercase tracking-widest mt-2">
                {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className={`mt-8 font-black text-sm uppercase tracking-widest ${status.color}`}>
                {status.text}
            </p>
            <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-md">
                <button onClick={() => handleAction('in')} disabled={!canClockIn} className="py-8 rounded-[2.5rem] bg-green-500/10 text-green-500 font-black uppercase tracking-widest text-lg border-2 border-green-500/20 disabled:opacity-20 disabled:grayscale transition-all hover:bg-green-500 hover:text-white">Entrada</button>
                <button onClick={() => handleAction('out')} disabled={!canClockOut} className="py-8 rounded-[2.5rem] bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-lg border-2 border-red-500/20 disabled:opacity-20 disabled:grayscale transition-all hover:bg-red-500 hover:text-white">Salida</button>
            </div>
             {successMessage && <div className="mt-8 p-4 bg-nexus-primary/10 text-nexus-primary rounded-xl text-xs font-bold animate-fade-in">{successMessage}</div>}
       </div>
       <div className="w-full lg:w-96 shrink-0 glass-panel p-8 rounded-[3rem] h-full flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white mb-4">Mi Historial Reciente</h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scroll pr-2">
                {userRecords.slice(0, 10).map(r => (
                    <div key={r.id} className="p-4 bg-slate-200/50 dark:bg-white/5 rounded-2xl border border-slate-300/50 dark:border-white/5">
                        <p className="text-[10px] font-black uppercase text-slate-800 dark:text-white">{new Date(r.date).toLocaleDateString([], {weekday: 'long', day: 'numeric'})}</p>
                        <div className="flex justify-between items-center mt-1 font-mono text-xs">
                            <span className="text-green-600 dark:text-green-400">IN: {new Date(r.clockIn).toLocaleTimeString()}</span>
                            {r.clockOut ? <span className="text-red-600 dark:text-red-400">OUT: {new Date(r.clockOut).toLocaleTimeString()}</span> : <span className="text-slate-400 dark:text-zinc-600">--:--</span>}
                        </div>
                    </div>
                ))}
            </div>
       </div>
    </div>
  );
};

export default Attendance;
