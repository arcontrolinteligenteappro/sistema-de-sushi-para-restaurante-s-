import React, { useState, useEffect, useMemo } from 'react';
import { DeliveryVehicle, User, Order, Language, Role, VehicleStatus } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  vehicles: DeliveryVehicle[];
  // FIX: Updated type to allow state updater function.
  setVehicles: React.Dispatch<React.SetStateAction<DeliveryVehicle[]>>;
  users: User[];
  // FIX: Updated type for consistency and to allow state updater function.
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  orders: Order[];
  language: Language;
}

const FleetCommand: React.FC<Props> = ({ vehicles, setVehicles, users, setUsers, orders, language }) => {
  const t = TRANSLATIONS[language];
  const [editingVehicle, setEditingVehicle] = useState<Partial<DeliveryVehicle> | null>(null);
  const [assigningVehicle, setAssigningVehicle] = useState<DeliveryVehicle | null>(null);

  const drivers = useMemo(() => users.filter(u => u.role === Role.REPARTIDOR), [users]);

  useEffect(() => {
    const interval = setInterval(() => {
        setVehicles(currentVehicles => currentVehicles.map(v => {
            if (v.status === VehicleStatus.IN_USE && v.location) {
                return {
                    ...v,
                    location: {
                        lat: v.location.lat + (Math.random() - 0.5) * 0.0005,
                        lng: v.location.lng + (Math.random() - 0.5) * 0.0005,
                    }
                }
            }
            return v;
        }));
    }, 5000);
    return () => clearInterval(interval);
  }, [setVehicles]);
  
  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    const newVehicle = {
      ...editingVehicle,
      id: editingVehicle.id || `v-${Date.now()}`,
      status: editingVehicle.status || VehicleStatus.AVAILABLE,
    } as DeliveryVehicle;

    if (vehicles.find(v => v.id === newVehicle.id)) {
      setVehicles(vehicles.map(v => v.id === newVehicle.id ? newVehicle : v));
    } else {
      setVehicles([...vehicles, newVehicle]);
    }
    setEditingVehicle(null);
  };
  
  const handleAssignDriver = (vehicleId: string, driverId: string) => {
    setVehicles(vehicles.map(v => v.id === vehicleId ? { ...v, status: VehicleStatus.IN_USE, currentDriverId: driverId } : v));
    setUsers(users.map(u => u.id === driverId ? { ...u, currentVehicleId: vehicleId } : u));
    setAssigningVehicle(null);
  };
  
  const handleUnassignDriver = (vehicleId: string, driverId: string) => {
    setVehicles(vehicles.map(v => v.id === vehicleId ? { ...v, status: VehicleStatus.AVAILABLE, currentDriverId: undefined } : v));
    setUsers(users.map(u => u.id === driverId ? { ...u, currentVehicleId: undefined } : u));
    setAssigningVehicle(null);
  };

  const getStatusColor = (status: VehicleStatus) => {
    if (status === VehicleStatus.AVAILABLE) return 'border-green-500/50 bg-green-500/10 text-green-400';
    if (status === VehicleStatus.IN_USE) return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
    return 'border-amber-500/50 bg-amber-500/10 text-amber-400';
  }

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">{t.fleet_command}</h2>
          <p className="text-[10px] text-nexus-primary font-black uppercase tracking-[0.5em] mt-1">Gestión de Logística y Seguimiento en Tiempo Real</p>
        </div>
        <button onClick={() => setEditingVehicle({})} className="px-6 py-3 bg-nexus-primary text-black rounded-xl font-black text-[10px] uppercase tracking-widest">
            <i className="fa-solid fa-plus mr-2"></i> Nuevo Vehículo
        </button>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
        <div className="col-span-4 flex flex-col space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-500 dark:text-zinc-500 tracking-widest px-4">{t.vehicle_status}</h3>
            <div className="flex-1 overflow-y-auto space-y-4 custom-scroll pr-2">
                {vehicles.map(v => {
                    const driver = users.find(u => u.id === v.currentDriverId);
                    return(
                        <div key={v.id} className="glass-panel p-6 rounded-3xl space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-black text-slate-800 dark:text-white uppercase">{v.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-zinc-500 font-mono">{v.licensePlate}</p>
                                </div>
                                <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border ${getStatusColor(v.status)}`}>{v.status}</span>
                            </div>
                            <div className="p-4 bg-slate-200/50 dark:bg-black/40 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <i className="fa-solid fa-user-astronaut text-slate-500 dark:text-zinc-600"></i>
                                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase">{driver?.name || 'No Asignado'}</span>
                                </div>
                                {v.status !== VehicleStatus.MAINTENANCE && 
                                    <button onClick={() => setAssigningVehicle(v)} className="w-8 h-8 rounded-lg bg-slate-300 dark:bg-white/5 text-slate-600 dark:text-zinc-400 text-xs hover:bg-nexus-primary hover:text-black transition-colors">
                                        <i className="fa-solid fa-arrow-right-arrow-left"></i>
                                    </button>
                                }
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
        <div className="col-span-8 glass-panel rounded-[3rem] p-4 relative overflow-hidden bg-slate-800">
            <div className="absolute inset-0 bg-cover opacity-20" style={{backgroundImage: "url('https://www.mapbox.com/dark-static-map.jpg')"}}></div>
             <div className="absolute inset-0" style={{background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(3,5,8,1) 80%)'}}></div>
            <h3 className="absolute top-6 left-6 text-sm font-black uppercase text-zinc-500 tracking-widest">{t.live_map}</h3>
            {vehicles.filter(v => v.status === VehicleStatus.IN_USE && v.location).map(v => {
                const driver = users.find(u => u.id === v.currentDriverId);
                // Normalize location to fit within the view
                const top = (1 - (v.location!.lat - 19.42) / 0.025) * 100;
                const left = ((v.location!.lng - (-99.15)) / 0.025) * 100;

                return (
                    <div key={v.id} className="absolute transition-all duration-1000 ease-linear group" style={{top: `${top}%`, left: `${left}%`}}>
                        <div className="w-8 h-8 bg-nexus-primary rounded-full flex items-center justify-center text-black animate-pulse shadow-lg shadow-nexus-primary/50">
                            <i className="fa-solid fa-motorcycle"></i>
                        </div>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-black/80 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {driver?.name}
                        </div>
                    </div>
                )
            })}
        </div>
      </div>
      
      {editingVehicle && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <form onSubmit={handleSaveVehicle} className="glass-panel w-full max-w-md p-10 rounded-[3rem] space-y-6">
            <h3 className="text-lg font-black uppercase tracking-widest text-slate-800 dark:text-white">{editingVehicle.id ? 'Editar' : 'Nuevo'} Vehículo</h3>
            <input required value={editingVehicle.name || ''} onChange={e => setEditingVehicle({...editingVehicle, name: e.target.value})} placeholder={t.vehicle_name} className="w-full nexus-input"/>
            <input required value={editingVehicle.model || ''} onChange={e => setEditingVehicle({...editingVehicle, model: e.target.value})} placeholder={t.vehicle_model} className="w-full nexus-input"/>
            <input required value={editingVehicle.licensePlate || ''} onChange={e => setEditingVehicle({...editingVehicle, licensePlate: e.target.value})} placeholder={t.license_plate} className="w-full nexus-input"/>
            <select value={editingVehicle.status || ''} onChange={e => setEditingVehicle({...editingVehicle, status: e.target.value as VehicleStatus})} className="w-full nexus-input">
                {Object.values(VehicleStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-3 bg-nexus-primary text-black rounded-xl font-black uppercase text-xs">{t.save_changes}</button>
                <button type="button" onClick={() => setEditingVehicle(null)} className="flex-1 py-3 bg-slate-200/50 dark:bg-white/5 text-slate-500 dark:text-zinc-400 rounded-xl font-black uppercase text-xs">Cancelar</button>
            </div>
          </form>
        </div>
      )}
      
      {assigningVehicle && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl">
            <div className="glass-panel w-full max-w-md p-10 rounded-[3rem] space-y-6">
                <h3 className="text-lg font-black uppercase tracking-widest text-slate-800 dark:text-white">{t.assign_vehicle}: {assigningVehicle.name}</h3>
                {assigningVehicle.currentDriverId ? (
                    <div className="text-center space-y-4">
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Actualmente asignado a <strong className="text-slate-700 dark:text-zinc-200">{users.find(u=>u.id === assigningVehicle.currentDriverId)?.name}</strong>.</p>
                        <button onClick={() => handleUnassignDriver(assigningVehicle.id, assigningVehicle.currentDriverId!)} className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl font-black uppercase text-xs">{t.unassign}</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Seleccionar repartidor disponible:</p>
                        <div className="max-h-60 overflow-y-auto space-y-2 custom-scroll pr-2">
                        {drivers.filter(d => !d.currentVehicleId).map(d => (
                            <button key={d.id} onClick={() => handleAssignDriver(assigningVehicle.id, d.id)} className="w-full text-left p-4 rounded-xl bg-slate-200/50 dark:bg-white/5 hover:bg-nexus-primary/10 transition-colors font-bold uppercase text-slate-700 dark:text-zinc-300 text-xs">
                                {d.name}
                            </button>
                        ))}
                        </div>
                    </div>
                )}
                 <button type="button" onClick={() => setAssigningVehicle(null)} className="w-full mt-4 py-3 bg-slate-200/50 dark:bg-white/5 text-slate-500 dark:text-zinc-400 rounded-xl font-black uppercase text-xs">Cancelar</button>
            </div>
        </div>
      )}

    </div>
  );
};

export default FleetCommand;
