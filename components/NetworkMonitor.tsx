
import React from 'react';
import { BranchInfo, Language, DeviceStatus } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  branch: BranchInfo;
  language: Language;
}

const NetworkMonitor: React.FC<Props> = ({ branch, language }) => {
  const t = (TRANSLATIONS as any)[language];

  const getDeviceIcon = (type: DeviceStatus['type']) => {
    switch (type) {
      case 'POS_MAIN': return 'fa-cash-register';
      case 'KDS_SCREEN': return 'fa-fire-burner';
      case 'WAITER_TAB': return 'fa-tablet-screen-button';
      default: return 'fa-microchip';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-16 animate-quantum-in">
      <header className="flex justify-between items-end border-b border-white/5 pb-10">
        <div className="space-y-5">
           <h2 className="text-6xl font-black uppercase tracking-tighter text-white">{t.network_map}</h2>
           <div className="flex items-center gap-6">
              <span className="px-6 py-2 bg-nexus-primary/10 text-nexus-primary text-[11px] font-black rounded-full border border-nexus-primary/20 animate-pulse uppercase tracking-[0.2em]">{branch.name}</span>
              <span className="text-[11px] text-zinc-600 font-bold uppercase tracking-[0.4em]">Protocol Layer: AR-CORE-V22</span>
           </div>
        </div>
        <div className="flex gap-6">
           <div className="glass-panel px-12 py-6 rounded-[2.5rem] text-center border-l-4 border-l-nexus-primary">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Global Node Health</p>
              <p className="text-4xl font-black text-white tracking-tighter">99.9%</p>
           </div>
        </div>
      </header>

      {/* RADIAL RADAR VIEW */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden glass-panel rounded-[5rem] bg-black/60 shadow-inner">
         
         {/* Background Grid */}
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
         
         {/* Radar Circles */}
         <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-[1000px] h-[1000px] rounded-full border border-nexus-primary border-dashed animate-[spin_40s_linear_infinite]"></div>
            <div className="w-[700px] h-[700px] rounded-full border border-nexus-primary/40 animate-[spin_25s_linear_infinite_reverse]"></div>
            <div className="w-[400px] h-[400px] rounded-full border border-nexus-primary/20"></div>
         </div>

         {/* Central Hub Core */}
         <div className="relative z-10 w-56 h-56 glass-panel rounded-[5rem] flex flex-col items-center justify-center bg-nexus-primary/10 border-2 border-nexus-primary shadow-[0_0_100px_rgba(59,130,246,0.3)] animate-heartbeat-aura">
            <i className="fa-solid fa-server text-5xl text-nexus-primary mb-5"></i>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] text-nexus-primary">SYSTEM HUB</p>
            <p className="text-[10px] font-mono text-white/50 mt-1">{branch.id.toUpperCase()}-CORE</p>
         </div>

         {/* Connected Devices - Radial Layout */}
         {branch.devices.map((device, idx) => {
           const angle = (idx * (360 / branch.devices.length)) * (Math.PI / 180);
           const radius = 340;
           const x = Math.cos(angle) * radius;
           const y = Math.sin(angle) * radius;

           return (
             <div 
               key={device.id} 
               className="absolute z-20 group"
               style={{ transform: `translate(${x}px, ${y}px)` }}
             >
                {/* Visual Connection Line */}
                <div className="absolute top-1/2 left-1/2 w-[340px] h-px bg-gradient-to-r from-nexus-primary/20 to-transparent origin-left opacity-30 group-hover:opacity-100 transition-opacity" style={{ transform: `rotate(${angle * (180 / Math.PI) + 180}deg)` }}></div>
                
                <div className={`w-32 h-32 glass-panel rounded-[3rem] flex flex-col items-center justify-center transition-all duration-700 border-2 ${
                   device.status === 'Online' ? 'border-nexus-primary/20 group-hover:border-nexus-primary group-hover:scale-110 shadow-lg' : 'border-red-500 animate-pulse'
                }`}>
                   <i className={`fa-solid ${getDeviceIcon(device.type)} text-3xl ${device.status === 'Online' ? 'text-nexus-primary' : 'text-red-500'} mb-3`}></i>
                   <p className="text-[10px] font-black uppercase tracking-tight text-white">{device.name}</p>
                   <p className="text-[8px] font-mono text-zinc-500 mt-1 uppercase">{device.latency}</p>
                </div>
             </div>
           );
         })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
         <div className="glass-panel p-12 rounded-[4rem] border-b-8 border-b-nexus-primary/40 relative overflow-hidden group">
            <div className="laser-sweep-overlay opacity-0 group-hover:opacity-100"></div>
            <h4 className="text-[12px] font-black text-zinc-500 uppercase tracking-widest mb-8">Tráfico de Red Sincrónico</h4>
            <div className="h-24 flex items-end gap-1.5">
               {Array.from({length: 30}).map((_, i) => (
                 <div key={i} className="flex-1 bg-nexus-primary/20 rounded-t-xl animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }}></div>
               ))}
            </div>
         </div>
         <div className="glass-panel p-12 rounded-[4rem] border-b-8 border-b-nexus-secondary/40 space-y-6">
            <h4 className="text-[12px] font-black text-zinc-500 uppercase tracking-widest">Seguridad Perimetral</h4>
            <div className="space-y-5">
               <div className="flex justify-between items-center text-[11px] font-black"><span className="text-zinc-500 uppercase">Cifrado de Capa</span><span className="text-white">SSL/TLS 1.3</span></div>
               <div className="flex justify-between items-center text-[11px] font-black"><span className="text-zinc-500 uppercase">Filtro de IP</span><span className="text-nexus-primary">ACTIVO</span></div>
               <div className="flex justify-between items-center text-[11px] font-black"><span className="text-zinc-500 uppercase">Respaldo Cloud</span><span className="text-white">CADA 15 MIN</span></div>
            </div>
         </div>
         <div className="glass-panel p-12 rounded-[4rem] flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-nexus-primary/10 flex items-center justify-center text-2xl text-nexus-primary"><i className="fa-solid fa-cloud-arrow-up"></i></div>
            <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-none">DATABASE SYNC STATUS</h4>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Todos los nodos locales sincronizados con la nube.</p>
         </div>
      </div>
    </div>
  );
};

export default NetworkMonitor;
