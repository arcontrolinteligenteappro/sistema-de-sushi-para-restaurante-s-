
import React, { useState, useMemo } from 'react';
import { Employee, Language, User, PayrollPayment, Order, AttendanceRecord } from '../../types';
import { TRANSLATIONS } from '../../constants';

interface Props {
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  branchId: string;
  language: Language;
  user: User;
  orders: Order[];
  attendanceRecords: AttendanceRecord[];
}

const HR: React.FC<Props> = ({ employees, setEmployees, branchId, language, user, orders, attendanceRecords }) => {
  const t = TRANSLATIONS[language];
  const [view, setView] = useState<'List' | 'Payroll' | 'Attendance'>('List');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const branchEmployees = employees.filter(e => e.branchId === branchId);

  const calculateHoursWorked = (clockIn: string, clockOut?: string): number => {
    if (!clockOut) return 0;
    const inTime = new Date(clockIn).getTime();
    const outTime = new Date(clockOut).getTime();
    return (outTime - inTime) / (1000 * 60 * 60);
  };

  const handlePay = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const periodRecords = attendanceRecords.filter(r => r.employeeId === emp.id && new Date(r.date) >= sevenDaysAgo);
    const daysWorked = new Set(periodRecords.map(r => r.date)).size;
    const hoursWorked = periodRecords.reduce((acc, r) => acc + calculateHoursWorked(r.clockIn, r.clockOut), 0);
    
    let baseSalary = 0;
    if (emp.paymentType === 'daily') {
        baseSalary = daysWorked * emp.dailyRate;
    } else {
        baseSalary = hoursWorked * emp.hourlyRate;
    }

    const weeklyBenefits = (emp.benefits / 30) * 7;

    const totalTips = orders
        .filter(o => o.waiterId === emp.id && o.status === 'Closed' && o.tip > 0 && new Date(o.createdAt) >= sevenDaysAgo)
        .reduce((acc, o) => acc + (o.tip || 0), 0);

    let totalDeductions = 0;
    const workDaysInPeriod: string[] = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        const dayOfWeek = day.getDay();
        if (!emp.restDays.includes(dayOfWeek)) {
            workDaysInPeriod.push(day.toISOString().split('T')[0]);
        }
    }

    workDaysInPeriod.forEach(workDay => {
        const recordExists = periodRecords.some(r => r.date === workDay);
        if (!recordExists) {
            totalDeductions += emp.absencePenalty;
        }
    });

    periodRecords.forEach(record => {
        if (emp.shiftStartTime && emp.latePenalty > 0) {
            const clockInDate = new Date(record.clockIn);
            const scheduledStartDate = new Date(`${record.date}T${emp.shiftStartTime}:00`);
            if (clockInDate > scheduledStartDate) {
                totalDeductions += emp.latePenalty;
            }
        }
    });

    const totalNeto = baseSalary + weeklyBenefits + totalTips - totalDeductions;
    const todayStr = new Date().toISOString().split('T')[0];

    if (emp.payments.some(p => p.period === todayStr)) {
        return; // Already paid
    }

    const newPayment: PayrollPayment = {
        id: `pay-${Date.now()}`,
        period: todayStr,
        baseSalary,
        benefits: weeklyBenefits,
        tips: totalTips,
        deductions: totalDeductions,
        amount: totalNeto,
        status: 'Paid'
    };

    const updatedEmployee = {
        ...emp,
        payments: [...emp.payments, newPayment]
    };

    setEmployees(employees.map(e => e.id === employeeId ? updatedEmployee : e));
  };

  return (
    <div className="space-y-12 pb-32 animate-fade">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Capital Humano</h2>
          <p className="text-[10px] text-nexus-primary font-black uppercase tracking-[0.5em] mt-2">Nómina, Asistencia y Horarios</p>
        </div>
        <div className="flex bg-slate-200/50 dark:bg-black/20 p-1.5 rounded-2xl border border-slate-300/50 dark:border-white/5">
          {['List', 'Payroll', 'Attendance'].map((v) => (
            <button 
              key={v}
              onClick={() => setView(v as any)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                view === v ? 'bg-nexus-primary text-slate-900 shadow-xl' : 'text-slate-500 dark:text-zinc-500'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      {view === 'List' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           {branchEmployees.map(e => (
             <div key={e.id} className="glass-panel p-10 rounded-[3rem] flex items-center space-x-8 group">
                <div className="w-20 h-20 rounded-2xl bg-nexus-primary/10 text-nexus-primary flex items-center justify-center text-3xl font-black">
                   {e.name[0]}
                </div>
                <div className="flex-1">
                   <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{e.name}</h4>
                   <p className="text-[9px] font-black text-nexus-primary uppercase mt-1 tracking-widest">{e.role}</p>
                   <p className="text-[8px] font-mono text-slate-500 dark:text-zinc-500 mt-2">ID: {e.id}</p>
                </div>
             </div>
           ))}
        </div>
      )}

      {view === 'Payroll' && (
        <div className="glass-panel rounded-[3rem] overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-200/50 dark:bg-black/40 text-slate-500 dark:text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                    <th className="p-8">Colaborador</th>
                    <th className="p-8">Periodo (Últ. 7 Días)</th>
                    <th className="p-8">Sueldo Base</th>
                    <th className="p-8">Beneficios</th>
                    <th className="p-8">Propinas</th>
                    <th className="p-8">Deducciones</th>
                    <th className="p-8">Total Neto</th>
                    <th className="p-8">Acciones</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                 {branchEmployees.map(emp => {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                    const periodRecords = attendanceRecords.filter(r => r.employeeId === emp.id && new Date(r.date) >= sevenDaysAgo);
                    const daysWorked = new Set(periodRecords.map(r => r.date)).size;
                    const hoursWorked = periodRecords.reduce((acc, r) => acc + calculateHoursWorked(r.clockIn, r.clockOut), 0);
                    
                    let baseSalary = 0;
                    if (emp.paymentType === 'daily') {
                        baseSalary = daysWorked * emp.dailyRate;
                    } else {
                        baseSalary = hoursWorked * emp.hourlyRate;
                    }

                    const weeklyBenefits = (emp.benefits / 30) * 7;

                    const totalTips = orders
                        .filter(o => o.waiterId === emp.id && o.status === 'Closed' && o.tip > 0 && new Date(o.createdAt) >= sevenDaysAgo)
                        .reduce((acc, o) => acc + (o.tip || 0), 0);

                    let totalDeductions = 0;
                    const workDaysInPeriod: string[] = [];
                    for (let i = 0; i < 7; i++) {
                        const day = new Date();
                        day.setDate(day.getDate() - i);
                        const dayOfWeek = day.getDay();
                        if (!emp.restDays.includes(dayOfWeek)) {
                            workDaysInPeriod.push(day.toISOString().split('T')[0]);
                        }
                    }

                    workDaysInPeriod.forEach(workDay => {
                        const recordExists = periodRecords.some(r => r.date === workDay);
                        if (!recordExists) {
                            totalDeductions += emp.absencePenalty;
                        }
                    });

                    periodRecords.forEach(record => {
                        if (emp.shiftStartTime && emp.latePenalty > 0) {
                            const clockInDate = new Date(record.clockIn);
                            const scheduledStartDate = new Date(`${record.date}T${emp.shiftStartTime}:00`);
                            if (clockInDate > scheduledStartDate) {
                                totalDeductions += emp.latePenalty;
                            }
                        }
                    });

                    const totalNeto = baseSalary + weeklyBenefits + totalTips - totalDeductions;
                    const todayStr = new Date().toISOString().split('T')[0];
                    const isPaidForPeriod = emp.payments.some(p => p.period === todayStr);

                    return (
                       <tr key={emp.id} className="text-slate-600 dark:text-zinc-300">
                          <td className="p-8 font-black text-slate-800 dark:text-white">{emp.name}</td>
                          <td className="p-8 text-[10px] uppercase font-mono">{hoursWorked.toFixed(1)}hrs / {daysWorked} días</td>
                          <td className="p-8 font-mono">${baseSalary.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className="p-8 font-mono">+${weeklyBenefits.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className="p-8 font-mono text-nexus-primary">+${totalTips.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className="p-8 font-mono text-red-500">-${totalDeductions.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className="p-8 font-black text-slate-800 dark:text-white">${totalNeto.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className="p-8">
                             {isPaidForPeriod ? (
                                <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase bg-green-500/10 text-green-500 border border-green-500/20">
                                    Pagado
                                </span>
                             ) : (
                                <button onClick={() => handlePay(emp.id)} className="text-nexus-primary hover:underline text-[10px] font-black uppercase tracking-widest">Pagar</button>
                             )}
                          </td>
                       </tr>
                    );
                 })}
              </tbody>
           </table>
        </div>
      )}

      {view === 'Attendance' && (
        <div className="glass-panel rounded-[3rem] overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-200/50 dark:bg-black/40 text-slate-500 dark:text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                    <th className="p-8">Colaborador</th>
                    <th className="p-8">Fecha</th>
                    <th className="p-8">Entrada</th>
                    <th className="p-8">Salida</th>
                    <th className="p-8">Horas Totales</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                 {attendanceRecords.filter(r => branchEmployees.some(e => e.id === r.employeeId)).map(rec => {
                    const employee = employees.find(e => e.id === rec.employeeId);
                    const hours = calculateHoursWorked(rec.clockIn, rec.clockOut);
                    return (
                       <tr key={rec.id} className="text-slate-600 dark:text-zinc-300">
                          <td className="p-8 font-black text-slate-800 dark:text-white">{employee?.name}</td>
                          <td className="p-8 text-[10px] uppercase font-mono">{rec.date}</td>
                          <td className="p-8 font-mono">{new Date(rec.clockIn).toLocaleTimeString()}</td>
                          <td className="p-8 font-mono">{rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString() : '---'}</td>
                          <td className="p-8 font-black text-slate-800 dark:text-white">{hours > 0 ? `${hours.toFixed(2)} hrs` : '---'}</td>
                       </tr>
                    );
                 })}
              </tbody>
           </table>
        </div>
      )}

    </div>
  );
};

export default HR;
