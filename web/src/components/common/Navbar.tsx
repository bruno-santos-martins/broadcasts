import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ChatBubbleOutlined as ChatIcon,
  PeopleOutlined as PeopleIcon,
  SendOutlined as BroadcastIcon,
  LogoutOutlined as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Conexões', path: '/connections', icon: <ChatIcon sx={{ fontSize: 20 }} /> },
    { label: 'Contatos', path: '/contacts', icon: <PeopleIcon sx={{ fontSize: 20 }} /> },
    { label: 'Disparos (Broadcast)', path: '/broadcast', icon: <BroadcastIcon sx={{ fontSize: 20 }} /> },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="flex h-16 w-full items-center justify-between border-b border-unni-divider bg-unni-sidebar px-4 md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-unni-accent">
            Unni<span className="text-white">Black</span>
          </span>
          <span className="text-[11px] text-unni-muted">| ∞ Mots Business Partners</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-unni-muted hover:bg-unni-card hover:text-white"
          aria-label="Abrir menu"
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col justify-between border-r border-unni-divider bg-unni-sidebar transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col p-6">
          {/* Logo & Subtitle matching the screenshot */}
          <div className="mb-10 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-unni-accent">
                Unni<span className="text-white">Black</span>
              </span>
              <span className="text-[11px] font-normal text-unni-muted">| ∞ Mots Business Partners</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/[0.05] text-white shadow-sm'
                      : 'text-unni-muted hover:bg-white/[0.03] hover:text-slate-200'
                  }`
                }
              >
                <span className="flex items-center opacity-90">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="border-t border-unni-divider p-4">
          <div className="flex items-center justify-between rounded-xl bg-unni-card/60 p-3 border border-unni-border/50">
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-slate-100">
                {user?.name || 'Administrador'}
              </span>
              <span className="truncate text-xs text-unni-muted">
                {user?.email || 'admin@unnichat.com'}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              title="Encerrar Sessão"
              className="ml-2 rounded-lg p-1.5 text-unni-muted transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LogoutIcon fontSize="small" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
};
