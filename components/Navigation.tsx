import React from 'react';
import type { View } from '../types';
import { AnalysisIcon, LogoutIcon, DashboardIcon, SettingsIcon, ResearchIcon } from './icons';
import { ViewControls } from './ViewControls';

interface NavigationProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  deviceId: string | null;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactElement<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 min-h-touch rounded-full transition-all duration-300 group active:scale-95 ${
        isActive 
          ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 shadow-sm shadow-[var(--accent-primary)]/20' 
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
      }`}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className={`transition-transform duration-300 flex-shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {React.cloneElement(icon, { className: "h-5 w-5" })}
      </div>
      <span className="text-sm font-semibold hidden md:block whitespace-nowrap">{label}</span>
      {isActive && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]"></div>
      )}
    </button>
  );
};

export const Navigation: React.FC<NavigationProps> = ({ 
    activeView, setActiveView, onLogout, t, 
    theme, toggleTheme, language, setLanguage, deviceId 
}) => {
  const mainViews = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: <DashboardIcon /> },
    { id: 'analyze', label: t('nav_analyze'), icon: <AnalysisIcon /> },
    { id: 'research', label: t('nav_research'), icon: <ResearchIcon /> },
    { id: 'settings', label: t('nav_settings'), icon: <SettingsIcon /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)] px-2 xs:px-3 sm:px-4 pt-safe-top min-h-14 sm:min-h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-8 min-w-0">
        {/* Brand */}
        <button type="button" onClick={() => setActiveView('dashboard')} className="flex items-center gap-2 sm:gap-3 group cursor-pointer min-h-touch flex-shrink-0 rounded-xl active:scale-95 transition-transform">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center font-bold text-black text-base sm:text-lg shadow-lg shadow-[var(--glow-color-primary)] transition-transform group-hover:scale-110 group-hover:rotate-3 flex-shrink-0">A</div>
            <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight hidden xs:block truncate bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">Adolat AI</span>
        </button>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1">
            {mainViews.map(item => (
                <NavItem
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    isActive={activeView === item.id}
                    onClick={() => setActiveView(item.id as View)}
                />
            ))}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
        {/* Mobile menu (only icons) */}
        <div className="flex lg:hidden items-center gap-0.5">
            {mainViews.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as View)}
                    className={`min-h-touch min-w-[44px] flex items-center justify-center rounded-xl transition-colors active:scale-95 ${activeView === item.id ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
                    aria-label={item.label}
                >
                    {React.cloneElement(item.icon, { className: "h-5 w-5 sm:h-6 sm:w-6" })}
                </button>
            ))}
        </div>

        <div className="h-5 sm:h-6 w-px bg-[var(--border-color)] mx-0.5 sm:mx-1 hidden sm:block flex-shrink-0"></div>

        <ViewControls
            theme={theme}
            toggleTheme={toggleTheme}
            language={language}
            setLanguage={setLanguage}
            t={t}
        />

        <button 
            type="button"
            onClick={onLogout}
            className="min-h-touch min-w-[44px] flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 active:scale-95 transition-all p-2"
            title={t('nav_logout')}
            aria-label={t('nav_logout')}
        >
            <LogoutIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
    </nav>
  );
};
