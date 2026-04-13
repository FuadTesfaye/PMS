'use client';

import { Medicine } from '@/types';
import { ShoppingCart, AlertCircle, Plus } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import Image from "next/image";

interface MedicineCardProps {
  medicine: Medicine;
  onAddToCart: (med: Medicine) => void;
  isInCart?: boolean;
}

export default function MedicineCard({ medicine, onAddToCart, isInCart }: MedicineCardProps) {
  const isOutOfStock = medicine.stock <= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Image
          src={medicine.image || ""}
          alt={medicine.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {medicine.requiresPrescription && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700 shadow-sm ring-1 ring-amber-700/10">
            <AlertCircle className="h-3 w-3" />
            RX REQUIRED
          </div>
        )}
        <div className="absolute bottom-2 left-2 rounded-lg bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 uppercase tracking-tighter">
          {medicine.category}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between">
          <h3 className="font-outfit text-lg font-bold text-slate-900 line-clamp-1">{medicine.name}</h3>
          <span className="font-outfit text-lg font-bold text-emerald-600">
            {formatCurrency(medicine.price)}
          </span>
        </div>
        
        <p className="mt-2 text-sm text-slate-500 line-clamp-2 min-h-[40px]">
          {medicine.description}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex flex-col">
            <span className={cn(
              "text-xs font-semibold",
              isOutOfStock ? "text-red-500" : "text-slate-500"
            )}>
              {isOutOfStock ? 'OUT OF STOCK' : `${medicine.stock} units left`}
            </span>
            <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-slate-100">
              <div 
                className={cn("h-full transition-all duration-500", medicine.stock < 20 ? "bg-amber-500" : "bg-emerald-500")}
                style={{ width: `${Math.min(100, (medicine.stock / 150) * 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => onAddToCart(medicine)}
            disabled={isOutOfStock}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-90 disabled:opacity-50",
              isInCart 
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30" 
                : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 ring-1 ring-inset ring-slate-200 hover:ring-emerald-200"
            )}
          >
            {isInCart ? (
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                <Plus className="h-5 w-5" />
              </motion.div>
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
