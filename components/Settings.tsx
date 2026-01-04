
import React, { useState } from 'react';
import { BusinessConfig, Language, Role, User, BranchInfo, Currency, NotificationSetting } from '../types';
import { TRANSLATIONS, THEME_PRESETS } from '../constants';

interface Props {
  config: BusinessConfig;
  setConfig: (config: BusinessConfig) => void;
  lang: Language;
  user: User;
}

const Settings: React.FC<Props> = ({ config, setConfig, lang, user }) => {
  const t = (TRANSLATIONS as any)[lang];
  const [activeSubTab, setActiveSubTab] = useState<'Branch' | 'API' | 'Hardware' | 'Financial'>('Branch');
  const [editingBranchId, setEditingBranchId] = useState(user.branchId || config.branches[0].id);
  const [isNewBranchModalOpen, setIsNewBranchModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  
  const isSovereign = [Role.ADMIN_IT, Role.PROPIETARIO].includes(user.role);
  const branch = config.branches.find(b => b.id === editingBranchId) || config.branches[0];

  const handleGlobalUpdate = (field: string, value: any) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setConfig({ ...config, [field]: value });
    } else {
      setConfig({ ...config, [keys[0]]: { ...(config as any)[keys[0]], [keys[1]]: value } });
    }
  };

  const handleBranchUpdate = (branchId: string, field: keyof BranchInfo, value: any) => {
    const newBranches = config.branches.map(b => b.id === branchId ? { ...b, [field]: value } : b);
    setConfig({ ...config, branches: newBranches });
  };
  
  const handleBranchConfigUpdate = (branchId: string, field: keyof BranchInfo['config'], value: any) => {
    const newBranches = config.branches.map(b => 
      b.id === branchId ? { ...b, config: { ...b.config, [field]: value } } : b
    );
    setConfig({ ...config, branches: newBranches });
  };
  
  const handleBranchHardwareSubUpdate = (branchId: string, subkey: keyof BranchInfo['hardware'], field: string, value: any) => {
      const newBranches = config.branches.map(b => {
        if (b.id === branchId) {
          return {
            ...b,
            hardware: {
              ...b.hardware,
              [subkey]: {
                ...(b.hardware as any)[subkey],
                [field]: value
              }
            }
          };
        }
        return b;
      });
      setConfig({ ...config, branches: newBranches });
  };

  const handleBranchAlertsNotificationUpdate = (branchId: string, notificationType: keyof NonNullable<BranchInfo['hardware']['alerts']['notifications']>, field: 'sound' | 'vibration', value: string | number) => {
      const newBranches = config.branches.map(b => {
          if (b.id === branchId) {
              const currentNotifications = b.hardware.alerts.notifications || {
                  newOrder: { sound: '', vibration: 0 },
                  platformOrder: { sound: '', vibration: 0 },
                  orderCancelled: { sound: '', vibration: 0 },
                  statusRequest: { sound: '', vibration: 0 },
              };
              return {
                  ...b,
                  hardware: {
                      ...b.hardware,
                      alerts: {
                          ...b.hardware.alerts,
                          notifications: {
                              ...currentNotifications,
                              [notificationType]: {
                                  ...currentNotifications[notificationType],
                                  [field]: value
                              }
                          }
                      }
                  }
              };
          }
          return b;
      });
      setConfig({ ...config, branches: newBranches });
  };

  const handleCreateBranch = () => {
    if (!newBranchName) return;
    const newBranch: BranchInfo = {
      id: `b${Date.now().toString().slice(-4)}`,
      name: newBranchName,
      themeConfig: THEME_PRESETS.sapphire,
      config: { taxRate: 0.16, baseCurrency: 'MXN', address: 'Nueva Dirección', phone: '00-0000-0000' },
      hardware: {
        printer: { type: '80mm', ip: '192.168.1.100', footer: 'SUSHIMEX', showLogo: true },
        biometric: { enabled: false, sensitivity: 8, status: 'Offline' },
        alerts: { inventorySound: true, lowStockVisual: true, notifications: { newOrder: {sound: '', vibration: 0}, platformOrder: {sound: '', vibration: 0}, orderCancelled: {sound: '', vibration: 0}, statusRequest: {sound: '', vibration: 0} } },
        projection: { mode: 'Menu', enabled: false }
      },
      devices: []
    };
    setConfig({ ...config, branches: [...config.branches, newBranch] });
    setIsNewBranchModalOpen(false);
    setNewBranchName("");
  };
  
  const handleTestNotification = (soundUrl: string, vibration: number) => {
    try {
        if (soundUrl) {
            const audio = new Audio(soundUrl);
            audio.volume = 0.7;
            audio.play().catch(e => console.error("Error al reproducir sonido:", e));
        }
    } catch (e) {
        console.error("Error de audio:", e);
    }
    if ('vibrate' in navigator && vibration > 0) {
        navigator.vibrate(vibration * 4); // Convierte 0-100 a 0-400ms
    }
  };
  
  const notificationTypes: {id: keyof NonNullable<BranchInfo['hardware']['alerts']['notifications']>, label: string}[] = [
    { id: 'newOrder', label: 'Pedido Nuevo en Terminal' },
    { id: 'platformOrder', label: 'Pedido de Plataforma (Cloud)' },
    { id: 'orderCancelled', label: 'Cancelación de Orden' },
    { id: 'statusRequest', label: 'Solicitud de Estado (Mesero)' },
  ];

  const InputField = ({ label, value, onChange }: {label: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void}) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-2">{label}</label>
      <input type="text" value={value} onChange={onChange} className="w-full nexus-input" />
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-10 animate-quantum-in">
      <nav className="flex gap-6 border-b border-slate-200 dark:border-white/5 pb-8 overflow-x-auto no-scrollbar">
         {[
           { id: 'Branch', icon: 'fa-sitemap', label: 'Empresa y Sucursales' },
           { id: 'Hardware', icon: 'fa-microchip', label: 'Periféricos & Audio' },
           { id: 'Financial', icon: 'fa-vault', label: 'Parámetros Fiscales' },
           { id: 'API', icon: 'fa-cloud-bolt', label: 'Cloud Sync Keys' },
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveSubTab(tab.id as any)}
             className={`px-12 py-6 rounded-[2.5rem] flex items-center gap-5 text-[11px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab.id ? 'bg-nexus-primary text-black shadow-2xl scale-105' : 'bg-slate-200/50 dark:bg-white/5 text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-white'}`}
           >
             <i className={`fa-solid ${tab.icon}`}></i>
             {tab.label}
           </button>
         ))}
      </nav>

      <div className="flex-1 overflow-y-auto no-scrollbar pr-6 pb-24 space-y-12">
        {activeSubTab === 'Branch' && (
          <div className="space-y-12">
            <section className="glass-panel p-14 rounded-[4.5rem] space-y-10">
               <h3 className="text-2xl font-black uppercase text-slate-800 dark:text-white tracking-tighter">Configuración Global de la Empresa</h3>
               <div className="grid grid-cols-2 gap-8">
                  <InputField label="Nombre Comercial" value={config.name} onChange={e => handleGlobalUpdate('name', e.target.value)} />
                  <InputField label="Slogan" value={config.slogan} onChange={e => handleGlobalUpdate('slogan', e.target.value)} />
                  <InputField label="Razón Social" value={config.legalName} onChange={e => handleGlobalUpdate('legalName', e.target.value)} />
                  <InputField label="RFC" value={config.taxId} onChange={e => handleGlobalUpdate('taxId', e.target.value)} />
               </div>
            </section>
            <section className="glass-panel p-14 rounded-[4.5rem] space-y-10">
               <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black uppercase text-slate-800 dark:text-white tracking-tighter">Gestión de Sucursales</h3>
                  {isSovereign && (
                    <div className="flex items-center gap-4">
                      <select value={editingBranchId} onChange={e => setEditingBranchId(e.target.value)} className="nexus-input bg-slate-200/50 dark:bg-black/40">
                        {config.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                      <button onClick={() => setIsNewBranchModalOpen(true)} className="px-5 py-3 bg-nexus-primary text-black rounded-xl text-[9px] font-black uppercase">Nueva Sucursal</button>
                    </div>
                  )}
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <InputField label="Nombre de Sucursal" value={branch.name} onChange={e => handleBranchUpdate(branch.id, 'name', e.target.value)} />
                  <InputField label="Teléfono" value={branch.config.phone} onChange={e => handleBranchConfigUpdate(branch.id, 'phone', e.target.value)} />
                  <div className="col-span-2">
                     <InputField label="Dirección" value={branch.config.address} onChange={e => handleBranchConfigUpdate(branch.id, 'address', e.target.value)} />
                  </div>
               </div>
            </section>
          </div>
        )}
        {activeSubTab === 'Hardware' && (
          <div className="space-y-12">
            <section className="glass-panel p-14 rounded-[4.5rem] space-y-10">
               <h3 className="text-2xl font-black uppercase text-slate-800 dark:text-white tracking-tighter">Periféricos de Sucursal: {branch.name}</h3>
            </section>

            <section className="glass-panel p-14 rounded-[4.5rem] space-y-10">
              <h3 className="text-2xl font-black uppercase text-slate-800 dark:text-white tracking-tighter">Alertas y Notificaciones</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {notificationTypes.map(type => {
                  const setting = branch.hardware.alerts.notifications?.[type.id];
                  if (!setting) return null;
                  return (
                    <div key={type.id} className="p-8 bg-slate-200/30 dark:bg-black/40 rounded-3xl space-y-6 border border-slate-300/50 dark:border-white/5">
                      <h4 className="text-sm font-black uppercase text-slate-700 dark:text-white tracking-widest">{type.label}</h4>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase ml-4">URL del Sonido (.mp3)</label>
                        <input 
                          type="text" 
                          className="w-full nexus-input text-xs font-mono" 
                          value={setting.sound} 
                          onChange={(e) => handleBranchAlertsNotificationUpdate(branch.id, type.id, 'sound', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase ml-4">Intensidad de Vibración ({setting.vibration})</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          className="w-full" 
                          value={setting.vibration} 
                          onChange={(e) => handleBranchAlertsNotificationUpdate(branch.id, type.id, 'vibration', Number(e.target.value))}
                        />
                      </div>
                      <button 
                        onClick={() => handleTestNotification(setting.sound, setting.vibration)}
                        className="w-full py-4 bg-slate-300/50 dark:bg-white/5 rounded-2xl text-[9px] font-black uppercase text-slate-500 dark:text-zinc-400 hover:bg-nexus-primary hover:text-black transition-all"
                      >
                        Probar Alerta
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
        {activeSubTab === 'Financial' && (
          <div className="space-y-12">
            <section className="glass-panel p-14 rounded-[4.5rem] space-y-10">
              <h3 className="text-2xl font-black uppercase text-slate-800 dark:text-white tracking-tighter">Parámetros Fiscales Globales</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-2">Moneda Base</label>
                    <select value={config.baseCurrency} onChange={e => handleGlobalUpdate('baseCurrency', e.target.value)} className="w-full nexus-input">
                        <option value="MXN">Peso Mexicano (MXN)</option>
                        <option value="USD">Dólar Americano (USD)</option>
                    </select>
                </div>
                <InputField label="Tasa de Cambio (a USD)" value={config.exchangeRate} onChange={e => handleGlobalUpdate('exchangeRate', Number(e.target.value))} />
              </div>
            </section>
            <section className="glass-panel p-14 rounded-[4.5rem] space-y-10">
              <h3 className="text-2xl font-black uppercase text-slate-800 dark:text-white tracking-tighter">Impuestos por Sucursal: {branch.name}</h3>
              <div className="max-w-xs">
                <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-2">Tasa de Impuestos (Ej: 0.16 para 16%)</label>
                <input type="number" step="0.01" value={branch.config.taxRate} onChange={e => handleBranchConfigUpdate(branch.id, 'taxRate', Number(e.target.value))} className="w-full nexus-input mt-2" />
              </div>
            </section>
          </div>
        )}
        {activeSubTab === 'API' && (
           <div className="space-y-12">
             <section className="glass-panel p-14 rounded-[4.5rem] space-y-10">
               <h3 className="text-2xl font-black uppercase text-slate-800 dark:text-white tracking-tighter">Claves de API y Sincronización Cloud</h3>
               <div className="space-y-6">
                {Object.keys(config.apiKeys).map(key => (
                    <div key={key} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-2">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</label>
                        <input type="password" value={(config.apiKeys as any)[key]} onChange={e => handleGlobalUpdate(`apiKeys.${key}`, e.target.value)} className="w-full nexus-input font-mono" />
                    </div>
                ))}
               </div>
             </section>
           </div>
        )}
      </div>

      {isNewBranchModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-xl">
          <div className="glass-panel p-12 rounded-[3rem] w-full max-w-md text-center space-y-8">
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-800 dark:text-white">Nueva Sucursal</h3>
            <input 
              type="text"
              className="w-full nexus-input text-center text-lg font-bold"
              placeholder="Nombre de la Sucursal"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={handleCreateBranch} className="flex-1 py-4 bg-nexus-primary text-black rounded-xl font-black uppercase">Confirmar</button>
              <button onClick={() => setIsNewBranchModalOpen(false)} className="flex-1 py-4 bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-zinc-400 rounded-xl font-black uppercase">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
