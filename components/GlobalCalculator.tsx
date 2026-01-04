
import React, { useState } from 'react';
import { Language } from '../types';

interface Props {
  onClose: () => void;
  language: Language;
}

const GlobalCalculator: React.FC<Props> = ({ onClose, language }) => {
  const [value, setValue] = useState('0');

  const handlePress = (key: string) => {
    if (key === 'C') setValue('0');
    else if (key === '=') {
      try {
        const result = Function('"use strict";return (' + value.replace('x', '*') + ')')();
        setValue(String(result));
      } catch { setValue('Error'); }
    } else {
      setValue(value === '0' || value === 'Error' ? key : value + key);
    }
  };

  return (
    <div className="fixed top-32 right-12 w-80 glass-panel rounded-[3rem] p-8 shadow-2xl z-[1000] animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-black text-nexus-primary uppercase tracking-[0.3em]">
          Nexus Calculator
        </h3>
        <button onClick={onClose} className="text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-white transition-colors">
          <i className="fa-solid fa-times text-sm"></i>
        </button>
      </div>

      <div className="bg-slate-200 dark:bg-black/60 p-6 rounded-3xl mb-8 border border-slate-300 dark:border-white/5 text-right font-mono text-3xl font-black text-slate-900 dark:text-white overflow-hidden truncate shadow-inner">
        {value}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+','C'].map(k => (
          <button 
            key={k}
            onClick={() => handlePress(k)}
            className={`h-14 rounded-2xl text-xs font-black transition-all active:scale-90 ${
              k === 'C' ? 'col-span-2 bg-red-500/10 text-red-500 border border-red-500/20' : 
              k === '=' ? 'col-span-2 bg-nexus-primary text-black shadow-lg' : 
              'bg-slate-200/50 dark:bg-white/5 text-slate-700 dark:text-zinc-300 border border-slate-300/50 dark:border-white/5 hover:bg-slate-300/50 dark:hover:bg-white/10'
            }`}
          >
            {k === '*' ? 'x' : k}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GlobalCalculator;
