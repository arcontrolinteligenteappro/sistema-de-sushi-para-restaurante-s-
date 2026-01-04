
import React, { useState } from 'react';
import { Reservation, BranchInfo } from '../types';

interface Props {
  reservations: Reservation[];
  setReservations: (res: Reservation[]) => void;
  branch: BranchInfo;
}

const Reservations: React.FC<Props> = ({ reservations, setReservations, branch }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const branchReservations = reservations.filter(r => r.branchId === branch.id && r.date === selectedDate);

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRes: Reservation = {
      id: `RES-${Date.now()}`,
      customerName: formData.get('name') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      guests: Number(formData.get('guests')),
      tableId: formData.get('table') as string,
      branchId: branch.id,
      status: 'Confirmed'
    };
    setReservations([...reservations, newRes]);
    setShowModal(false);
  };

  const updateStatus = (id: string, status: Reservation['status']) => {
    setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="space-y-8 animate-fade pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Reservas & Hostess</h2>
          <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-[0.4em] mt-1">Gestión de Mesa y Aforo - {branch.name}</p>
        </div>
        <div className="flex items-center space-x-4">
           <input 
            type="date" 
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="nexus-input py-2"
           />
           <button 
            onClick={() => setShowModal(true)}
            className="bg-cyan-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-600/10"
           >
             <i className="fa-solid fa-calendar-plus mr-3"></i> Nueva Reserva
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {branchReservations.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-800 space-y-4">
            <i className="fa-solid fa-calendar-xmark text-6xl opacity-10"></i>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">No hay reservas para esta fecha</p>
          </div>
        ) : (
          branchReservations.map(r => (
            <div key={r.id} className={`glass-panel p-8 rounded-[2.5rem] flex flex-col group relative overflow-hidden transition-all ${r.status === 'Seated' ? 'opacity-40 grayscale' : 'hover:border-cyan-500/30'}`}>
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                 <i className="fa-solid fa-utensils text-5xl"></i>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center space-x-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2">
                  <i className="fa-solid fa-clock"></i>
                  <span>{r.time}</span>
                  <span className="mx-2 opacity-20">|</span>
                  <i className="fa-solid fa-users"></i>
                  <span>{r.guests} PAX</span>
                </div>
                <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{r.customerName}</h4>
              </div>

              <div className="flex-1 space-y-4">
                 <div className="bg-slate-200/50 dark:bg-black/30 p-4 rounded-2xl border border-slate-300/50 dark:border-white/5 flex items-center justify-between">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mesa Asignada</p>
                   <p className="text-2xl font-black text-slate-800 dark:text-white">{r.tableId}</p>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5 flex space-x-2">
                {r.status === 'Confirmed' ? (
                   <button 
                    onClick={() => updateStatus(r.id, 'Seated')}
                    className="flex-1 py-3 bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all"
                   >
                     Asignar Mesa
                   </button>
                ) : (
                   <span className="flex-1 py-3 bg-slate-200/50 dark:bg-white/5 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-center">En Servicio</span>
                )}
                <button 
                  onClick={() => updateStatus(r.id, 'Cancelled')}
                  className="px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <i className="fa-solid fa-trash-can text-xs"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-6">
           <div className="glass-panel w-full max-w-md rounded-[3rem] p-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-5 text-cyan-500"><i className="fa-solid fa-calendar-check text-9xl"></i></div>
             
             <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest mb-8 flex items-center">
               <i className="fa-solid fa-book-bookmark mr-4 text-cyan-500"></i>
               Alta de Reserva
             </h3>
             
             <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cliente / Titular</label>
                  <input name="name" required className="w-full nexus-input" placeholder="Nombre completo..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fecha</label>
                    <input name="date" type="date" required className="w-full nexus-input" defaultValue={selectedDate} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hora</label>
                    <input name="time" type="time" required className="w-full nexus-input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Invitados (Pax)</label>
                    <input name="guests" type="number" min="1" required className="w-full nexus-input" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Número de Mesa</label>
                    <input name="table" type="number" required className="w-full nexus-input" placeholder="0" />
                  </div>
                </div>

                <div className="flex space-x-3 pt-6">
                   <button type="submit" className="flex-1 py-5 bg-cyan-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-cyan-600/20 hover:bg-cyan-500 transition-all">
                     Confirmar Uplink
                   </button>
                   <button type="button" onClick={() => setShowModal(false)} className="px-8 py-5 bg-slate-200/50 dark:bg-white/5 text-slate-500 dark:text-zinc-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-slate-800 dark:hover:text-white transition-all">
                     Cerrar
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
