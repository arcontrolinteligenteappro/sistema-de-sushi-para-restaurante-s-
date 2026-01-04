
import React from 'react';
import { User, Language, Role, Theme } from '../types';
import { TRANSLATIONS, THEME_PRESETS } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentThemePreset: string;
  setCurrentThemePreset: (preset: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, language, setLanguage, theme, setTheme, currentThemePreset, setCurrentThemePreset }) => {
  const t = (TRANSLATIONS as any)[language];
  
  const menuItems = [
    { id: 'dashboard', icon: 'fa-shapes', label: t.dashboard, roles: [Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE, Role.JEFE_AREA] },
    { id: 'waiterhub', icon: 'fa-utensils', label: t.my_salon, roles: [Role.MESERO] },
    { id: 'pos', icon: 'fa-cash-register', label: t.pos, roles: [Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE, Role.JEFE_AREA, Role.CAJERO] },
    { id: 'end_of_shift', icon: 'fa-door-closed', label: t.end_of_shift, roles: [Role.CAJERO] },
    { id: 'operations_hub', icon: 'fa-cubes-stacked', label: t.operations_hub, roles: [Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE, Role.JEFE_AREA, Role.COCINERO, Role.REPARTIDOR, Role.CAJERO] },
    { id: 'fleet_command', icon: 'fa-route', label: t.fleet_command, roles: [Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE] },
    { id: 'supply_chain', icon: 'fa-truck-ramp-box', label: t.supply_chain, roles: [Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE, Role.JEFE_AREA, Role.COCINERO] },
    { id: 'tablemap', icon: 'fa-map-signs', label: t.salon_management, roles: [Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE, Role.JEFE_AREA, Role.CAJERO] },
    { id: 'crm', icon: 'fa-users-viewfinder', label: t.crm, roles: [Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE, Role.CAJERO] },
    { id: 'attendance', icon: 'fa-fingerprint', label: t.attendance, roles: [Role.GERENTE, Role.JEFE_AREA, Role.CAJERO, Role.MESERO, Role.COCINERO, Role.REPARTIDOR] },
    { id: 'my_calendar', icon: 'fa-calendar-days', label: t.my_calendar, roles: [Role.GERENTE, Role.JEFE_AREA, Role.CAJERO, Role.MESERO, Role.COCINERO, Role.REPARTIDOR] },
    { id: 'employee_portal', icon: 'fa-id-card', label: t.employee_portal, roles: [Role.GERENTE, Role.JEFE_AREA, Role.CAJERO, Role.MESERO, Role.COCINERO, Role.REPARTIDOR] },
    { id: 'network', icon: 'fa-satellite-dish', label: t.network_map, roles: [Role.ADMIN_IT, Role.PROPIETARIO] },
    { id: 'management', icon: 'fa-user-gear', label: t.company, roles: [Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE] },
    { id: 'audit', icon: 'fa-user-shield', label: t.audit, roles: [Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE] },
    { id: 'settings', icon: 'fa-gear', label: t.console, roles: [Role.ADMIN_IT, Role.PROPIETARIO, Role.GERENTE] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-20 lg:w-64 m-2 lg:m-4 h-[calc(100vh-2rem)] flex flex-col">
      <div className="glass-panel h-full rounded-[1.5rem] lg:rounded-[2rem] flex flex-col overflow-hidden">
        
        <div className="p-6 flex flex-col items-center border-b bg-slate-200/20 dark:bg-black/20 border-slate-200 dark:border-white/5">
          <div className="w-10 h-10 bg-nexus-primary text-slate-900 rounded-xl flex items-center justify-center shadow-lg">
            <i className="fa-solid fa-bolt-lightning text-lg"></i>
          </div>
          <p className="mt-4 font-black text-[7px] tracking-[0.3em] uppercase hidden lg:block text-slate-400 dark:text-zinc-600">NEXUS ENTERPRISE</p>
        </div>

        <nav className="flex-1 px-3 lg:px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center lg:space-x-4 p-4 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-nexus-primary text-slate-900 shadow-lg scale-105' 
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
              }`}
            >
              <div className="w-full lg:w-auto flex justify-center">
                <i className={`fa-solid ${item.icon} text-lg lg:text-base`}></i>
              </div>
              <span className="hidden lg:block font-black text-[9px] tracking-widest uppercase truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-2 lg:p-4 border-t border-slate-200 dark:border-white/5">
            {/* Expanded view */}
            <div className="hidden lg:flex flex-col space-y-3">
                <div className="flex gap-1 bg-slate-200/50 dark:bg-black/40 p-1 rounded-full">
                    {['ES', 'EN'].map(l => (
                        <button key={l} onClick={() => setLanguage(l as Language)} className={`flex-1 py-2 rounded-full text-[10px] font-black transition-all ${language === l ? 'bg-white/50 dark:bg-white/10 text-slate-800 dark:text-white shadow' : 'text-slate-500 dark:text-zinc-600'}`}>{l}</button>
                    ))}
                </div>
                <div className="flex gap-1 bg-slate-200/50 dark:bg-black/40 p-1 rounded-full">
                    {(['light', 'dark', 'auto'] as Theme[]).map(item => (
                        <button key={item} onClick={() => setTheme(item)} className={`flex-1 py-2 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2 ${theme === item ? 'bg-white/50 dark:bg-white/10 text-slate-800 dark:text-white shadow' : 'text-slate-500 dark:text-zinc-600'}`}>
                            <i className={`fa-solid ${item === 'light' ? 'fa-sun' : item === 'dark' ? 'fa-moon' : 'fa-desktop'}`}></i>
                            <span>{t[item]}</span>
                        </button>
                    ))}
                </div>
                <div className="flex items-center justify-around bg-slate-200/50 dark:bg-black/40 p-1 rounded-full h-10">
                    {Object.keys(THEME_PRESETS).map(p => (
                        <button key={p} onClick={() => setCurrentThemePreset(p)} className={`w-6 h-6 rounded-full border-2 transition-all ${currentThemePreset === p ? 'border-slate-800 dark:border-white scale-110 shadow-lg' : 'border-transparent opacity-40'}`} style={{ background: THEME_PRESETS[p].primary }} />
                    ))}
                </div>
            </div>

            {/* Collapsed view */}
            <div className="lg:hidden flex flex-col items-center space-y-2">
                <div className="flex gap-1 bg-slate-200/50 dark:bg-black/40 p-1 rounded-full w-full">
                    {['ES', 'EN'].map(l => (
                        <button key={l} onClick={() => setLanguage(l as Language)} className={`flex-1 py-2 rounded-full text-[10px] font-black transition-all ${language === l ? 'bg-white/50 dark:bg-white/10 text-slate-800 dark:text-white shadow' : 'text-slate-500 dark:text-zinc-600'}`}>{l}</button>
                    ))}
                </div>
                <div className="flex gap-1 bg-slate-200/50 dark:bg-black/40 p-1 rounded-full w-full">
                    {(['light', 'dark', 'auto'] as Theme[]).map(item => (
                        <button key={item} onClick={() => setTheme(item)} className={`flex-1 py-2 rounded-full text-xs font-black transition-all flex items-center justify-center ${theme === item ? 'bg-white/50 dark:bg-white/10 text-slate-800 dark:text-white shadow' : 'text-slate-500 dark:text-zinc-600'}`}>
                            <i className={`fa-solid ${item === 'light' ? 'fa-sun' : item === 'dark' ? 'fa-moon' : 'fa-desktop'}`}></i>
                        </button>
                    ))}
                </div>
                <div className="flex items-center justify-around bg-slate-200/50 dark:bg-black/40 p-1 rounded-full w-full h-10">
                    {Object.keys(THEME_PRESETS).map(p => (
                        <button key={p} onClick={() => setCurrentThemePreset(p)} className={`w-6 h-6 rounded-full border-2 transition-all ${currentThemePreset === p ? 'border-slate-800 dark:border-white scale-110 shadow-lg' : 'border-transparent opacity-40'}`} style={{ background: THEME_PRESETS[p].primary }} />
                    ))}
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
