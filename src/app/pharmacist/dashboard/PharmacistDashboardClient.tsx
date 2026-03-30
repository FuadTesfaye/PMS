'use client';

import { useState } from 'react';
import { Order } from '@/types';
import OrderBadge from '@/components/OrderBadge';
import { 
  ClipboardList, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Package, 
  Truck, 
  AlertCircle, 
  Eye, 
  ChevronRight,
  User as UserIcon,
  ShoppingBag
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { updateOrderAction } from '@/app/actions/orders';

interface PharmacistDashboardProps {
  initialOrders: Order[];
}

export default function PharmacistDashboardClient({ initialOrders }: PharmacistDashboardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'active'>('all');

  const filteredOrders = orders.filter(o => {
    if (activeFilter === 'pending') return o.status === 'pending' || o.status === 'reviewing';
    if (activeFilter === 'active') return o.status === 'approved' || o.status === 'ready';
    return true;
  });

  const handleStatusUpdate = async (orderId: string, status: any, note?: string) => {
    setIsSubmitting(true);
    const result = await updateOrderAction(orderId, status, note);
    if (result.success) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, rejectionNote: note, updatedAt: new Date().toISOString() } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status, rejectionNote: note } : null);
      }
      if (status === 'rejected') setRejectionNote('');
    } else {
      alert(result.error || 'Failed to update order');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-outfit text-3xl font-black text-slate-900">Pharmacist Portal</h1>
            <p className="text-slate-500 mt-1">Review prescriptions and manage order fulfillment</p>
          </div>
          
          <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start">
            <button 
              onClick={() => setActiveFilter('all')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                activeFilter === 'all' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              All Orders
            </button>
            <button 
              onClick={() => setActiveFilter('pending')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                activeFilter === 'pending' ? "bg-amber-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              Pending Review
            </button>
            <button 
              onClick={() => setActiveFilter('active')}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                activeFilter === 'active' ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              Fulfillment Queue
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order List */}
          <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-hide">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <motion.div 
                  layout
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={cn(
                    "relative flex flex-col p-4 rounded-2xl border transition-all cursor-pointer",
                    selectedOrder?.id === order.id 
                      ? "bg-white border-emerald-500 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500" 
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-slate-900 text-sm">#{order.id}</span>
                       <OrderBadge status={order.status} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-600 mb-4">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-semibold truncate">{order.userName}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                    <span className="text-xs text-slate-500">{order.items.length} items</span>
                    <span className="font-bold text-slate-900">{formatCurrency(order.totalPrice)}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
                 <ClipboardList className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                 <p className="text-sm font-bold text-slate-400">No matching orders</p>
              </div>
            )}
          </div>

          {/* Details View */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedOrder ? (
                <motion.div 
                  key={selectedOrder.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]"
                >
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Order Details</h2>
                      <p className="text-slate-500 text-sm font-medium">Customer: {selectedOrder.userName} • ID: {selectedOrder.id}</p>
                    </div>
                    <OrderBadge status={selectedOrder.status} className="px-4 py-2 scale-110" />
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Order Content */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ordered Medication</h4>
                        <div className="space-y-3">
                          {selectedOrder.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                                  <ShoppingBag className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                  <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <span className="font-bold text-sm text-slate-700">{formatCurrency(item.priceAtTime)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex justify-between items-center p-4 bg-slate-900 rounded-2xl text-white">
                          <span className="text-sm font-medium text-slate-400">Total Order Value</span>
                          <span className="text-2xl font-black">{formatCurrency(selectedOrder.totalPrice)}</span>
                        </div>
                      </div>

                      {/* Controls based on status */}
                      <div className="pt-6 border-t border-slate-100 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Management Controls</h4>
                        
                        {(selectedOrder.status === 'pending' || selectedOrder.status === 'reviewing') && (
                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => handleStatusUpdate(selectedOrder.id, 'approved')}
                              disabled={isSubmitting}
                              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                              Approve Order
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(selectedOrder.id, 'reviewing')}
                              disabled={isSubmitting || selectedOrder.status === 'reviewing'}
                              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                            >
                              <Eye className="h-5 w-5" />
                              Reviewing
                            </button>
                          </div>
                        )}

                        {selectedOrder.status === 'approved' && (
                          <button 
                            onClick={() => handleStatusUpdate(selectedOrder.id, 'ready')}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all"
                          >
                            <Package className="h-5 w-5" />
                            Mark as Ready for Pickup
                          </button>
                        )}

                        {selectedOrder.status === 'ready' && (
                          <button 
                            onClick={() => handleStatusUpdate(selectedOrder.id, 'completed')}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                            Finalize Fulfillment
                          </button>
                        )}

                        {(selectedOrder.status === 'pending' || selectedOrder.status === 'reviewing' || selectedOrder.status === 'approved') && (
                          <div className="space-y-3 mt-4">
                            <textarea 
                              placeholder="Reason for rejection (if applicable)..."
                              value={rejectionNote}
                              onChange={(e) => setRejectionNote(e.target.value)}
                              className="w-full p-4 rounded-2xl bg-rose-50/50 border border-rose-100 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-all h-24"
                            />
                            <button 
                              onClick={() => {
                                if (!rejectionNote) alert('Please provide a reason for rejection');
                                else handleStatusUpdate(selectedOrder.id, 'rejected', rejectionNote);
                              }}
                              disabled={isSubmitting || !rejectionNote}
                              className="w-full flex items-center justify-center gap-2 bg-white text-rose-600 border-2 border-rose-600 hover:bg-rose-50 font-bold py-4 rounded-2xl transition-all disabled:opacity-50"
                            >
                              <XCircle className="h-5 w-5" />
                              Reject Order
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Prescription Review */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Prescription Verification</h4>
                      {selectedOrder.prescriptionImage ? (
                        <div className="group relative rounded-3xl border border-slate-200 overflow-hidden shadow-2xl">
                          <img 
                            src={selectedOrder.prescriptionImage} 
                            alt="Prescription" 
                            className="w-full h-auto object-contain bg-slate-100 min-h-[300px]"
                          />
                          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-900/80 to-transparent">
                             <div className="flex items-center gap-2 text-white">
                                <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                   <Eye className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold">Zoom available in viewer</span>
                             </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 text-slate-400">
                          <AlertCircle className="h-10 w-10 mb-2" />
                          <p className="text-sm font-bold">No prescription attached</p>
                          <p className="text-xs">This order may only contain OTC drugs</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 border-dashed flex flex-col items-center justify-center min-h-[600px] text-center p-12">
                   <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                      <ClipboardList className="h-10 w-10 text-slate-300" />
                   </div>
                   <h2 className="text-2xl font-black text-slate-900 mb-2">Select an order to review</h2>
                   <p className="text-slate-500 max-w-sm">Pick an order from the list on the left to review medications, prescriptions, and manage fulfillment.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
