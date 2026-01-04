
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Insumo, Supplier, PurchaseOrder, BranchInfo, Language, POItem, AiSuggestion, Order, Product } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  insumos: Insumo[];
  setInsumos: React.Dispatch<React.SetStateAction<Insumo[]>>;
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  orders: Order[];
  products: Product[];
  onCreatePO: (po: PurchaseOrder) => void;
  onUpdatePO: (po: PurchaseOrder) => void;
  branch: BranchInfo;
  language: Language;
}

const SupplyChain: React.FC<Props> = ({ insumos, setInsumos, suppliers, purchaseOrders, orders, products, onCreatePO, onUpdatePO, branch, language }) => {
  const t = TRANSLATIONS[language] as any;
  const [view, setView] = useState<'Inventory' | 'POs'>('Inventory');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [poItems, setPoItems] = useState<POItem[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const lowStockInsumos = useMemo(() => insumos.filter(i => i.stock <= i.minStock), [insumos]);
  
  useEffect(() => {
    if (lowStockInsumos.length > 0 && branch.hardware.alerts.inventorySound) {
      if (audioRef.current) {
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(e => console.log("Audio block", e));
      }
    }
  }, [lowStockInsumos, branch.hardware.alerts.inventorySound]);

  const handleAddItem = (insumo: Insumo) => {
    const existing = poItems.find(i => i.insumoId === insumo.id);
    if (!existing) {
        setPoItems([...poItems, { insumoId: insumo.id, quantity: insumo.minStock * 2, cost: insumo.cost }]);
    }
  };
  
  const handleUpdateItem = (insumoId: string, field: 'quantity' | 'cost', value: number) => {
    setPoItems(poItems.map(item => item.insumoId === insumoId ? { ...item, [field]: value } : item));
  };
  
  const handleRemoveItem = (insumoId: string) => {
    setPoItems(poItems.filter(item => item.insumoId !== insumoId));
  }

  const handleQuickAdd = (insumo: Insumo) => {
    setIsModalOpen(true);
    handleAddItem(insumo);
    if (insumo.supplierId && !selectedSupplier) {
      setSelectedSupplier(insumo.supplierId);
    }
  };
  
  const handleCreatePO = () => {
    if (!selectedSupplier || poItems.length === 0) return;
    const totalCost = poItems.reduce((acc, item) => acc + (item.quantity * item.cost), 0);
    const newPO: PurchaseOrder = {
        id: `PO-${Date.now().toString().slice(-5)}`,
        branchId: branch.id,
        supplierId: selectedSupplier,
        items: poItems,
        totalCost,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };
    onCreatePO(newPO);
    setIsModalOpen(false);
    setSelectedSupplier('');
    setPoItems([]);
  };

  const generateAiSuggestions = () => {
    setIsAiLoading(true);
    setIsAiModalOpen(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentOrders = orders.filter(o => o.status === 'Closed' && new Date(o.createdAt) > sevenDaysAgo);

      const consumption: { [insumoId: string]: number } = {};
      insumos.forEach(i => consumption[i.id] = 0);

      recentOrders.forEach(order => {
        order.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product?.recipe) {
            product.recipe.forEach(recipeItem => {
              if (consumption.hasOwnProperty(recipeItem.insumoId)) {
                consumption[recipeItem.insumoId] += recipeItem.quantity * item.quantity;
              }
            });
          }
        });
      });

      const suggestions: AiSuggestion[] = [];
      insumos.forEach(insumo => {
        const weeklyConsumption = consumption[insumo.id] || 0;
        const dailyConsumption = weeklyConsumption / 7;
        const daysOfStockLeft = dailyConsumption > 0 ? insumo.stock / dailyConsumption : Infinity;

        // Reorder if stock is less than 7 days worth
        if (daysOfStockLeft < 7) {
          // Suggest ordering enough for 14 days, minus current stock
          const targetStock = dailyConsumption * 14;
          const suggestedQuantity = Math.max(0, targetStock - insumo.stock);

          if(suggestedQuantity > 0) {
            suggestions.push({
              insumoId: insumo.id,
              currentStock: insumo.stock,
              weeklyConsumption: weeklyConsumption,
              suggestedQuantity: Math.ceil(suggestedQuantity), // Round up to nearest whole unit
              supplierId: insumo.supplierId
            });
          }
        }
      });
      
      setAiSuggestions(suggestions);
      setIsAiLoading(false);
    }, 1500);
  };
  
  const handleCreatePOsFromSuggestions = () => {
    const suggestionsBySupplier: { [supplierId: string]: AiSuggestion[] } = {};
    aiSuggestions.forEach(sug => {
      const supplierId = sug.supplierId || 'unknown';
      if (!suggestionsBySupplier[supplierId]) {
        suggestionsBySupplier[supplierId] = [];
      }
      suggestionsBySupplier[supplierId].push(sug);
    });

    Object.keys(suggestionsBySupplier).forEach(supplierId => {
      if (supplierId === 'unknown') return; // Skip for now
      const items = suggestionsBySupplier[supplierId];
      const poItems: POItem[] = items.map(item => {
        const insumo = insumos.find(i => i.id === item.insumoId)!;
        return { insumoId: item.insumoId, quantity: item.suggestedQuantity, cost: insumo.cost };
      });
      const totalCost = poItems.reduce((acc, item) => acc + (item.quantity * item.cost), 0);

      const newPO: PurchaseOrder = {
        id: `PO-AI-${Date.now().toString().slice(-4)}`,
        branchId: branch.id,
        supplierId: supplierId,
        items: poItems,
        totalCost,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      onCreatePO(newPO);
    });
    
    setIsAiModalOpen(false);
    setAiSuggestions([]);
  };
  
  const groupedAiSuggestions = useMemo(() => {
    const grouped: { [supplierId: string]: AiSuggestion[] } = {};
    aiSuggestions.forEach(sug => {
        const supplierId = sug.supplierId || 'unknown';
        if (!grouped[supplierId]) grouped[supplierId] = [];
        grouped[supplierId].push(sug);
    });
    return grouped;
  }, [aiSuggestions]);

  const getStatusChip = (status: PurchaseOrder['status']) => {
    switch(status) {
        case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'Sent': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'Received': return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  }
  
  const poTotal = useMemo(() => poItems.reduce((acc, item) => acc + (item.quantity * item.cost), 0), [poItems]);
  const availableInsumos = useMemo(() => insumos.filter(i => !poItems.some(pi => pi.insumoId === i.id)), [insumos, poItems]);

  return (
    <div className="h-full flex flex-col space-y-8 animate-fade">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Gestión de Suministros</h2>
          <p className="text-[10px] text-purple-500 font-bold uppercase tracking-[0.4em] mt-1">Inventario y Cadena de Suministro</p>
        </div>
        <div className="flex bg-slate-200/50 dark:bg-black/20 p-1.5 rounded-2xl border border-slate-300/50 dark:border-white/5">
            <button onClick={() => setView('Inventory')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'Inventory' ? 'bg-nexus-primary text-slate-900 shadow-xl' : 'text-slate-500 dark:text-zinc-500'}`}>Inventario</button>
            <button onClick={() => setView('POs')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'POs' ? 'bg-nexus-primary text-slate-900 shadow-xl' : 'text-slate-500 dark:text-zinc-500'}`}>Órdenes de Compra</button>
        </div>
      </header>

      {view === 'Inventory' ? (
        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pr-2">
            {insumos.map(i => {
            const isCritical = i.stock <= i.minStock;
            return (
                <div key={i.id} className={`glass-panel p-6 rounded-3xl transition-all relative overflow-hidden flex flex-col justify-between group ${isCritical ? 'border-red-500 bg-red-500/10 animate-pulse' : ''}`}>
                    <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase truncate">{i.name}</h4>
                        <p className="text-[9px] text-slate-500 dark:text-zinc-500 font-bold uppercase mt-1">Min: {i.minStock} {i.unit}</p>
                    </div>
                    <div className="mt-4">
                        <p className={`text-4xl font-black tracking-tighter ${isCritical ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{i.stock}</p>
                        <p className="text-[8px] font-black uppercase text-slate-400 dark:text-zinc-600 mt-1">Existencia ({i.unit})</p>
                    </div>
                    {isCritical && (
                        <button onClick={() => handleQuickAdd(i)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-500 hover:text-white">+</button>
                    )}
                </div>
            );
            })}
        </div>
      ) : (
        <div className="flex-1 glass-panel rounded-[3rem] flex flex-col overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-slate-200 dark:border-white/5">
                <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white tracking-widest">Historial de Órdenes de Compra</h3>
                <div className="flex gap-2">
                    <button onClick={generateAiSuggestions} className="px-4 py-2 bg-purple-600/10 text-purple-500 border border-purple-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2">
                        <i className="fa-solid fa-wand-magic-sparkles"></i> {t.ai_suggestion}
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-slate-200/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 rounded-xl text-slate-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-white/10 transition-all">Nueva PO</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <table className="w-full text-left">
                <thead>
                    <tr className="text-[9px] font-black uppercase text-slate-400 dark:text-zinc-600 tracking-widest">
                    <th className="p-4">ID</th>
                    <th className="p-4">Proveedor</th>
                    <th className="p-4">Costo Total</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {purchaseOrders.map(po => {
                        const supplier = suppliers.find(s => s.id === po.supplierId);
                        return (
                            <tr key={po.id} className="border-b border-slate-200 dark:border-white/5">
                                <td className="p-4 font-mono text-xs text-slate-800 dark:text-white font-bold">{po.id}</td>
                                <td className="p-4 text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase">{supplier?.name}</td>
                                <td className="p-4 font-mono text-sm text-slate-800 dark:text-white font-bold">${po.totalCost.toLocaleString()}</td>
                                <td className="p-4"><span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${getStatusChip(po.status)}`}>{po.status}</span></td>
                                <td className="p-4">
                                    {po.status === 'Pending' && <button onClick={() => onUpdatePO({...po, status: 'Sent'})} className="text-blue-500 text-[9px] font-black uppercase tracking-widest">Enviar</button>}
                                    {po.status === 'Sent' && <button onClick={() => onUpdatePO({...po, status: 'Received', receivedAt: new Date().toISOString()})} className="text-green-500 text-[9px] font-black uppercase tracking-widest">Recibir</button>}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
                </table>
            </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-6">
           <div className="glass-panel w-full max-w-4xl rounded-[3rem] p-12 relative overflow-hidden flex flex-col h-[90vh]">
             <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest mb-8">Nueva Orden de Compra</h3>
             <div className="grid grid-cols-2 gap-8">
                <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)} className="nexus-input col-span-1">
                    <option value="">-- Seleccionar Proveedor --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <div className="col-span-1">
                    <button onClick={() => lowStockInsumos.forEach(handleAddItem)} className="w-full h-full text-xs py-2 bg-red-500/10 text-red-500 rounded-xl">Añadir Insumos con Stock Bajo</button>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pr-2 mt-4 border-t border-slate-200 dark:border-white/10 pt-4">
                {poItems.map(item => {
                    const insumo = insumos.find(i => i.id === item.insumoId)!;
                    return (
                        <div key={item.insumoId} className="grid grid-cols-12 items-center gap-4 p-2 bg-slate-200/50 dark:bg-black/20 rounded-lg">
                            <p className="col-span-5 text-xs font-bold uppercase text-slate-700 dark:text-zinc-300">{insumo.name}</p>
                            <input type="number" value={item.quantity} onChange={e => handleUpdateItem(item.insumoId, 'quantity', Number(e.target.value))} className="col-span-2 nexus-input text-center text-xs p-2"/>
                            <span className="text-xs text-slate-500 dark:text-zinc-500">{insumo.unit}</span>
                            <input type="number" value={item.cost} onChange={e => handleUpdateItem(item.insumoId, 'cost', Number(e.target.value))} className="col-span-2 nexus-input text-center text-xs p-2"/>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">${(item.quantity * item.cost).toFixed(2)}</p>
                            <button onClick={() => handleRemoveItem(item.insumoId)} className="text-red-500 text-xs"><i className="fa-solid fa-times"></i></button>
                        </div>
                    )
                })}
             </div>
             <div className="pt-6 border-t border-slate-200 dark:border-white/5 mt-auto flex justify-between items-center">
                <div>
                    <p className="text-xs text-slate-500 dark:text-zinc-500 uppercase font-bold">Total de la Orden</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-white">${poTotal.toFixed(2)}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-slate-200/50 dark:bg-white/5 text-slate-500 dark:text-zinc-500 rounded-2xl font-black text-[10px] uppercase">Cancelar</button>
                  <button onClick={handleCreatePO} disabled={!selectedSupplier || poItems.length === 0} className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50">Crear Orden</button>
                </div>
             </div>
           </div>
        </div>
      )}
      
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-6">
           <div className="glass-panel w-full max-w-4xl rounded-[3rem] p-12 relative overflow-hidden flex flex-col h-[90vh]">
             <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest mb-8">{t.ai_assistant}</h3>
             {isAiLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <i className="fa-solid fa-wand-magic-sparkles text-4xl text-purple-500 animate-pulse"></i>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-500">Analizando datos de ventas...</p>
                </div>
             ) : (
                <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar pr-2">
                    {Object.keys(groupedAiSuggestions).map(supplierId => {
                        const supplier = suppliers.find(s => s.id === supplierId);
                        return(
                            <div key={supplierId}>
                                <h4 className="text-xs font-black text-purple-500 uppercase tracking-widest mb-2">{supplier?.name || 'Proveedor Desconocido'}</h4>
                                <div className="space-y-2">
                                    {groupedAiSuggestions[supplierId].map(sug => {
                                        const insumo = insumos.find(i => i.id === sug.insumoId)!;
                                        return(
                                            <div key={sug.insumoId} className="grid grid-cols-6 items-center gap-4 p-4 bg-slate-200/50 dark:bg-black/20 rounded-2xl">
                                                <p className="col-span-2 text-xs font-black uppercase text-slate-700 dark:text-zinc-300">{insumo.name}</p>
                                                <p className="text-[9px] font-bold text-slate-500 dark:text-zinc-500">Stock: {sug.currentStock} {insumo.unit}</p>
                                                <p className="text-[9px] font-bold text-slate-500 dark:text-zinc-500">{t.weekly_consumption}: {sug.weeklyConsumption.toFixed(2)} {insumo.unit}</p>
                                                <input type="number" value={sug.suggestedQuantity} className="nexus-input text-center text-xs p-2" onChange={e => {
                                                    const newSuggestions = aiSuggestions.map(s => s.insumoId === sug.insumoId ? {...s, suggestedQuantity: Number(e.target.value)} : s);
                                                    setAiSuggestions(newSuggestions);
                                                }} />
                                                <button onClick={() => setAiSuggestions(aiSuggestions.filter(s => s.insumoId !== sug.insumoId))} className="text-red-500 text-xs">Eliminar</button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
             )}
             <div className="pt-6 border-t border-slate-200 dark:border-white/5 mt-auto flex justify-end gap-4">
                <button onClick={() => setIsAiModalOpen(false)} className="px-8 py-4 bg-slate-200/50 dark:bg-white/5 text-slate-500 dark:text-zinc-500 rounded-2xl font-black text-[10px] uppercase">Cancelar</button>
                <button onClick={handleCreatePOsFromSuggestions} disabled={isAiLoading} className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50">{t.generate_pos}</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SupplyChain;
