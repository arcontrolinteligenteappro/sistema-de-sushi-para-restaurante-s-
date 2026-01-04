
import React, { useState } from 'react';
import { Employee, BranchInfo, Language } from '../types';
import { TRANSLATIONS, CREDITS_NAME, CREDITS_URL } from '../constants';

interface Props {
  employees: Employee[];
  branch: BranchInfo;
  language: Language;
  onClockAction: (id: string, type: 'in' | 'out') => void;
}

const BiometricClock: React.FC<Props> = ({ employees, branch, onClockAction, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [actionType, setActionType] = useState<'in' | 'out'>('in');
  
  const t = TRANSLATIONS[language];
  const branchEmployees = employees.filter(e => e.branchId === branch.id);

  const handleScan = () => {
    if (!selectedEmpId) return;
    setScanning(true);
    // Simulation of USB Biometric Read
    setTimeout(() => {
      onClockAction(selectedEmpId, actionType);
      setScanning(false);
      setIsOpen(false);
      setSelectedEmpId('');
    }, 2000);
  };

  return (
    <div className="fixed top-28 right-8 z-[500] flex flex-col items-end">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all border ${
          isOpen ? 'bg-red-600 border-red-400 text-white rotate-45' : 'bg-zinc-900 dark:bg-nexus-panel border-zinc-800 text-cyan-400'
        }`}
      >
        <i className={`fa-solid ${isOpen ? 'fa-plus' : 'fa-fingerprint'} text-2xl`}></i>
      </button>

      {isOpen && (
        <div className="mt-6 w-96 glass-panel p-10 rounded-[3.5rem] border dark:border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-4 duration-500">
          <div className="text-center mb-8">
            <h4 className="text-[11px] font-black text-indigo-500 dark:text-cyan-400 uppercase tracking-[0.3em]">Terminal Biométrica</h4>
            <p className="text-[9px] text-slate-500 dark:text-zinc-500 uppercase mt-2 font-bold">{branch.name} • Nodo Activo</p>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-3">
               {[
                 { id: 'in', icon: 'fa-right-to-bracket', label: 'Entrada' },
                 { id: 'out', icon: 'fa-right-from-bracket', label: 'Salida' },
               ].map(act => (
                 <button 
                  key={act.id}
                  onClick={() => setActionType(act.id as any)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-center space-x-3 ${
                    actionType === act.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-200 dark:bg-white/5 border-transparent text-slate-500 dark:text-zinc-400'
                  }`}
                 >
                    <i className={`fa-solid ${act.icon}`}></i>
                    <span className="text-[9px] font-black uppercase">{act.label}</span>
                 </button>
               ))}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-1">Identificar Colaborador</label>
              <select 
                value={selectedEmpId}
                onChange={e => setSelectedEmpId(e.target.value)}
                className="w-full nexus-input"
              >
                <option value="">-- Colocar Huella --</option>
                {branchEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div className={`relative w-40 h-40 rounded-full border-4 flex items-center justify-center mx-auto transition-all duration-1000 ${
              scanning ? 'border-cyan-500 shadow-[0_0_60px_rgba(6,182,212,0.4)] bg-cyan-500/5' : 'border-slate-200 dark:border-zinc-800'
            }`}>
              <i className={`fa-solid fa-fingerprint text-6xl ${scanning ? 'text-cyan-400 animate-pulse' : 'text-slate-300 dark:text-zinc-700'}`}></i>
              {scanning && <div className="absolute inset-0 rounded-full border-t-4 border-cyan-400 animate-spin"></div>}
            </div>

            <button 
              onClick={handleScan}
              disabled={!selectedEmpId || scanning}
              className="w-full py-6 bg-slate-800 dark:bg-zinc-800 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-cyan-600 transition-all disabled:opacity-20"
            >
              {scanning ? 'Sincronizando...' : 'Confirmar Protocolo'}
            </button>

            <p className="text-[8px] text-center text-slate-500 dark:text-zinc-600 font-bold uppercase tracking-widest mt-6">{CREDITS_NAME} | {CREDITS_URL}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiometricClock;
