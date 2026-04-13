'use client';

import { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Package, 
  Eye 
} from 'lucide-react';

interface OrderBadgeProps {
  status: OrderStatus;
  className?: string;
}

export default function OrderBadge({ status, className }: OrderBadgeProps) {
  const config = {
    pending: {
      label: 'Pending Review',
      icon: Clock,
      colors: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    },
    reviewing: {
      label: 'Pharmacist Reviewing',
      icon: Eye,
      colors: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    },
    approved: {
      label: 'Approved',
      icon: CheckCircle2,
      colors: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      colors: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    },
    ready: {
      label: 'Ready for Pickup',
      icon: Package,
      colors: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle2,
      colors: 'bg-slate-50 text-slate-700 ring-slate-600/20',
    },
  };

  const { label, icon: Icon, colors } = config[status];

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-bold ring-1 ring-inset shadow-sm transition-all",
      colors,
      className
    )}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
