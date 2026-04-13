'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Pill, 
  ShoppingCart, 
  History, 
  FileText, 
  Package, 
  Users, 
  BarChart3,
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

interface SidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

const customerLinks = [
  { href: '/customer/dashboard', label: 'Shop Medicines', icon: Pill },
  { href: '/customer/dashboard?tab=orders', label: 'My Orders', icon: History },
];

const pharmacistLinks = [
  { href: '/pharmacist/dashboard', label: 'Review Queue', icon: FileText },
];

const adminLinks = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
];

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const links = role === 'admin' ? adminLinks : role === 'pharmacist' ? pharmacistLinks : customerLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden" 
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-slate-200 pt-16 transition-transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full overflow-y-auto px-4 py-8">
          <div className="lg:hidden flex items-center justify-between mb-8">
            <span className="font-outfit font-bold text-slate-900">Menu</span>
            <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
                    isActive 
                      ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-700/5 ring-1 ring-emerald-700/10" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  onClick={onClose}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-emerald-700" : "text-slate-400")} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto pt-8 border-t border-slate-100">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <Settings className="h-5 w-5 text-slate-400" />
              Settings
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
