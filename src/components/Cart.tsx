'use client';

import { useState } from 'react';
import { Medicine, OrderItem } from '@/types';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import PrescriptionUpload from './PrescriptionUpload';
import { placeOrder } from '@/app/actions/orders';
import { useRouter } from 'next/navigation';

interface CartProps {
  items: (Medicine & { quantity: number })[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function Cart({ items, onUpdateQuantity, onRemove, onClear, onClose }: CartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [prescription, setPrescription] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const requiresPrescription = items.some(item => item.requiresPrescription);

  const handleCheckout = async () => {
    if (requiresPrescription && !prescription) {
      alert('This order contains prescription-only medicines. Please upload a medical prescription.');
      return;
    }

    setIsSubmitting(true);
    const orderItems: OrderItem[] = items.map(item => ({
      medicineId: item.id,
      name: item.name,
      quantity: item.quantity,
      priceAtTime: item.price,
    }));

    const result = await placeOrder(orderItems, total, prescription || undefined);

    if (result.success) {
      alert('Order placed successfully!');
      onClear();
      onClose();
      router.push('/pharmacy/dashboard?tab=orders');
    } else {
      alert(result.error || 'Failed to place order');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="relative">
            <ShoppingBag className="h-6 w-6 text-emerald-600" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-sm">
              {items.length}
            </span>
          </div>
          <h2 className="font-outfit text-xl font-bold text-slate-900">Your Cart</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Cart Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="rounded-full bg-slate-50 p-6">
              <ShoppingBag className="h-12 w-12 text-slate-300" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Your cart is empty</p>
              <p className="text-sm text-slate-500">Add medicines to start ordering</p>
            </div>
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-full border-2 border-emerald-600 text-emerald-600 font-bold hover:bg-emerald-50 transition-all active:scale-95 text-sm"
            >
              Browse Medicines
            </button>
          </div>
        ) : !isCheckingOut ? (
          <div className="space-y-4">
            {items.map((item) => (
              <motion.div 
                layout
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all"
              >
                <div className="h-20 w-20 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate text-sm">{item.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{item.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-600 text-sm">
                      {formatCurrency(item.price)}
                    </span>
                    <div className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 px-2 py-1 shadow-sm">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-2">Order Summary</h4>
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Grand Total</span>
                <span className="text-emerald-600">{formatCurrency(total)}</span>
              </div>
            </div>

            {requiresPrescription && (
              <PrescriptionUpload 
                required 
                onUpload={(base64) => setPrescription(base64)} 
              />
            )}

            {!requiresPrescription && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 flex gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-900">Secure Order</p>
                  <p className="text-xs text-emerald-700/80">This order does not require a prescription. You can proceed directly to checkout.</p>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setIsCheckingOut(false)}
              className="w-full text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Back to cart
            </button>
          </motion.div>
        )}
      </div>

      {/* Footer / Action */}
      {items.length > 0 && (
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          {!isCheckingOut ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500">Subtotal</span>
                <span className="text-xl font-black text-slate-900">{formatCurrency(total)}</span>
              </div>
              <button 
                onClick={() => setIsCheckingOut(true)}
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98]"
              >
                Checkout Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </>
          ) : (
            <button 
              onClick={handleCheckout}
              disabled={isSubmitting || (requiresPrescription && !prescription)}
              className="w-full rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Order'}
            </button>
          )}
          <p className="mt-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {isCheckingOut ? 'Payments available on delivery' : 'Secure Transaction'}
          </p>
        </div>
      )}
    </div>
  );
}
