
import React, { useState } from 'react';
import { Employee, AttendanceRecord, Language } from '../../types';
import { TRANSLATIONS } from '../../constants';

interface Props {
  employee: Employee;
  records: AttendanceRecord[];
  language: Language;
}

const MyCalendar: React.FC<Props> = ({ employee, records, language }) => {
  const t = TRANSLATIONS[language];
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const dayOfWeek = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  return (
    <div className="space-y-8 animate-fade h-full flex flex-col">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">{t.my_calendar}</h2>
          <p className="text-[10px] text-nexus-primary font-black uppercase tracking-[0.5em] mt-1">Planificación de Turnos y Asistencia</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-zinc-400 hover:bg-slate-300 dark:hover:bg-white/10 transition-all"><i className="fa-solid fa-chevron-left"></i></button>
          <h3 className="text-lg font-bold text-slate-700 dark:text-white w-48 text-center">{currentDate.toLocaleString(language, { month: 'long', year: 'numeric' })}</h3>
          <button onClick={handleNextMonth} className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-zinc-400 hover:bg-slate-300 dark:hover:bg-white/10 transition-all"><i className="fa-solid fa-chevron-right"></i></button>
        </div>
      </header>
      <div className="flex-1 glass-panel rounded-[3rem] p-8 flex flex-col">
        <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {dayOfWeek.map((day, index) => (
                <div key={index} className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-600 tracking-widest">{day}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-2 flex-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="bg-slate-200/20 dark:bg-black/10 rounded-2xl"></div>)}
            {Array.from({ length: daysInMonth }).map((_, day) => {
                const dayNumber = day + 1;
                const date = new Date(year, month, dayNumber);
                const dateString = date.toISOString().split('T')[0];
                const dayOfWeek = date.getDay();

                const isRestDay = employee.restDays.includes(dayOfWeek);
                const record = records.find(r => r.date === dateString && r.employeeId === employee.id);

                return(
                    <div key={dayNumber} className={`p-4 rounded-2xl border transition-all ${isRestDay ? 'bg-slate-300/50 dark:bg-white/5 border-transparent' : 'bg-slate-200/50 dark:bg-black/20 border-slate-300/50 dark:border-white/5'}`}>
                        <p className={`font-black text-lg ${isRestDay ? 'text-slate-500 dark:text-zinc-600' : 'text-slate-800 dark:text-white'}`}>{dayNumber}</p>
                        {record && (
                            <div className="mt-2 text-[10px] font-mono space-y-1">
                                <p className="text-green-600 dark:text-green-400">IN: {new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                {record.clockOut && <p className="text-red-600 dark:text-red-400">OUT: {new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                            </div>
                        )}
                        {isRestDay && <p className="mt-2 text-[9px] font-black uppercase text-slate-500 dark:text-zinc-600">Descanso</p>}
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default MyCalendar;
