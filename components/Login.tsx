
import React, { useState, useEffect } from 'react';
import { User, Language, BusinessConfig, Theme, UIMode, Role } from '../types';
import { TRANSLATIONS, APP_EDITION, THEME_PRESETS, CREDITS_NAME, CREDITS_URL, SYSTEM_SLOGAN } from '../constants';

interface Props {
  onLogin: (user: User, mode: UIMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  users: User[];
  business: BusinessConfig;
  uiMode: UIMode;
  setUiMode: (mode: UIMode) => void;
  currentThemePreset: string;
  setCurrentThemePreset: (preset: string) => void;
}

const UplinkSequence: React.FC<{ user: User, business: BusinessConfig }> = ({ user, business }) => {
    const [status, setStatus] = useState('Autenticando...');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const sequence = [
            { delay: 500, status: 'Cargando Perfil de Operador...', progress: 30 },
            { delay: 1000, status: 'Sincronizando Datos de Sucursal...', progress: 70 },
            { delay: 800, status: 'Compilando Interfaz Neuronal...', progress: 100 },
        ];

        let totalDelay = 0;
        sequence.forEach(step => {
            totalDelay += step.delay;
            setTimeout(() => {
                setStatus(step.status);
                setProgress(step.progress);
            }, totalDelay);
        });
    }, []);

    return (
        <div className="fixed inset-0 z-[1000] bg-nexus-dark flex flex-col items-center justify-center animate-fade-in overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-nexus-primary/20 animate-terminal-scanline"></div>
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}></div>

            <img src={business.logo} className="w-24 h-24 dark:invert mb-12 animate-pulse" alt="logo" />
            
            {progress < 100 ? (
                <>
                    <div className="w-full max-w-sm mb-4 bg-white/5 rounded-full h-2.5">
                        <div className="bg-nexus-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs font-black text-nexus-primary uppercase tracking-[0.5em] mt-4 animate-fade-in">
                        {status}
                    </p>
                </>
            ) : (
                <div className="text-center animate-fade-in">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white">BIENVENIDO, {user.name.split(' ')[0]}</h2>
                    <p className="text-sm font-black text-nexus-primary uppercase tracking-[0.8em] mt-4">ENLACE ESTABLECIDO</p>
                </div>
            )}
        </div>
    );
};

const foodImages = [
    { url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=1925', text: 'Precisión en Cada Detalle' },
    { url: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&q=80&w=1887', text: 'El Arte del Sabor' },
    { url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=1932', text: 'Innovación Culinaria' },
];

const FoodShowcase: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % foodImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const currentImage = foodImages[currentIndex];

    return (
        <div className="hidden lg:block relative w-full h-full min-h-[600px] glass-panel rounded-[4rem] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 transition-opacity duration-1000 animate-fade-in" key={currentIndex}>
                <img src={currentImage.url} className="w-full h-full object-cover animate-ken-burns" alt="sushi showcase"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>
            <div className="absolute bottom-12 left-12 right-12 text-white z-10">
                 <h2 className="text-5xl font-black uppercase tracking-tighter leading-none animate-fade-in">
                    {currentImage.text}
                 </h2>
                 <p className="text-[10px] font-black text-nexus-primary uppercase tracking-[0.5em] mt-4 animate-fade-in">SUSHIMEX ENTERPRISE</p>
            </div>
        </div>
    );
};

const Login: React.FC<Props> = ({ onLogin, users, business, language, setLanguage, theme, setTheme, uiMode, setUiMode, currentThemePreset, setCurrentThemePreset }) => {
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'PIN' | 'PASS'>('PIN');
  const [isExiting, setIsExiting] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [selectedBranchIdx, setSelectedBranchIdx] = useState(0);
  
  const presets = Object.keys(THEME_PRESETS);
  const t = (TRANSLATIONS as any)[language];
  const branch = business.branches[selectedBranchIdx];

  useEffect(() => {
    const root = document.documentElement;
    const colors = (THEME_PRESETS as any)[currentThemePreset];
    root.style.setProperty('--nexus-primary', colors.primary);
    root.style.setProperty('--nexus-secondary', colors.secondary);
  }, [currentThemePreset]);

  const handlePinInput = (num: string) => {
    if (isExiting) return;
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        const found = users.find(u => u.pin === newPin);
        if (found) {
          setLoggedInUser(found);
          setIsExiting(true);
          setTimeout(() => onLogin({...found, branchId: branch.id}, uiMode), 3500);
        } else {
          setPin('');
          const el = document.getElementById('pin-terminal');
          el?.classList.add('animate-shake');
          setTimeout(() => el?.classList.remove('animate-shake'), 400);
        }
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden p-4 lg:p-10">
      
      {isExiting && loggedInUser && <UplinkSequence user={loggedInUser} business={business} />}

      <div className={`w-full h-full flex flex-col items-center justify-center absolute inset-0 transition-all duration-700 ${isExiting ? 'opacity-0 scale-95 blur-xl' : 'opacity-100'}`}>
      
        <div className="text-center mb-10 animate-fade-in z-10">
            <img src={business.logo} className="w-20 h-20 dark:invert mx-auto mb-6" alt="logo" />
            <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">{business.name}</h1>
            <p className="text-sm font-black text-nexus-primary uppercase tracking-[0.5em] mt-2">{business.slogan}</p>
        </div>

        <div className="w-full max-w-[1400px] grid lg:grid-cols-2 gap-10 items-center z-10 animate-slide-in-bottom">
            
            <FoodShowcase />

            <div className="flex justify-center lg:justify-end">
                <div id="pin-terminal" className="w-full max-w-md glass-panel p-10 lg:p-14 rounded-[4rem] space-y-10">
                <div className="text-center space-y-2">
                    <h3 className="text-3xl font-black uppercase tracking-widest text-slate-800 dark:text-white">{t.identify_operator}</h3>
                    <p className="text-[9px] font-black text-slate-500 dark:text-zinc-600 uppercase tracking-[0.4em]">{branch.name}</p>
                </div>

                {mode === 'PIN' ? (
                    <div className="space-y-12">
                        <div className="flex justify-center gap-6">
                            {[0,1,2,3].map(i => (
                            <div key={i} className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-nexus-primary border-nexus-primary scale-110 shadow-lg' : 'border-slate-300 dark:border-zinc-800'}`}></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map(key => (
                            <button key={key} onClick={() => key === 'C' ? setPin('') : key === '⌫' ? setPin(pin.slice(0,-1)) : handlePinInput(key)} className="h-20 rounded-2xl bg-slate-200/50 dark:bg-white/5 text-xl font-black text-slate-800 dark:text-white hover:bg-nexus-primary hover:text-black transition-all active:scale-95 flex items-center justify-center">
                                {key}
                            </button>
                            ))}
                        </div>
                        <button onClick={() => setMode('PASS')} className="w-full text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-700 hover:text-nexus-primary transition-all text-center">Protocol Console Access</button>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        <div className="space-y-4">
                            <input type="email" className="w-full nexus-input" placeholder="Neural ID (Email)" />
                            <input type="password" className="w-full nexus-input" placeholder="Protocol Key" />
                        </div>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => onLogin({...users.find(u => u.role === Role.ADMIN_IT)!, branchId: branch.id}, uiMode)} className="w-full py-6 bg-nexus-primary text-black rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl">Connect Node</button>
                            <button onClick={() => setMode('PIN')} className="w-full py-2 text-[9px] font-black uppercase text-slate-400 dark:text-zinc-600 hover:text-white">Regresar al Pad</button>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
        
        <div className="w-full max-w-[1400px] glass-panel rounded-[3rem] p-6 mt-10 z-20 animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-2">Idioma</label>
                    <div className="flex gap-1 bg-slate-200/50 dark:bg-black/40 p-1 rounded-2xl">{['ES', 'EN'].map(l => (<button key={l} onClick={() => setLanguage(l as any)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${language === l ? 'bg-white/50 dark:bg-white/10 text-slate-800 dark:text-white shadow' : 'text-slate-500 dark:text-zinc-600'}`}>{l}</button>))}</div>
                </div>
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-2">{t.interface}</label>
                    <div className="flex gap-1 bg-slate-200/50 dark:bg-black/40 p-1 rounded-2xl">{(['PC', 'TABLET'] as UIMode[]).map(m => (<button key={m} onClick={() => setUiMode(m)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${uiMode === m ? 'bg-white/50 dark:bg-white/10 text-slate-800 dark:text-white shadow' : 'text-slate-500 dark:text-zinc-600'}`}>{m}</button>))}</div>
                </div>
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-2">{t.theme}</label>
                    <div className="flex gap-1 bg-slate-200/50 dark:bg-black/40 p-1 rounded-2xl">
                        {(['light', 'dark', 'auto'] as Theme[]).map(item => (<button key={item} onClick={() => setTheme(item)} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${theme === item ? 'bg-white/50 dark:bg-white/10 text-slate-800 dark:text-white shadow' : 'text-slate-500 dark:text-zinc-600'}`}>
                            <i className={`fa-solid ${item === 'light' ? 'fa-sun' : item === 'dark' ? 'fa-moon' : 'fa-desktop'}`}></i> {t[item]}
                        </button>))}
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-2">{t.color_palette}</label>
                    <div className="flex items-center justify-around bg-slate-200/50 dark:bg-black/40 p-1 rounded-2xl h-[46px]">{presets.map(p => (<button key={p} onClick={() => setCurrentThemePreset(p)} className={`w-8 h-8 rounded-full border-2 transition-all ${currentThemePreset === p ? 'border-slate-800 dark:border-white scale-110 shadow-lg' : 'border-transparent opacity-40'}`} style={{ background: (THEME_PRESETS as any)[p].primary }} />))}</div>
                </div>
            </div>

            <div className="border-t border-slate-300/50 dark:border-white/10 my-6"></div>

            <div className="flex justify-between items-center text-[9px] font-black text-slate-500 dark:text-zinc-600 uppercase">
                <div className="tracking-widest">
                    <p className="text-slate-600 dark:text-zinc-500">{APP_EDITION}</p>
                    <p className="text-slate-400 dark:text-zinc-700">{SYSTEM_SLOGAN}</p>
                </div>
                <div className="text-right">
                    <a href={`https://${CREDITS_URL}`} target="_blank" rel="noreferrer" className="tracking-[0.2em] hover:text-nexus-primary dark:hover:text-white transition-all">
                        AR Control Inteligente
                    </a>
                    <p className="text-slate-400 dark:text-zinc-700 tracking-widest">{CREDITS_NAME}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
