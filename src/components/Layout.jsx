import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Search, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/users', label: 'Users', icon: Users },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      <div className="text-xl font-black uppercase tracking-tight mb-8">
        SHOP.CO <span className="text-indigo-600">Admin</span>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileNavOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium transition ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 pt-4 space-y-3">
        <div>
          <p className="text-sm font-bold truncate">{user?.name}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex-col p-6 hidden md:flex">
        {sidebarContent}
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white p-6 flex flex-col shadow-xl">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="self-end mb-4 text-slate-400 hover:text-slate-600"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-4 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden text-slate-600 hover:text-slate-900 shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-full max-w-xs">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
