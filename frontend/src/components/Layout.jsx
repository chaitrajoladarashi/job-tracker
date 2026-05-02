import React, { useState, useContext } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Trash2, Sparkles, Bell, LogOut, User, Menu, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard',    path: '/dashboard',    icon: LayoutDashboard },
    { name: 'Applications', path: '/applications', icon: Briefcase },
    { name: 'Reminders',    path: '/reminders',    icon: Bell },
    { name: 'Trash Box',    path: '/trash',         icon: Trash2 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Sidebar (desktop only) ── */}
      <aside className="w-60 flex-shrink-0 flex-col hidden md:flex border-r border-border"
        style={{ background: 'color-mix(in srgb, var(--secondary) 80%, transparent)', backdropFilter: 'blur(24px)' }}>

        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-border">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mr-2.5"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">JobTracker</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map(({ name, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <NavLink
                key={name}
                to={path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
                style={active ? { background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: '0 4px 14px rgba(200,155,109,0.35)' } : {}}
              >
                <Icon size={17} />
                {name}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col md:hidden transition-transform duration-300 ease-in-out border-r border-border ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'color-mix(in srgb, var(--secondary) 95%, transparent)', backdropFilter: 'blur(24px)' }}
      >
        {/* Drawer header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">JobTracker</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map(({ name, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <NavLink
                key={name}
                to={path}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
                style={active ? { background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: '0 4px 14px rgba(200,155,109,0.35)' } : {}}
              >
                <Icon size={18} />
                {name}
              </NavLink>
            );
          })}
        </nav>

        {/* Drawer User + Logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary font-bold text-base">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); setDrawerOpen(false); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors text-sm font-medium border border-red-500/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-border md:hidden flex-shrink-0"
          style={{ background: 'color-mix(in srgb, var(--secondary) 80%, transparent)', backdropFilter: 'blur(16px)' }}>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">JobTracker</span>
          </div>
          {/* Spacer to keep logo centered */}
          <div className="w-9" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {/* Background orbs */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.06]"
              style={{ background: 'radial-gradient(circle, var(--primary), transparent)' }} />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.05]"
              style={{ background: 'radial-gradient(circle, var(--secondary), transparent)' }} />
          </div>
          <div className="relative" style={{ zIndex: 1 }}>
            <Outlet />
          </div>
        </main>

        {/* ── Mobile Bottom Nav ── */}
        <nav className="md:hidden flex-shrink-0 border-t border-border flex items-center justify-around"
          style={{ background: 'color-mix(in srgb, var(--secondary) 90%, transparent)', backdropFilter: 'blur(20px)', paddingBottom: 'env(safe-area-inset-bottom)', minHeight: '60px' }}>
          {navItems.map(({ name, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <NavLink
                key={name}
                to={path}
                className="flex flex-col items-center gap-0.5 px-3 py-2 flex-1 transition-all duration-200"
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-primary/20' : ''}`}>
                  <Icon
                    size={20}
                    style={{ color: active ? 'var(--primary)' : 'rgba(246,242,234,0.4)' }}
                  />
                </div>
                <span
                  className="text-[10px] font-semibold tracking-tight"
                  style={{ color: active ? 'var(--primary)' : 'rgba(246,242,234,0.4)' }}
                >
                  {name === 'Applications' ? 'Apps' : name === 'Trash Box' ? 'Trash' : name}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
