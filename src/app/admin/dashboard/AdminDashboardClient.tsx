'use client';

import { useState } from 'react';
import { Medicine, Order } from '@/types';
import OrderBadge from '@/components/OrderBadge';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  MoreVertical,
  CheckCircle2,
  X,
  Search,
  Filter
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { addMedicineAction, updateMedicineAction, deleteMedicineAction } from '@/app/actions/medicines';

interface AdminDashboardProps {
  initialMedicines: Medicine[];
  initialOrders: Order[];
  stats: {
    totalRevenue: number;
    pendingOrders: number;
    lowStockItems: number;
    totalOrders: number;
    totalMedicines: number;
  };
}

export default function AdminDashboardClient({ initialMedicines, initialOrders, stats }: AdminDashboardProps) {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportOrdersToCSV = () => {
    const headers = ['Order ID', 'Customer', 'Status', 'Total Price', 'Created At'];
    const rows = orders.map(o => [
      o.id,
      o.userName,
      o.status,
      o.totalPrice,
      new Date(o.createdAt).toLocaleString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddMedicine = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      requiresPrescription: formData.get('requiresPrescription') === 'true',
      image: `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=260&auto=format&fit=crop`, // Placeholder
    };

    const result = await addMedicineAction(data);
    if (result.success && result.medicine) {
      setMedicines(prev => [...prev, result.medicine as Medicine]);
      setIsAddingMed(false);
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const handleUpdateMedicine = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMed) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string),
      requiresPrescription: formData.get('requiresPrescription') === 'true',
    };

    const result = await updateMedicineAction(editingMed.id, data);
    if (result.success && result.medicine) {
      setMedicines(prev => prev.map(m => m.id === editingMed.id ? result.medicine as Medicine : m));
      setEditingMed(null);
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    const result = await deleteMedicineAction(id);
    if (result.success) {
      setMedicines(prev => prev.filter(m => m.id !== id));
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'emerald' },
            { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'amber' },
            { label: 'Low Stock Items', value: stats.lowStockItems, icon: AlertTriangle, color: 'rose' },
            { label: 'Total Medicines', value: stats.totalMedicines, icon: Package, color: 'indigo' },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
            >
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ring-1",
                stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600 ring-emerald-600/10" :
                stat.color === 'amber' ? "bg-amber-50 text-amber-600 ring-amber-600/10" :
                stat.color === 'rose' ? "bg-rose-50 text-rose-600 ring-rose-600/10" :
                "bg-indigo-50 text-indigo-600 ring-indigo-600/10"
              )}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inventory Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Inventory Management</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="relative group">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     <input 
                       type="text" 
                       placeholder="Filter catalog..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 transition-all w-48"
                     />
                   </div>
                </div>
              </div>
              <button 
                onClick={() => setIsAddingMed(true)}
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-2xl shadow-xl transition-all active:scale-95"
              >
                <Plus className="h-5 w-5" />
                Add Medicine
              </button>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Medicine</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Price</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Stock</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredMedicines.map(med => (
                    <tr key={med.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                               <img src={med.image} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div>
                               <p className="font-bold text-slate-900 text-sm">{med.name}</p>
                               {med.requiresPrescription && <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase leading-none">RX REQ</span>}
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{med.category}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-emerald-600 text-sm">
                        {formatCurrency(med.price)}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={cn(
                          "inline-flex items-center justify-center min-w-[50px] px-2 py-1 rounded-full text-xs font-black",
                          med.stock <= 10 ? "bg-rose-50 text-rose-600 ring-1 ring-rose-600/10" : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10"
                        )}>
                          {med.stock}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => setEditingMed(med)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit2 className="h-4 w-4" /></button>
                           <button onClick={() => handleDeleteMedicine(med.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side View: Orders & Reporting */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900">Recent Orders</h3>
                <button 
                  onClick={exportOrdersToCSV}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
              
              <div className="space-y-4">
                 {initialOrders.slice(0, 5).map(order => (
                   <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div>
                         <p className="text-sm font-bold text-slate-900">#{order.id}</p>
                         <p className="text-xs text-slate-500 truncate max-w-[120px]">{order.userName}</p>
                      </div>
                      <div className="text-right">
                         <div className="scale-75 origin-right"><OrderBadge status={order.status} /></div>
                         <p className="text-xs font-bold text-slate-900 mt-1">{formatCurrency(order.totalPrice)}</p>
                      </div>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all">
                 View All Reports
              </button>
            </div>

            <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
               <div className="relative z-10">
                 <BarChart3 className="h-10 w-10 text-emerald-300 mb-4" />
                 <h3 className="text-2xl font-black text-white">Target Reached</h3>
                 <p className="text-emerald-100 text-sm mt-1">Pharmacy revenue is up 24% from last month. Keep up the great work!</p>
               </div>
               <div className="absolute top-0 right-0 h-32 w-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add/Edit Medicine */}
      <AnimatePresence>
        {(isAddingMed || editingMed) && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               onClick={() => { setIsAddingMed(false); setEditingMed(null); }}
               className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.9, y: 20 }} 
               className="fixed inset-0 z-50 m-auto h-fit w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900">{isAddingMed ? 'Add Medicine' : 'Edit Medicine'}</h2>
                <button onClick={() => { setIsAddingMed(false); setEditingMed(null); }} className="p-2 hover:bg-slate-100 rounded-full"><X className="h-6 w-6" /></button>
              </div>
              
              <form onSubmit={isAddingMed ? handleAddMedicine : handleUpdateMedicine} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Medicine Name</label>
                    <input name="name" defaultValue={editingMed?.name} required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Description</label>
                    <textarea name="description" defaultValue={editingMed?.description} required rows={3} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all h-24" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Category</label>
                    <input name="category" defaultValue={editingMed?.category} required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Prescription Required</label>
                    <select name="requiresPrescription" defaultValue={editingMed?.requiresPrescription ? 'true' : 'false'} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all">
                      <option value="false">No (OTC)</option>
                      <option value="true">Yes (RX)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Price ($)</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingMed?.price} required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Initial Stock</label>
                    <input name="stock" type="number" defaultValue={editingMed?.stock} required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                  </div>
                </div>
                
                <button 
                  disabled={isSubmitting} 
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                  {isSubmitting ? 'Saving...' : (isAddingMed ? 'Add to Inventory' : 'Save Changes')}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
