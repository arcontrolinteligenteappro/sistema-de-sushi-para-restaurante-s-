
import React, { useState } from 'react';
import { User, Supplier, Role, BranchInfo, Language, Employee, Order, Insumo, BusinessConfig, Customer, Product, RecipeItem, ShiftReport, AttendanceRecord } from '../types';
import { TRANSLATIONS } from '../constants';
import HR from './hr/HR';
import Reports from './Reports';

interface Props {
  users: User[];
  setUsers: (u: User[]) => void;
  suppliers: Supplier[];
  setSuppliers: (s: Supplier[]) => void;
  branches: BranchInfo[];
  currentUser: User;
  language: Language;
  onNavigate: (tab: string) => void;
  employees: Employee[];
  setEmployees: (e: Employee[]) => void;
  orders: Order[];
  insumos: Insumo[];
  business: BusinessConfig;
  resolvedTheme: 'light' | 'dark';
  customers: Customer[];
  products: Product[];
  setProducts: (p: Product[]) => void;
  shiftReports: ShiftReport[];
  attendanceRecords: AttendanceRecord[];
}

const Management: React.FC<Props> = ({ users, setUsers, suppliers, setSuppliers, branches, currentUser, language, employees, setEmployees, orders, insumos, business, resolvedTheme, customers, products, setProducts, shiftReports, attendanceRecords }) => {
  const t = TRANSLATIONS[language] as any;
  const [activeView, setActiveView] = useState<'Users' | 'Suppliers' | 'Payroll' | 'Reports' | 'Recipes' | 'Closings'>('Users');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(currentUser.branchId || 'b1');
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Product | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);
  const [editorTab, setEditorTab] = useState('general');

  const isMaster = currentUser.role === Role.ADMIN_IT || currentUser.role === Role.PROPIETARIO;

  const currentViewBranchId = isMaster ? selectedBranchId : currentUser.branchId;
  
  const visibleUsers = users.filter(u => u.branchId === currentViewBranchId);
  const allUsersCount = users.length;
  
  const visibleSuppliers = suppliers.filter(s => s.branchId === currentViewBranchId || s.branchId === 'ALL');

  const handleOpenUserEditor = (user: User) => {
    const employeeData = employees.find(e => e.id === user.id);
    setEditingUser(user);
    setEditingEmployee(employeeData || null);
    setEditorTab('general');
  }

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingEmployee) return;
    
    const updatedUser: User = { ...users.find(u => u.id === editingUser.id)!, ...editingUser };
    const updatedEmployee: Employee = { ...employees.find(e => e.id === editingEmployee.id)!, ...editingEmployee };

    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setEmployees(employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));

    setEditingUser(null);
    setEditingEmployee(null);
  };
  
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    const newSupplier = {
        ...editingSupplier,
        id: editingSupplier.id || `sup-${Date.now()}`,
        branchId: currentViewBranchId
    } as Supplier;

    if (suppliers.find(s => s.id === newSupplier.id)) {
        setSuppliers(suppliers.map(s => s.id === newSupplier.id ? newSupplier : s));
    } else {
        setSuppliers([...suppliers, newSupplier]);
    }
    setEditingSupplier(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("¿Confirmar eliminación permanente del operador?")) {
      setUsers(users.filter(u => u.id !== id));
      setEmployees(employees.filter(e => e.id !== id));
    }
  };
  
  const handleDeleteSupplier = (id: string) => {
    if (confirm("¿Confirmar eliminación del proveedor?")) {
        setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const currentBranchForReports = branches.find(b => b.id === currentViewBranchId)!;

  const RecipeEditorModal = ({ product, onClose }: { product: Product, onClose: () => void }) => {
    const [recipe, setRecipe] = useState<RecipeItem[]>(product.recipe || []);
    const [insumoSearch, setInsumoSearch] = useState('');
  
    const filteredInsumos = insumos.filter(i => 
      i.name.toLowerCase().includes(insumoSearch.toLowerCase()) && 
      !recipe.some(ri => ri.insumoId === i.id)
    );
  
    const handleAddInsumo = (insumo: Insumo) => {
      setRecipe([...recipe, { insumoId: insumo.id, quantity: 0 }]);
      setInsumoSearch('');
    };
  
    const handleUpdateQuantity = (insumoId: string, quantity: number) => {
      setRecipe(recipe.map(ri => ri.insumoId === insumoId ? { ...ri, quantity } : ri));
    };
  
    const handleRemoveInsumo = (insumoId: string) => {
      setRecipe(recipe.filter(ri => ri.insumoId !== insumoId));
    };
  
    const handleSaveRecipe = () => {
      const updatedProduct = { ...product, recipe };
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      onClose();
    };

    const recipeCost = recipe.reduce((total, item) => {
      const insumo = insumos.find(i => i.id === item.insumoId);
      return total + (insumo ? insumo.cost * item.quantity : 0);
    }, 0);

    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/90 backdrop-blur-3xl p-6">
        <div className="glass-panel w-full max-w-4xl p-12 rounded-[4rem] h-[90vh] flex flex-col">
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest mb-2">Editor de Receta</h3>
          <p className="text-nexus-primary font-bold">{product.name}</p>
          
          <div className="grid grid-cols-2 gap-8 flex-1 mt-8 overflow-hidden">
             <div className="flex flex-col space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Insumos en Receta</h4>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scroll pr-2 bg-slate-200/50 dark:bg-black/20 p-4 rounded-2xl">
                   {recipe.map(item => {
                      const insumo = insumos.find(i => i.id === item.insumoId);
                      return (
                        <div key={item.insumoId} className="flex items-center gap-4 bg-white/50 dark:bg-black/40 p-3 rounded-lg">
                           <p className="flex-1 text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase">{insumo?.name}</p>
                           <input type="number" step="0.001" value={item.quantity} onChange={e => handleUpdateQuantity(item.insumoId, parseFloat(e.target.value))} className="w-24 nexus-input text-right text-xs p-2"/>
                           <span className="text-xs text-slate-500 dark:text-zinc-500 w-8">{insumo?.unit}</span>
                           <button onClick={() => handleRemoveInsumo(item.insumoId)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs"><i className="fa-solid fa-times"></i></button>
                        </div>
                      )
                   })}
                </div>
             </div>
             <div className="flex flex-col space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500">Añadir Insumo</h4>
                 <input type="text" placeholder="Buscar insumo..." value={insumoSearch} onChange={e => setInsumoSearch(e.target.value)} className="nexus-input text-xs"/>
                 <div className="flex-1 overflow-y-auto space-y-2 custom-scroll pr-2 bg-slate-200/50 dark:bg-black/20 p-2 rounded-2xl">
                    {filteredInsumos.map(i => (
                       <button key={i.id} onClick={() => handleAddInsumo(i)} className="w-full text-left p-3 rounded-lg hover:bg-nexus-primary/10 text-xs font-bold uppercase text-slate-600 dark:text-zinc-400">
                          {i.name}
                       </button>
                    ))}
                 </div>
             </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
             <div>
                <p className="text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Costo de Receta</p>
                <p className="text-3xl font-black text-slate-800 dark:text-white">${recipeCost.toFixed(2)}</p>
             </div>
             <div className="flex gap-4">
                <button onClick={handleSaveRecipe} className="px-10 py-4 bg-nexus-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest">Guardar Cambios</button>
                <button onClick={onClose} className="px-8 py-4 bg-slate-200/50 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">Cancelar</button>
             </div>
          </div>
        </div>
      </div>
    );
  };
  
  const RecipeView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(p => {
        const recipeCost = p.recipe?.reduce((total, item) => {
          const insumo = insumos.find(i => i.id === item.insumoId);
          return total + (insumo ? insumo.cost * item.quantity : 0);
        }, 0) || 0;
        
        return (
          <div key={p.id} className="glass-panel p-8 rounded-[3rem] group">
            <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase truncate">{p.name}</h4>
            <div className="flex justify-between items-baseline mt-2">
              <p className="text-2xl font-black text-nexus-primary tracking-tighter">${p.price.toFixed(2)}</p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-zinc-500">Costo: ${recipeCost.toFixed(2)}</p>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 mt-4 uppercase">
              {p.recipe ? `${p.recipe.length} Insumos` : 'Sin Receta'}
            </p>
            <button onClick={() => setEditingRecipe(p)} className="mt-6 w-full py-3 bg-slate-200/50 dark:bg-white/5 rounded-xl text-[9px] font-black uppercase text-slate-500 dark:text-zinc-400 hover:bg-nexus-primary hover:text-black transition-all">
              Gestionar Receta
            </button>
          </div>
        )
      })}
    </div>
  );
  
  const ClosingsView = () => (
    <div className="glass-panel rounded-[4rem] overflow-hidden shadow-2xl">
      <table className="w-full text-left">
        <thead className="bg-slate-200/50 dark:bg-black/40 border-b border-slate-300/50 dark:border-white/5">
          <tr className="text-[9px] font-black uppercase text-slate-500 dark:text-zinc-500 tracking-[0.3em]">
            <th className="p-10">Cajero</th>
            <th className="p-10">Fecha</th>
            <th className="p-10">Total Sistema</th>
            <th className="p-10">Total Declarado</th>
            <th className="p-10">Discrepancia</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
          {shiftReports.filter(r => r.branchId === currentViewBranchId).map(r => {
            const totalSystem = r.systemTotals.cash + r.systemTotals.card + r.systemTotals.transfer;
            const totalDeclared = r.declaredTotals.cash + r.declaredTotals.card + r.declaredTotals.transfer;
            const totalDiscrepancy = r.discrepancies.cash + r.discrepancies.card + r.discrepancies.transfer;
            return (
              <tr key={r.id} className="hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors group">
                <td className="p-10"><p className="font-black text-slate-800 dark:text-white uppercase text-sm">{r.userName}</p></td>
                <td className="p-10"><p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">{new Date(r.endedAt).toLocaleString()}</p></td>
                <td className="p-10"><p className="font-mono font-bold text-slate-700 dark:text-zinc-300">${totalSystem.toFixed(2)}</p></td>
                <td className="p-10"><p className="font-mono font-bold text-slate-700 dark:text-zinc-300">${totalDeclared.toFixed(2)}</p></td>
                <td className="p-10">
                  <span className={`px-4 py-2 rounded-full font-mono font-black text-xs ${
                    totalDiscrepancy === 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    ${totalDiscrepancy.toFixed(2)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
  
  const UsersView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleUsers.map(u => (
            <div key={u.id} className="glass-panel p-8 rounded-[3rem] group space-y-4">
                <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase truncate">{u.name}</h4>
                <p className="text-[10px] font-black text-nexus-primary uppercase">{u.role}</p>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200/50 dark:border-white/5">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${u.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{u.status}</span>
                    <div className="flex gap-2">
                        <button onClick={() => handleOpenUserEditor(u)} className="w-10 h-10 rounded-xl bg-slate-200/50 dark:bg-white/5 text-slate-500 dark:text-zinc-400 hover:bg-nexus-primary hover:text-black transition-all"><i className="fa-solid fa-pencil"></i></button>
                        <button onClick={() => handleDeleteUser(u.id)} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            </div>
        ))}
    </div>
  );
  
  const SuppliersView = () => (
    <div className="glass-panel rounded-[4rem] overflow-hidden shadow-2xl">
      <div className="p-8 flex justify-between items-center border-b border-slate-200 dark:border-white/5">
        <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-widest">{t.suppliers}</h3>
        <button onClick={() => setEditingSupplier({})} className="px-6 py-3 bg-slate-200/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 rounded-xl text-slate-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-white/10 transition-all">{t.create_supplier}</button>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-200/50 dark:bg-black/40">
          <tr className="text-[9px] font-black uppercase text-slate-500 dark:text-zinc-500 tracking-widest">
            <th className="p-6">Nombre</th><th className="p-6">Categoría</th><th className="p-6">Contacto</th><th className="p-6">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {visibleSuppliers.map(s => (
            <tr key={s.id} className="border-b border-slate-200 dark:border-white/5">
              <td className="p-6 text-xs font-black uppercase text-slate-800 dark:text-white">{s.name}</td>
              <td className="p-6 text-xs font-bold text-slate-500 dark:text-zinc-400">{s.category}</td>
              <td className="p-6 text-xs font-mono text-slate-500 dark:text-zinc-500">{s.phone}</td>
              <td className="p-6"><button onClick={() => setEditingSupplier(s)} className="text-nexus-primary text-[9px] font-black uppercase">Editar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-8 h-full flex flex-col pb-20">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 dark:border-white/5 pb-8">
         <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-nexus-primary/10 text-nexus-primary rounded-[2.5rem] flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(16,185,129,0.2)]">
               <i className={`fa-solid ${activeView === 'Users' ? 'fa-user-gear' : activeView === 'Suppliers' ? 'fa-boxes-packing' : activeView === 'Recipes' ? 'fa-book-open' : activeView === 'Closings' ? 'fa-archive' : 'fa-chart-pie'}`}></i>
            </div>
            <div>
               <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">
                 {isMaster ? 'Control de Matriz' : 'Gestión de Sucursal'}
               </h2>
               <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-black uppercase tracking-[0.5em] mt-2">
                 {isMaster ? `Nexus Sovereign Access • ${allUsersCount} Operadores Globales` : `Nodo Activo: ${branches.find(b => b.id === currentUser.branchId)?.name}`}
               </p>
            </div>
         </div>

         <div className="flex gap-4">
            {isMaster && (
              <div className="flex flex-col gap-2">
                 <label className="text-[8px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ml-4">Sucursal a Gestionar</label>
                 <select 
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-slate-200/50 dark:bg-black/60 border border-slate-300/50 dark:border-white/10 rounded-[1.5rem] px-8 py-4 text-[10px] font-black uppercase text-nexus-primary outline-none focus:border-nexus-primary transition-all shadow-xl"
                 >
                   {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                 </select>
              </div>
            )}
         </div>
      </header>

      <nav className="flex gap-4 border-b border-slate-200 dark:border-white/5 pb-4 overflow-x-auto no-scrollbar">
         {[
           { id: 'Users', label: t.staff, icon: 'fa-user-group' },
           { id: 'Suppliers', label: t.suppliers, icon: 'fa-truck-fast' },
           { id: 'Payroll', label: t.payroll, icon: 'fa-money-bill-transfer' },
           { id: 'Reports', label: t.branch_reports, icon: 'fa-file-invoice-dollar' },
           { id: 'Recipes', label: t.recipes, icon: 'fa-book-open' },
           { id: 'Closings', label: t.closings, icon: 'fa-archive' }
         ].map((v) => (
           <button 
            key={v.id} 
            onClick={() => setActiveView(v.id as any)}
            className={`px-8 py-4 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeView === v.id ? 'bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-white border border-slate-300/50 dark:border-white/10 shadow-lg' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
           >
             <i className={`fa-solid ${v.icon}`}></i>
             {v.label}
           </button>
         ))}
      </nav>

      <div className="flex-1 overflow-y-auto custom-scroll pr-4 pb-20">
         {activeView === 'Users' && <UsersView />}
         {activeView === 'Suppliers' && <SuppliersView />}
         {activeView === 'Payroll' && <HR employees={employees} setEmployees={setEmployees} branchId={currentViewBranchId!} language={language} user={currentUser} orders={orders} attendanceRecords={attendanceRecords} />}
         {activeView === 'Reports' && <Reports orders={orders} insumos={insumos} products={products} employees={employees} branch={currentBranchForReports} business={business} resolvedTheme={resolvedTheme} language={language} />}
         {activeView === 'Recipes' && <RecipeView />}
         {activeView === 'Closings' && <ClosingsView />}
      </div>
      
      {editingRecipe && <RecipeEditorModal product={editingRecipe} onClose={() => setEditingRecipe(null)} />}
      {editingUser && editingEmployee && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/90 backdrop-blur-3xl p-6">
            <form onSubmit={handleSaveUser} className="glass-panel w-full max-w-2xl p-12 rounded-[4rem] flex flex-col h-[90vh]">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">{editingUser.id ? t.edit_user : t.create_user}</h3>
                <div className="flex gap-2 border-b border-slate-200 dark:border-white/5 mb-6">
                    <button type="button" onClick={() => setEditorTab('general')} className={`pb-2 text-xs font-bold uppercase ${editorTab==='general' ? 'text-nexus-primary border-b-2 border-nexus-primary' : 'text-slate-500'}`}>General</button>
                    <button type="button" onClick={() => setEditorTab('hr')} className={`pb-2 text-xs font-bold uppercase ${editorTab==='hr' ? 'text-nexus-primary border-b-2 border-nexus-primary' : 'text-slate-500'}`}>Nómina y Horarios</button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scroll pr-4">
                    {editorTab === 'general' && (
                        <div className="space-y-6">
                            <input required value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} placeholder={t.user_name} className="w-full nexus-input"/>
                            <select required value={editingUser.role || ''} onChange={e => setEditingUser({...editingUser, role: e.target.value as Role})} className="w-full nexus-input"><option value="">-- {t.user_role} --</option>{Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}</select>
                            <input required value={editingUser.pin || ''} onChange={e => setEditingUser({...editingUser, pin: e.target.value})} placeholder={t.user_pin} className="w-full nexus-input" maxLength={4}/>
                            <select value={editingUser.status || 'Active'} onChange={e => setEditingUser({...editingUser, status: e.target.value as 'Active' | 'OnLeave' | 'Terminated'})} className="w-full nexus-input"><option value="Active">Active</option><option value="OnLeave">OnLeave</option><option value="Terminated">Terminated</option></select>
                        </div>
                    )}
                    {editorTab === 'hr' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 block mb-1 ml-2">Tipo de Pago</label>
                                    <select value={editingEmployee.paymentType || 'daily'} onChange={e => setEditingEmployee({...editingEmployee, paymentType: e.target.value as 'hourly' | 'daily'})} className="w-full nexus-input text-xs"><option value="daily">Pago por Día</option><option value="hourly">Pago por Hora</option></select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 block mb-1 ml-2">Tarifa</label>
                                    <input type="number" value={editingEmployee.paymentType === 'daily' ? editingEmployee.dailyRate : editingEmployee.hourlyRate} onChange={e => setEditingEmployee(editingEmployee.paymentType === 'daily' ? {...editingEmployee, dailyRate: Number(e.target.value)} : {...editingEmployee, hourlyRate: Number(e.target.value)})} placeholder="Tarifa" className="w-full nexus-input text-xs"/>
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 block mb-1 ml-2">Horas por Jornada</label>
                                    <input type="number" value={editingEmployee.workdayHours || 8} onChange={e => setEditingEmployee({...editingEmployee, workdayHours: Number(e.target.value)})} placeholder="Horas por Jornada" className="w-full nexus-input text-xs"/>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 block mb-1 ml-2">{t.scheduled_start_time}</label>
                                    <input type="time" value={editingEmployee.shiftStartTime || ''} onChange={e => setEditingEmployee({...editingEmployee, shiftStartTime: e.target.value})} className="w-full nexus-input text-xs"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                    <label className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 block mb-1 ml-2">Penalización Retardo ($)</label>
                                   <input type="number" value={editingEmployee.latePenalty || 0} onChange={e => setEditingEmployee({...editingEmployee, latePenalty: Number(e.target.value)})} placeholder="Penalización Retardo" className="w-full nexus-input text-xs"/>
                               </div>
                               <div>
                                    <label className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 block mb-1 ml-2">Penalización Falta ($)</label>
                                   <input type="number" value={editingEmployee.absencePenalty || 0} onChange={e => setEditingEmployee({...editingEmployee, absencePenalty: Number(e.target.value)})} placeholder="Penalización Falta" className="w-full nexus-input text-xs"/>
                               </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 block mb-1 ml-2">{t.monthly_benefits} ($)</label>
                                <input type="number" value={editingEmployee.benefits || 0} onChange={e => setEditingEmployee({...editingEmployee, benefits: Number(e.target.value)})} placeholder={t.monthly_benefits} className="w-full nexus-input text-xs"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-2 block">Días de Descanso</label>
                                <div className="grid grid-cols-7 gap-2">
                                    {['D','L','M','M','J','V','S'].map((day, index) => (
                                        <button type="button" key={index} onClick={() => {
                                            const restDays = editingEmployee.restDays || [];
                                            const newRestDays = restDays.includes(index) ? restDays.filter(d => d !== index) : [...restDays, index];
                                            setEditingEmployee({...editingEmployee, restDays: newRestDays});
                                        }} className={`h-10 rounded-lg text-xs font-black ${editingEmployee.restDays?.includes(index) ? 'bg-nexus-primary text-black' : 'bg-slate-200 dark:bg-white/5 text-slate-500'}`}>{day}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 pt-4 mt-auto"><button type="submit" className="flex-1 py-4 bg-nexus-primary text-black rounded-xl font-black uppercase">{t.save_changes}</button><button type="button" onClick={() => {setEditingUser(null); setEditingEmployee(null)}} className="flex-1 py-4 bg-slate-200/50 dark:bg-white/5 rounded-xl text-slate-500 dark:text-zinc-400 font-black uppercase">Cancelar</button></div>
            </form>
        </div>
      )}
      {editingSupplier && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/90 backdrop-blur-3xl p-6">
             <form onSubmit={handleSaveSupplier} className="glass-panel w-full max-w-lg p-12 rounded-[4rem] space-y-8">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">{editingSupplier.id ? t.edit_supplier : t.create_supplier}</h3>
                <input required value={editingSupplier.name || ''} onChange={e => setEditingSupplier({...editingSupplier, name: e.target.value})} placeholder={t.supplier_name} className="w-full nexus-input"/>
                <input required value={editingSupplier.category || ''} onChange={e => setEditingSupplier({...editingSupplier, category: e.target.value})} placeholder={t.supplier_category} className="w-full nexus-input"/>
                <input required value={editingSupplier.phone || ''} onChange={e => setEditingSupplier({...editingSupplier, phone: e.target.value})} placeholder={t.supplier_phone} className="w-full nexus-input"/>
                <input required value={editingSupplier.email || ''} onChange={e => setEditingSupplier({...editingSupplier, email: e.target.value})} placeholder={t.supplier_email} className="w-full nexus-input"/>
                <div className="flex gap-4 pt-4"><button type="submit" className="flex-1 py-4 bg-nexus-primary text-black rounded-xl font-black uppercase">{t.save_changes}</button><button type="button" onClick={() => setEditingSupplier(null)} className="flex-1 py-4 bg-slate-200/50 dark:bg-white/5 rounded-xl text-slate-500 dark:text-zinc-400 font-black uppercase">Cancelar</button></div>
             </form>
        </div>
      )}
    </div>
  );
};

export default Management;
