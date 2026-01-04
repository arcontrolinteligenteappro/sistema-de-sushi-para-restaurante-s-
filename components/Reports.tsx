
import React, { useMemo } from 'react';
import { BranchInfo, Order, Insumo, Employee, BusinessConfig, Product, Language } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TRANSLATIONS } from '../constants';

interface Props {
  orders: Order[];
  insumos: Insumo[];
  employees: Employee[];
  branch: BranchInfo;
  business: BusinessConfig;
  resolvedTheme: 'light' | 'dark';
  products: Product[];
  language: Language;
}

const Reports: React.FC<Props> = ({ orders, insumos, employees, branch, business, resolvedTheme, products, language }) => {
  const t = TRANSLATIONS[language] as any;
  const branchOrders = orders.filter(o => o.branchId === branch.id);
  const closedOrders = branchOrders.filter(o => o.status === 'Closed');
  const totalSales = closedOrders.reduce((acc, o) => acc + o.total, 0);
  
  const fixedCosts = 15000;
  const appCommission = closedOrders.filter(o => o.deliveryApp).reduce((acc, o) => acc + (o.total * 0.15), 0);
  const payrollTotal = employees.filter(e => e.branchId === branch.id).reduce((acc, e) => acc + e.baseSalary, 0);

  const actualCogs = useMemo(() => {
    return closedOrders.reduce((totalCost, order) => {
      const orderCost = order.items.reduce((itemCost, item) => {
        const product = products.find(p => p.id === item.productId);
        if (product && product.recipe) {
          const recipeCost = product.recipe.reduce((cost, recipeItem) => {
            const insumo = insumos.find(i => i.id === recipeItem.insumoId);
            return cost + (insumo ? insumo.cost * recipeItem.quantity : 0);
          }, 0);
          return itemCost + (recipeCost * item.quantity);
        }
        return itemCost;
      }, 0);
      return totalCost + orderCost;
    }, 0);
  }, [closedOrders, products, insumos]);

  const totalExpenses = actualCogs + payrollTotal + appCommission + fixedCosts;
  const netProfit = totalSales - totalExpenses;

  const profitData = [
    { name: 'Ventas Totales', value: totalSales },
    { name: 'Gastos Totales', value: totalExpenses },
  ];

  const detailData = [
    { name: 'Insumos (COGS)', amount: actualCogs },
    { name: 'Nómina', amount: payrollTotal },
    { name: 'Comisión Apps', amount: appCommission },
    { name: 'Gastos Fijos', amount: fixedCosts },
  ];

  const productProfitability = useMemo(() => {
    const productData: { [key: string]: { revenue: number; cogs: number; quantity: number } } = {};

    closedOrders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return;

        if (!productData[product.id]) {
          productData[product.id] = { revenue: 0, cogs: 0, quantity: 0 };
        }

        const revenue = product.price * item.quantity;
        let cogs = 0;
        if (product.recipe) {
          const recipeCost = product.recipe.reduce((cost, recipeItem) => {
            const insumo = insumos.find(i => i.id === recipeItem.insumoId);
            return cost + (insumo ? insumo.cost * recipeItem.quantity : 0);
          }, 0);
          cogs = recipeCost * item.quantity;
        }

        productData[product.id].revenue += revenue;
        productData[product.id].cogs += cogs;
        productData[product.id].quantity += item.quantity;
      });
    });

    return Object.keys(productData)
      .map(id => {
        const p = products.find(p => p.id === id)!;
        const data = productData[id];
        const profit = data.revenue - data.cogs;
        return {
          name: p.name,
          ...data,
          profit,
        };
      })
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }, [closedOrders, products, insumos]);

  const COLORS = ['#0ea5e9', '#f43f5e'];
  const yAxisTickColor = resolvedTheme === 'dark' ? '#94a3b8' : '#334155';

  return (
    <div className="space-y-8 pb-20">
      <div className="glass-panel p-12 rounded-[3rem] flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <img src={business.logo} className="w-40 h-40 dark:invert" alt="bg-logo" />
        </div>
        <div className="space-y-4 mb-6 md:mb-0 relative z-10">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Utilidad Neta Real (Mensual)</p>
          <h2 className="text-6xl font-black tracking-tighter text-slate-800 dark:text-white">${netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-10 rounded-[2.5rem] flex flex-col h-[450px]">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-10">Desglose de Gastos</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detailData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--nexus-primary)" strokeOpacity={0.1} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} tick={{fontSize: 10, fill: yAxisTickColor, fontWeight: 800, letterSpacing: 1}} />
                <Tooltip wrapperClassName="!bg-slate-100 dark:!bg-nexus-panel !rounded-2xl !border !border-slate-300/50 dark:!border-white/10" cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Bar dataKey="amount" fill="var(--nexus-primary)" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-10 rounded-[2.5rem] flex flex-col h-[450px]">
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-10">Ratio Ingreso vs Gasto</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={profitData} cx="50%" cy="50%" innerRadius={90} outerRadius={120} paddingAngle={8} dataKey="value">
                  {profitData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.05)" /> ))}
                </Pie>
                <Tooltip wrapperClassName="!bg-slate-100 dark:!bg-nexus-panel !rounded-2xl !border !border-slate-300/50 dark:!border-white/10" />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="glass-panel p-10 rounded-[2.5rem] flex flex-col h-[500px]">
         <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-10">{t.profitability_analysis} por Producto</h3>
         <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productProfitability} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={yAxisTickColor} strokeOpacity={0.1} />
                  <XAxis dataKey="name" tick={{fontSize: 9, fill: yAxisTickColor, fontWeight: 800}} />
                  <YAxis tick={{fontSize: 10, fill: yAxisTickColor, fontWeight: 800}} />
                  <Tooltip wrapperClassName="!bg-slate-100 dark:!bg-nexus-panel !rounded-2xl !border !border-slate-300/50 dark:!border-white/10" cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}/>
                  <Bar dataKey="revenue" fill="#38bdf8" name={t.revenue} />
                  <Bar dataKey="cogs" fill="#fb7185" name={t.cogs} />
                  <Bar dataKey="profit" fill="#34d399" name={t.profit} />
              </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default Reports;