
import React from 'react';
import { Order, BusinessConfig, Product, BranchInfo } from '../types';

interface Props {
  order: Order;
  business: BusinessConfig;
  branch: BranchInfo;
  products: Product[];
  onClose: () => void;
}

const Ticket: React.FC<Props> = ({ order, business, branch, products, onClose }) => {
  // Fix: Access printer type from branch hardware configuration
  const is58 = branch.hardware.printer.type === '58mm';
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}></div>
      
      <div className={`relative bg-white text-black font-mono shadow-[0_50px_100px_rgba(0,0,0,0.8)] p-10 overflow-hidden transition-all duration-500 animate-in slide-in-from-bottom-20 ${is58 ? 'w-[58mm]' : 'w-[80mm]'}`}>
        <div id="printable-ticket" className="flex flex-col text-center">
          <div className="mb-4">
            <img src={business.logo} alt="logo" className="w-16 h-16 mx-auto mb-4 grayscale" />
            <h2 className="text-xl font-black uppercase leading-tight">{business.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-70 italic">{business.slogan}</p>
            <div className="border-t border-black/10 my-3"></div>
            <p className="text-[9px] opacity-80 leading-tight">{branch.config.address}</p>
            <p className="text-[9px] font-bold mt-1">TEL: {branch.config.phone}</p>
          </div>

          <div className="border-t-2 border-dashed border-black/20 my-5"></div>

          <div className="text-left text-[9px] space-y-1 font-bold">
            <p>FOLIO: <span className="font-black">#{order.id}</span></p>
            <p>FECHA: {new Date(order.createdAt).toLocaleString()}</p>
            <p>TICKET EMITIDO EN: {branch.name.toUpperCase()}</p>
            <p>OPERADOR: {order.waiterName?.toUpperCase() || 'PUNTO DE VENTA'}</p>
          </div>

          <div className="border-t border-dashed border-black/20 my-5"></div>

          <table className="w-full text-[9px]">
            <thead>
              <tr className="border-b-2 border-black/10">
                <th className="text-left py-2">CT</th>
                <th className="text-left py-2 pl-2">DESCRIPCION</th>
                <th className="text-right py-2">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {order.items.map(item => {
                const p = products.find(prod => prod.id === item.productId);
                return (
                  <tr key={item.productId}>
                    <td className="py-2 align-top">{item.quantity}</td>
                    <td className="py-2 pl-2 uppercase font-black align-top">{p?.name.slice(0, is58 ? 16 : 30)}</td>
                    <td className="py-2 text-right align-top">${((p?.price || 0) * item.quantity).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="border-t-2 border-dashed border-black/20 my-5"></div>

          <div className="space-y-1.5 text-[10px]">
            <div className="flex justify-between">
              <span>SUBTOTAL</span>
              <span>$ {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>IMPUESTOS (TAX)</span>
              <span>$ {order.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-black">
              <span>PROPINA SUGERIDA</span>
              <span>$ {order.tip.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-black border-t border-black pt-2 mt-2">
              <span>TOTAL ({order.currency || 'MXN'})</span>
              <span>$ {order.total.toLocaleString()}</span>
            </div>
            
            {order.currency === 'USD' ? (
               <div className="flex justify-between text-[8px] opacity-60">
                  <span>EQUIV MXN (T.C. {order.exchangeRateUsed || 1})</span>
                  <span>$ {(order.total * (order.exchangeRateUsed || 1)).toLocaleString()}</span>
               </div>
            ) : (
               <div className="flex justify-between text-[8px] opacity-60">
                  <span>EQUIV USD (T.C. {order.exchangeRateUsed || 1})</span>
                  <span>$ {(order.total / (order.exchangeRateUsed || 1)).toLocaleString()}</span>
               </div>
            )}
            
            <div className="flex justify-between text-[9px] pt-2">
              <span>METODO PAGO:</span>
              <span className="font-black uppercase">{order.paymentType}</span>
            </div>
          </div>

          <div className="mt-12 mb-6 flex flex-col items-center">
             <div className="w-40 h-px bg-black mb-1 opacity-20"></div>
             <p className="text-[7px] font-black uppercase tracking-widest">Autorización Digital de Transacción</p>
          </div>

          <div className="mt-4 mb-4 space-y-4">
            <p className="text-[9px] uppercase font-black leading-relaxed text-center px-4">
               {business.ticketFooter}
            </p>
            <div className="flex flex-col items-center space-y-1 opacity-40">
              <span className="text-[7px] font-bold">AR Control Inteligente: Restaurant Edition</span>
              <span className="text-[7px]">v4.11 Architecture by ChrisRey91</span>
            </div>
          </div>
        </div>

        <div className="absolute top-6 right-6 flex flex-col space-y-4 print:hidden">
           <button onClick={handlePrint} className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-all animate-pulse">
             <i className="fa-solid fa-print text-xl"></i>
           </button>
           <button onClick={onClose} className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-all">
             <i className="fa-solid fa-times text-xl"></i>
           </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; background: white !important; color: black !important; }
          #printable-ticket, #printable-ticket * { visibility: visible; }
          #printable-ticket { position: absolute; left: 0; top: 0; width: ${is58 ? '58mm' : '80mm'} !important; }
        }
      `}</style>
    </div>
  );
};

export default Ticket;
