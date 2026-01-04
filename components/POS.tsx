
import React, { useState, useRef, useMemo } from 'react';
import { Product, Order, OrderItem, BranchInfo, User, BusinessConfig, Language, Role, OrderType, Table, DeliveryDetails, Reservation, Customer } from '../types';
import { TRANSLATIONS } from '../constants';
import GlobalCalculator from './GlobalCalculator';
import Reservations from './Reservations';
import Ticket from './Ticket';

interface Props {
  products: Product[];
  currentBranch: BranchInfo;
  user: User;
  business: BusinessConfig;
  language: Language;
  onCreateOrder: (order: Order) => void;
  onUpdateOrder: (order: Order) => void;
  tables: Table[];
  users: User[];
  orders: Order[];
  reservations: Reservation[];
  setReservations: (reservations: Reservation[]) => void;
  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;
}

const POS: React.FC<Props> = ({ products, currentBranch, user, business, language, onCreateOrder, onUpdateOrder, tables, users, orders, reservations, setReservations, customers, setCustomers }) => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [isDeliveryFormComplete, setIsDeliveryFormComplete] = useState(false);
  const deliveryFormRef = useRef<HTMLFormElement>(null);
  const [tip, setTip] = useState(0);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia'>('Efectivo');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [reference, setReference] = useState('');
  
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);
  const [linkedCustomerId, setLinkedCustomerId] = useState<string | null>(null);
  const [crmSearch, setCrmSearch] = useState('');
  const [searchResult, setSearchResult] = useState<Customer | null | 'not_found'>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  const t = TRANSLATIONS[language] as any;
  const isSovereign = [Role.ADMIN_IT, Role.PROPIETARIO].includes(user.role);
  const assignedTable = tables.find(t => t.id === tableId);
  const assignedWaiter = users.find(u => u.id === (activeOrder?.waiterId || assignedTable?.assignedWaiterId));
  
  const openDineInOrders = orders.filter(o => o.orderType === 'Dine-in' && o.status !== 'Closed' && o.status !== 'Cancelled');
  const todaysReservations = reservations.filter(r => r.date === new Date().toISOString().split('T')[0] && r.status === 'Confirmed');
  
  const linkedCustomer = useMemo(() => customers.find(c => c.id === linkedCustomerId), [customers, linkedCustomerId]);

  const subtotal = cart.reduce((acc, item) => {
    const p = products.find(prod => prod.id === item.productId);
    return acc + (p ? p.price * item.quantity : 0);
  }, 0);

  const tax = subtotal * currentBranch.config.taxRate;
  const total = subtotal + tax + tip;
  const change = amountPaid ? Number(amountPaid) - total : 0;

  const handleUpdateCart = (productId: string, quantity: number) => {
      if (quantity <= 0) {
          setCart(cart.filter(item => item.productId !== productId));
      } else {
          setCart(cart.map(item => item.productId === productId ? { ...item, quantity } : item));
      }
  };
  
  const handleFinalizeOrder = () => {
    if (isSovereign || cart.length === 0) return;
    
    const customerDetails = linkedCustomer ? { customerId: linkedCustomer.id, customerName: linkedCustomer.name } : {};

    if (activeOrder) {
      const updatedOrder: Order = {
        ...activeOrder,
        items: cart,
        subtotal, tax, tip, total,
        status: 'Closed',
        paymentType, 
        referenceNumber: reference,
        amountPaid: Number(amountPaid) || total,
        change: change > 0 ? change : 0,
        ...customerDetails
      };
      onUpdateOrder(updatedOrder);
      setLastCompletedOrder(updatedOrder);
    } else {
      const newOrder: Order = {
        id: `SN-${Date.now().toString().slice(-4)}`,
        branchId: currentBranch.id,
        items: cart,
        subtotal, tax, tip, total,
        currency: currentBranch.config.baseCurrency,
        status: 'Closed', // Takeout/Delivery orders are closed immediately
        createdAt: new Date().toISOString(),
        orderType: orderType!,
        tableId: tableId ?? undefined,
        deliveryDetails: deliveryDetails ?? undefined,
        waiterId: user.id,
        waiterName: user.name,
        paymentType, 
        referenceNumber: reference,
        amountPaid: Number(amountPaid) || total,
        change: change > 0 ? change : 0,
        ...customerDetails
      };
      onCreateOrder(newOrder);
      setLastCompletedOrder(newOrder);
    }
  };
  
  const resetOrder = () => {
    setCart([]);
    setOrderType(null);
    setTableId(null);
    setDeliveryDetails(null);
    setIsDeliveryFormComplete(false);
    setShowPaymentModal(false);
    setAmountPaid('');
    setReference('');
    setTip(0);
    setActiveOrder(null);
    setLinkedCustomerId(null);
    setCrmSearch('');
    setSearchResult(null);
    setNewCustomerName('');
  };

  const closeTicketAndReset = () => {
    setLastCompletedOrder(null);
    resetOrder();
  };
  
  const handleSearchCustomer = () => {
    const found = customers.find(c => c.phone === crmSearch || c.name.toLowerCase() === crmSearch.toLowerCase());
    setSearchResult(found || 'not_found');
  };

  const handleCreateAndLinkCustomer = () => {
    const newCustomer: Customer = {
      id: `c-${Date.now()}`,
      name: newCustomerName || crmSearch,
      phone: crmSearch,
      totalSpent: 0
    };
    setCustomers([...customers, newCustomer]);
    setLinkedCustomerId(newCustomer.id);
    setIsCrmModalOpen(false);
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deliveryFormRef.current) {
      const formData = new FormData(deliveryFormRef.current);
      setDeliveryDetails({
        customerName: formData.get('name') as string,
        address: formData.get('address') as string,
        phone: formData.get('phone') as string
      });
      setIsDeliveryFormComplete(true);
    }
  };

  const handleSelectOrder = (order: Order) => {
    setActiveOrder(order);
    setCart(order.items);
    setOrderType(order.orderType);
    setTableId(order.tableId || null);
    setTip(order.tip);
    setLinkedCustomerId(order.customerId || null);
  };

  if (user.role === Role.CAJERO && !activeOrder && !orderType) {
    return (
    <>
      <div className="h-full flex flex-col animate-fade-in space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-widest text-slate-800 dark:text-white">Consola de Caja</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2 glass-panel rounded-[3rem] p-8 flex flex-col">
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">Cuentas Abiertas ({openDineInOrders.length})</h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scroll pr-2">
              {openDineInOrders.map(o => {
                const table = tables.find(t => t.id === o.tableId);
                const waiter = users.find(u => u.id === o.waiterId);
                return (
                  <button key={o.id} onClick={() => handleSelectOrder(o)} className="w-full text-left p-6 bg-slate-200/50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-nexus-primary transition-all flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-800 dark:text-white">Mesa #{table?.number}</p>
                      <p className="text-[9px] font-bold text-slate-500 dark:text-zinc-500 uppercase">{waiter?.name}</p>
                    </div>
                    <p className="text-lg font-black text-nexus-primary">${o.total.toFixed(2)}</p>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="space-y-6">
            <button onClick={() => setShowReservations(true)} className="w-full h-1/3 glass-panel p-8 rounded-[3rem] flex flex-col items-center justify-center space-y-4 hover:border-nexus-primary transition-all group relative">
                <span className="absolute top-6 right-6 w-10 h-10 bg-nexus-primary text-black rounded-full flex items-center justify-center font-black text-sm">{todaysReservations.length}</span>
                <i className="fa-solid fa-calendar-check text-4xl text-slate-500 dark:text-zinc-600 group-hover:text-nexus-primary transition-colors"></i>
                <span className="text-lg font-black uppercase tracking-widest text-slate-700 dark:text-white">{t.reservations}</span>
            </button>
            <button onClick={() => setOrderType('Takeout')} className="w-full h-1/3 glass-panel p-8 rounded-[3rem] flex flex-col items-center justify-center space-y-4 hover:border-nexus-primary transition-all group">
              <i className="fa-solid fa-shopping-bag text-4xl text-slate-500 dark:text-zinc-600 group-hover:text-nexus-primary transition-colors"></i>
              <span className="text-lg font-black uppercase tracking-widest text-slate-700 dark:text-white">Para LLevar</span>
            </button>
            <button onClick={() => setOrderType('Delivery')} className="w-full h-1/3 glass-panel p-8 rounded-[3rem] flex flex-col items-center justify-center space-y-4 hover:border-nexus-primary transition-all group">
              <i className="fa-solid fa-motorcycle text-4xl text-slate-500 dark:text-zinc-600 group-hover:text-nexus-primary transition-colors"></i>
              <span className="text-lg font-black uppercase tracking-widest text-slate-700 dark:text-white">Reparto</span>
            </button>
          </div>
        </div>
      </div>
      {isCalculatorOpen && <GlobalCalculator onClose={() => setIsCalculatorOpen(false)} language={language} />}
      {showReservations && (
          <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-lg p-4 lg:p-8 animate-fade-in">
              <div className="bg-slate-100 dark:bg-nexus-dark w-full h-full rounded-[2rem] lg:rounded-[3rem] overflow-hidden flex flex-col">
                  <header className="p-4 flex justify-end shrink-0">
                      <button onClick={() => setShowReservations(false)} className="w-12 h-12 bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-zinc-400 rounded-full text-lg hover:bg-red-500/10 hover:text-red-500 transition-all"><i className="fa-solid fa-times"></i></button>
                  </header>
                  <div className="flex-1 overflow-y-auto custom-scroll px-4 lg:px-8 pb-8">
                      <Reservations reservations={reservations} setReservations={setReservations} branch={currentBranch} />
                  </div>
              </div>
          </div>
      )}
      </>
    );
  }

  if (!orderType && !activeOrder) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in space-y-12">
        <h2 className="text-3xl font-black uppercase tracking-widest text-slate-800 dark:text-white">Seleccione Protocolo de Orden</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <button onClick={() => setOrderType('Dine-in')} className="glass-panel p-16 rounded-[4rem] flex flex-col items-center justify-center space-y-6 hover:border-nexus-primary transition-all group">
            <i className="fa-solid fa-utensils text-5xl text-slate-500 dark:text-zinc-600 group-hover:text-nexus-primary transition-colors"></i>
            <span className="text-xl font-black uppercase tracking-widest text-slate-700 dark:text-white">Consumo Local</span>
          </button>
          <button onClick={() => setOrderType('Takeout')} className="glass-panel p-16 rounded-[4rem] flex flex-col items-center justify-center space-y-6 hover:border-nexus-primary transition-all group">
            <i className="fa-solid fa-shopping-bag text-5xl text-slate-500 dark:text-zinc-600 group-hover:text-nexus-primary transition-colors"></i>
            <span className="text-xl font-black uppercase tracking-widest text-slate-700 dark:text-white">Para LLevar</span>
          </button>
          <button onClick={() => setOrderType('Delivery')} className="glass-panel p-16 rounded-[4rem] flex flex-col items-center justify-center space-y-6 hover:border-nexus-primary transition-all group">
            <i className="fa-solid fa-motorcycle text-5xl text-slate-500 dark:text-zinc-600 group-hover:text-nexus-primary transition-colors"></i>
            <span className="text-xl font-black uppercase tracking-widest text-slate-700 dark:text-white">Reparto</span>
          </button>
        </div>
      </div>
    );
  }

  if (orderType === 'Dine-in' && !tableId && !activeOrder) {
    return (
      <div className="h-full flex flex-col p-4 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase tracking-widest text-slate-800 dark:text-white">Seleccionar Mesa</h2>
          <button onClick={() => setOrderType(null)} className="px-6 py-2 bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-zinc-400 rounded-xl text-[10px] uppercase font-black">Regresar</button>
        </div>
        <div className="flex-1 grid grid-cols-4 md:grid-cols-8 gap-4 overflow-y-auto custom-scroll">
          {tables.map(t => (
            <button key={t.id} onClick={() => setTableId(t.id)} disabled={t.status === 'Occupied'} className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${t.status === 'Available' ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed'}`}>
              <span className="text-3xl font-black">#{t.number}</span>
              <span className="text-[9px] font-bold uppercase">{t.status}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (orderType === 'Delivery' && !isDeliveryFormComplete) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in">
        <div className="glass-panel w-full max-w-lg p-16 rounded-[4rem] space-y-10">
          <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter text-center">Detalles de Entrega</h3>
          <form ref={deliveryFormRef} onSubmit={handleDeliverySubmit} className="space-y-6">
            <input name="name" required className="w-full nexus-input" placeholder="Nombre del Cliente" />
            <input name="address" required className="w-full nexus-input" placeholder="Dirección de Entrega" />
            <input name="phone" required className="w-full nexus-input" placeholder="Teléfono de Contacto" />
            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 py-5 bg-nexus-primary text-black rounded-2xl font-black uppercase tracking-widest">Confirmar Datos</button>
              <button type="button" onClick={resetOrder} className="px-10 py-5 bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-zinc-400 rounded-2xl font-black uppercase">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-fade-in">
        <div className={`lg:col-span-8 flex flex-col space-y-4 ${activeOrder ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="flex-1 overflow-y-auto custom-scroll grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 pr-2">
            {products.map(p => (
              <button key={p.id} disabled={!!activeOrder} onClick={() => {
                  const existing = cart.find(c => c.productId === p.id);
                  if (existing) setCart(cart.map(c => c.productId === p.id ? { ...c, quantity: c.quantity + 1 } : c));
                  else setCart([...cart, { productId: p.id, quantity: 1, status: 'Pending' }]);
              }} className="glass-panel p-4 rounded-xl text-left border hover:border-nexus-primary group transition-all flex flex-col justify-between h-32 relative overflow-hidden disabled:cursor-not-allowed">
                  <h4 className="font-black text-[9px] uppercase text-slate-500 dark:text-zinc-400 group-hover:text-nexus-primary dark:group-hover:text-white leading-tight tracking-widest">{p.name}</h4>
                  <p className="text-nexus-primary font-black text-2xl tracking-tighter">${p.price}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 glass-panel rounded-[2rem] flex flex-col overflow-hidden bg-white/50 dark:bg-black/60">
            <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-white/30 dark:bg-black/20 flex justify-between items-center">
              <div>
                  <h3 className="font-black text-[9px] uppercase text-slate-800 dark:text-white tracking-[0.3em]">Comanda Activa</h3>
                  {(tableId || activeOrder?.tableId) && <p className="text-[8px] font-bold text-nexus-primary uppercase tracking-widest">Mesa #{assignedTable?.number} / {assignedWaiter?.name}</p>}
                  {deliveryDetails && <p className="text-[8px] font-bold text-nexus-primary uppercase tracking-widest">Delivery / {deliveryDetails.customerName}</p>}
              </div>
              <button onClick={resetOrder} className="text-slate-500 dark:text-zinc-600 hover:text-red-500 transition-colors"><i className="fa-solid fa-times"></i></button>
            </div>
            
            <div className="p-4 border-b border-slate-200 dark:border-white/5">
                <p className="text-[8px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest mb-2">Cliente</p>
                <div className="flex items-center gap-2">
                    <p className="flex-1 text-xs font-bold text-slate-700 dark:text-zinc-300 truncate">{linkedCustomer ? linkedCustomer.name : t.no_customer_linked}</p>
                    <button onClick={() => setIsCrmModalOpen(true)} className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-zinc-400 hover:bg-nexus-primary hover:text-black transition-colors"><i className="fa-solid fa-user-plus"></i></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scroll">
              {cart.map((item, idx) => {
                const p = products.find(prod => prod.id === item.productId);
                return (
                  <div key={idx} className="p-3 rounded-lg bg-slate-200/50 dark:bg-white/5 flex justify-between items-center border border-slate-300/50 dark:border-white/5">
                    <div>
                        <p className="text-[9px] font-black text-slate-800 dark:text-white uppercase truncate w-32 tracking-tight">{p?.name}</p>
                        <span className="text-[10px] font-black text-slate-500 dark:text-zinc-500 tracking-tighter">${((p?.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button disabled={!!activeOrder} onClick={() => handleUpdateCart(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-slate-300/50 dark:bg-black/40 text-slate-600 dark:text-zinc-400 disabled:opacity-50">-</button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-white">{item.quantity}</span>
                        <button disabled={!!activeOrder} onClick={() => handleUpdateCart(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-slate-300/50 dark:bg-black/40 text-slate-800 dark:text-white disabled:opacity-50">+</button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-6 bg-slate-200/50 dark:bg-black/80 border-t border-slate-300/50 dark:border-white/5 space-y-4">
              <div className="space-y-1 text-[9px] font-black uppercase text-slate-500 dark:text-zinc-600 tracking-widest">
                  <div className="flex justify-between"><span>Subtotal</span><span className="text-slate-800 dark:text-white">${subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>I.V.A (16%)</span><span className="text-slate-800 dark:text-white">${tax.toFixed(2)}</span></div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-300/50 dark:border-white/10">
                    <span className="text-nexus-accent">Propina</span>
                    <input type="number" value={tip || ''} onChange={e => setTip(Number(e.target.value))} placeholder="$0.00" disabled={!!activeOrder && user.role !== Role.CAJERO} className="bg-transparent w-20 text-right font-black text-lg text-slate-800 dark:text-white nexus-input p-1 focus:border-nexus-accent" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    {[10, 15, 20].map(p => (
                      <button key={p} disabled={!!activeOrder && user.role !== Role.CAJERO} onClick={() => setTip(parseFloat((subtotal * (p / 100)).toFixed(2)))} className="flex-1 text-slate-500 dark:text-zinc-400 text-xs bg-slate-300/50 dark:bg-white/5 rounded-lg py-1.5 hover:bg-nexus-accent hover:text-black transition-all disabled:opacity-50">{p}%</button>
                    ))}
                     <button disabled={!!activeOrder && user.role !== Role.CAJERO} onClick={() => setTip(0)} className="flex-1 text-slate-500 dark:text-zinc-400 text-xs bg-slate-300/50 dark:bg-white/5 rounded-lg py-1.5 hover:bg-red-500/20 hover:text-white transition-all disabled:opacity-50">0%</button>
                  </div>
              </div>
              
              <div className="pt-4 border-t-2 border-dashed border-slate-300/50 dark:border-white/10">
                  <p className="text-[8px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Total</p>
                  <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">${total.toLocaleString()}</p>
              </div>

              <button 
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0 || isSovereign}
                className="w-full py-5 bg-nexus-primary text-black rounded-xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl disabled:opacity-20 active:scale-95 transition-all"
              >
                {isSovereign ? 'Modo Auditoría' : (activeOrder ? 'Liquidar Cuenta' : 'Liquidar Pago')}
              </button>
            </div>
        </div>
      </div>
      
      {showPaymentModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
          <div className="glass-panel w-full max-w-md p-12 rounded-[4rem] border border-white/10 animate-fade-in space-y-8">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter text-center">Liquidación de Orden</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['Efectivo', 'Tarjeta', 'Transferencia'] as const).map(type => (
                <button key={type} onClick={() => setPaymentType(type)} className={`py-4 rounded-xl text-[10px] font-black uppercase ${paymentType === type ? 'bg-nexus-primary text-black' : 'bg-white/5 text-zinc-400'}`}>
                  {t[type.toLowerCase()]}
                </button>
              ))}
            </div>
            {paymentType === 'Efectivo' && (
              <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Monto Recibido" className="w-full nexus-input text-center text-lg font-bold" />
            )}
            {paymentType !== 'Efectivo' && (
              <input type="text" value={reference} onChange={e => setReference(e.target.value)} placeholder="Referencia" className="w-full nexus-input text-center font-mono" />
            )}
            <div className="text-center">
              <p className="text-xs text-zinc-500 font-bold uppercase">Cambio</p>
              <p className="text-3xl font-black text-nexus-primary">${change > 0 ? change.toFixed(2) : '0.00'}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={handleFinalizeOrder} className="flex-1 py-5 bg-nexus-primary text-black rounded-xl font-black uppercase">{t.confirm_payment}</button>
              <button onClick={() => setShowPaymentModal(false)} className="px-8 py-5 bg-white/5 text-zinc-400 rounded-xl font-black uppercase">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {isCrmModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
          <div className="glass-panel w-full max-w-lg p-12 rounded-[4rem] border border-white/10 animate-fade-in space-y-8">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter text-center">{t.search_create_customer}</h3>
              <div className="flex gap-2">
                <input type="text" value={crmSearch} onChange={e => setCrmSearch(e.target.value)} placeholder="Teléfono o Email del Cliente" className="flex-1 nexus-input text-center" />
                <button onClick={handleSearchCustomer} className="px-6 bg-nexus-primary text-black rounded-xl font-black uppercase text-xs">Buscar</button>
              </div>
              
              {searchResult === 'not_found' && (
                <div className="space-y-4 pt-4 border-t border-white/10 animate-fade-in">
                  <p className="text-center text-xs text-zinc-400 font-bold uppercase">Cliente no encontrado. Crear nuevo perfil:</p>
                  <input type="text" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} placeholder={t.customer_name_optional} className="w-full nexus-input" />
                  <button onClick={handleCreateAndLinkCustomer} className="w-full py-4 bg-nexus-primary text-black rounded-xl font-black uppercase">{t.create_link}</button>
                </div>
              )}

              {searchResult && searchResult !== 'not_found' && (
                 <div className="space-y-4 pt-4 border-t border-white/10 animate-fade-in">
                    <div className="p-4 bg-black/20 rounded-lg text-center">
                      <p className="font-bold text-white">{searchResult.name}</p>
                      <p className="text-xs text-zinc-400">{searchResult.phone}</p>
                    </div>
                    <button onClick={() => { setLinkedCustomerId(searchResult.id); setIsCrmModalOpen(false); }} className="w-full py-4 bg-nexus-primary text-black rounded-xl font-black uppercase">{t.link_to_order}</button>
                 </div>
              )}
               <button onClick={() => setIsCrmModalOpen(false)} className="w-full py-2 text-xs text-zinc-500 font-bold uppercase">Cancelar</button>
          </div>
        </div>
      )}

      {lastCompletedOrder && (
          <Ticket 
              order={lastCompletedOrder}
              business={business}
              branch={currentBranch}
              products={products}
              onClose={closeTicketAndReset}
          />
      )}

      <button 
          onClick={() => setIsCalculatorOpen(true)}
          className="fixed bottom-10 right-10 w-16 h-16 bg-nexus-secondary text-white rounded-full flex items-center justify-center shadow-2xl z-50 hover:scale-110 transition-transform"
          aria-label="Open Calculator"
      >
          <i className="fa-solid fa-calculator text-2xl"></i>
      </button>

      {isCalculatorOpen && <GlobalCalculator onClose={() => setIsCalculatorOpen(false)} language={language} />}
    </>
  );
};

export default POS;