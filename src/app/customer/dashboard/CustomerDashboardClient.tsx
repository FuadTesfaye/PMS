'use client';

import { useState, useMemo } from 'react';
import { Medicine, Order } from '@/types';
import MedicineCard from '@/components/MedicineCard';
import Cart from '@/components/Cart';
import OrderBadge from '@/components/OrderBadge';
import { ShoppingBag, Search, Filter, Clock, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

interface CustomerDashboardProps {
  initialMedicines: Medicine[];
  initialOrders: Order[];
}

export default function CustomerDashboardClient({ initialMedicines, initialOrders }: CustomerDashboardProps) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'orders' ? 'orders' : 'browse';
  
  const [activeTab, setActiveTab] = useState<'browse' | 'orders'>(initialTab);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<(Medicine & { quantity: number })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(initialMedicines.map(m => m.category)))];
  }, [initialMedicines]);

  const filteredMedicines = initialMedicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine: Medicine) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) {
        return prev.map(item => 
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: Math.min(newQty, item.stock) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-outfit text-3xl font-black text-slate-900">Patient Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your health and medications</p>
          </div>
          
          <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start">
            <button 
              onClick={() => setActiveTab('browse')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'browse' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              Browse Shop
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'orders' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              My Orders
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'browse' ? (
            <motion.div 
              key="browse"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Filters */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search by medicine name or condition..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                  <Filter className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                        selectedCategory === cat 
                          ? "bg-slate-900 text-white border-slate-900" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              {filteredMedicines.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMedicines.map(med => (
                    <MedicineCard 
                      key={med.id} 
                      medicine={med} 
                      onAddToCart={addToCart}
                      isInCart={cartItems.some(i => i.id === med.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
                    <Search className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-900">No medicines found</h3>
                  <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search terms</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {initialOrders.length > 0 ? (
                <div className="grid gap-4">
                  {initialOrders.map(order => (
                    <div 
                      key={order.id}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100",
                            order.status === 'completed' ? "bg-slate-50" : "bg-emerald-50 text-emerald-600"
                          )}>
                            {order.status === 'ready' ? <Package className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900 uppercase">Order #{order.id}</h3>
                              <OrderBadge status={order.status} />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                            
                            <div className="mt-4 flex flex-wrap gap-2">
                              {order.items.map((item, idx) => (
                                <span key={idx} className="bg-slate-100 px-2 py-1 rounded text-[10px] font-medium text-slate-700">
                                  {item.name} (x{item.quantity})
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                          <span className="font-black text-2xl text-slate-900">{formatCurrency(order.totalPrice)}</span>
                          {order.rejectionNote && (
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-full">
                              <AlertCircle className="h-3 w-3" />
                              REJECTION NOTE: {order.rejectionNote}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar (simplified) */}
                      <div className="mt-6 pt-6 border-t border-slate-50">
                        <div className="relative flex justify-between items-center w-full">
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
                          {['pending', 'approved', 'ready', 'completed'].map((step, idx) => {
                            const statuses = ['pending', 'reviewing', 'approved', 'rejected', 'ready', 'completed'];
                            const currentIdx = statuses.indexOf(order.status);
                            const stepIdx = statuses.indexOf(step as any);
                            const isPast = currentIdx >= stepIdx && order.status !== 'rejected';
                            const isCurrent = order.status === step;

                            return (
                              <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                                <div className={cn(
                                  "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all",
                                  isPast ? "bg-emerald-600 border-emerald-600 text-white" : 
                                  isCurrent ? "border-emerald-600 text-emerald-600" : "bg-white border-slate-200 text-slate-300"
                                )}>
                                  {isPast ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                </div>
                                <span className={cn(
                                  "text-[10px] font-bold uppercase tracking-tighter",
                                  isPast ? "text-slate-900" : "text-slate-400"
                                )}>{step}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
                    <Clock className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-900">No orders yet</h3>
                  <p className="text-slate-500 text-sm mt-1">Start by browsing medications and placing your first order</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Cart Button */}
        {cartItems.length > 0 && (
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-8 right-8 z-30 flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl shadow-slate-900/40"
          >
            <div className="relative">
              <ShoppingBag className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold">
                {cartItems.length}
              </span>
            </div>
            <span className="font-bold text-sm">View Cart • {formatCurrency(cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0))}</span>
          </motion.button>
        )}

        {/* Side Cart Overlay */}
        <AnimatePresence>
          {cartOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCartOpen(false)}
                className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 z-50 h-full w-full max-w-md"
              >
                <Cart 
                  items={cartItems} 
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                  onClear={clearCart}
                  onClose={() => setCartOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
