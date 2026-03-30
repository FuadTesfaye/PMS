'use client';

import { logout } from '@/app/actions/auth';
import { Pill, LogOut, Bell, User, Search, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavbarProps {
  userName: string;
  role: string;
  toggleSidebar?: () => void;
}

export default function Navbar({ userName, role, toggleSidebar }: NavbarProps) {
  return (
    <nav className="fixed top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <Pill className="h-8 w-8 text-emerald-600" />
              <span className="font-outfit text-xl font-bold text-slate-900 hidden sm:block">PharmaCare</span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full rounded-full border-0 bg-slate-100 py-1.5 pl-10 text-slate-900 ring-0 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/20 sm:text-sm transition-all"
                placeholder="Search medicines, orders..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none">{userName}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter mt-1 leading-none">{role}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
                {userName.charAt(0)}
              </div>
              <button 
                onClick={() => logout()}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all active:scale-90"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
