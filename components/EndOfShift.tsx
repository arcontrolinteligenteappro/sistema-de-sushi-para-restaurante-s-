
import React, { useState, useMemo } from 'react';
import { User, Order, Language, ShiftReport } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  user: User;
  orders: Order[];
  onShiftEnd: (report: ShiftReport) => void;
  language: Language;
}

const EndOfShift: React.FC<Props> = ({ user, orders, onShiftEnd, language }) => {
  const t = TRANSLATIONS[language] as any;
  const [declaredCash, setDeclaredCash] = useState<number | ''>('');
  const [declaredCard, setDeclaredCard] = useState<number | ''>('');
  const [declaredTransfer, setDeclaredTransfer] = useState<number | ''>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const systemTotals = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const shiftOrders = orders.filter(o => 
      o.closedBy === user.id && 
      o.createdAt.startsWith(today) &&
      o.status === 'Closed'
    );

    return shiftOrders.reduce((acc, order) => {
      if (order.paymentType === 'Efectivo') acc.cash += order.total;
      if (order.paymentType === 'Tarjeta') acc.card += order.total;
      if (order.paymentType === 'Transferencia') acc.transfer += order.total;
      return acc;
    }, { cash: 0, card: 0, transfer: 0 });
  }, [orders, user.id]);

  const declaredTotals = {
    cash: Number(declaredCash) || 0,
    card: Number(declaredCard) || 0,
    transfer: Number(declaredTransfer) || 0,
  };
  
  const discrepancies = {
    cash: declaredTotals.cash - systemTotals.cash,
    card: declaredTotals.card - systemTotals.card,
    transfer: declaredTotals.transfer - systemTotals.transfer,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const report: ShiftReport = {
      id: `SR-${Date.now()}`,
      branchId: user.branchId!,
      userId: user.id,
      userName: user.name,
      endedAt: new Date().toISOString(),
      systemTotals,
      declaredTotals,
      discrepancies,
    };

    onShiftEnd(report);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-8 animate-fade-in">
        <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center text-5xl">
          <i className="fa-solid fa-circle-check"></i>
        </div>
        <div className="text-center">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Cierre Enviado</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-500 mt-2">Tu turno ha finalizado. El reporte ha sido enviado a gerencia.</p>
        </div>
      </div>
    );
  }
  
  const DiscrepancyRow: React.FC<{label: string, system: number, declared: number | '', setDeclared: (val: number | '') => void}> = ({label, system, declared, setDeclared}) => {
    const discrepancy = (Number(declared) || 0) - system;
    const color = discrepancy === 0 ? 'text-slate-500 dark:text-zinc-500' : discrepancy > 0 ? 'text-green-500' : 'text-red-500';

    return(
      <div className="glass-panel p-6 rounded-3xl">
        <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-1">{label}</label>
        <div className="grid grid-cols-3 gap-4 items-center mt-2">
            <div className="p-4 bg-slate-200/50 dark:bg-black/20 rounded-xl text-center">
                <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-600 uppercase">Sistema</p>
                <p className="font-mono font-bold text-slate-700 dark:text-zinc-300 truncate">${system.toFixed(2)}</p>
            </div>
            <input type="number" step="0.01" value={declared} onChange={e => setDeclared(e.target.value === '' ? '' : parseFloat(e.target.value))} required className="w-full nexus-input text-lg font-mono text-center h-full" placeholder="$0.00" />
            <div className="p-4 bg-slate-200/50 dark:bg-black/20 rounded-xl text-center">
                <p className="text-[9px] font-bold text-slate-400 dark:text-zinc-600 uppercase">Diferencia</p>
                <p className={`font-mono font-black ${color} truncate`}>${discrepancy.toFixed(2)}</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center animate-fade-in">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-10">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto text-3xl"><i className="fa-solid fa-file-invoice-dollar"></i></div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{t.end_of_shift}</h2>
          <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Protocolo de Cierre Ciego Asistido</p>
        </div>
        
        <div className="space-y-4">
            <DiscrepancyRow label="Total Contado en Efectivo" system={systemTotals.cash} declared={declaredCash} setDeclared={setDeclaredCash} />
            <DiscrepancyRow label="Total Vouchers Tarjeta" system={systemTotals.card} declared={declaredCard} setDeclared={setDeclaredCard} />
            <DiscrepancyRow label="Total Transferencias" system={systemTotals.transfer} declared={declaredTransfer} setDeclared={setDeclaredTransfer} />
        </div>

        <div className="pt-6">
            <button type="submit" className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-xl shadow-red-600/20">Finalizar y Enviar Reporte</button>
        </div>
      </form>
    </div>
  );
};

export default EndOfShift;
