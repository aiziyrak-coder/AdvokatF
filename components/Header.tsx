import React, { useState, useEffect } from 'react';
import { SettingsIcon, GlobeIcon, MoonIcon, SunIcon } from './icons';

interface HeaderProps {
    title: string;
    description: string;
    icon: React.ReactElement;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    language: string;
    setLanguage: (lang: string) => void;
    deviceId: string | null;
    t: (key: string) => string;
    hideControls?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
    title, 
    description, 
    icon, 
    theme, 
    toggleTheme, 
    language, 
    setLanguage, 
    deviceId, 
    t,
    hideControls = false
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat(language === 'uz-cyr' ? 'uz-Cyrl-UZ' : 'uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4 bg-[var(--bg-secondary)] p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border-color)] shadow-sm relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-gradient-to-bl from-[var(--accent-primary)]/5 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5 relative z-10 min-w-0 flex-1">
                <div className="p-3 sm:p-4 bg-[var(--bg-primary)] rounded-xl sm:rounded-2xl text-[var(--accent-primary)] shadow-inner border border-[var(--border-color)] flex-shrink-0">
                    {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" })}
                </div>
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight truncate">{title}</h1>
                    <p className="text-[var(--text-secondary)] mt-0.5 sm:mt-1 font-medium text-sm sm:text-base line-clamp-2 sm:line-clamp-none">{description}</p>
                    <div className="text-[10px] xs:text-xs text-[var(--text-secondary)]/70 mt-1 font-mono bg-[var(--bg-primary)]/50 px-2 py-0.5 rounded inline-block">
                        {formatDate(currentTime)}
                    </div>
                </div>
            </div>

            {!hideControls && (
                <div className="flex items-center gap-2 sm:gap-3 relative z-10 flex-shrink-0">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] text-xs font-mono text-[var(--text-secondary)]">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        ID: {deviceId || 'Unknown'}
                    </div>

                    <div className="h-6 sm:h-8 w-[1px] bg-[var(--border-color)] mx-1 sm:mx-2 hidden md:block"></div>

                    <button 
                        type="button"
                        onClick={() => setLanguage(language === 'uz-lat' ? 'uz-cyr' : 'uz-lat')}
                        className="min-h-touch min-w-[44px] flex items-center justify-center p-2.5 rounded-xl hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95 border border-transparent hover:border-[var(--border-color)]"
                        title={t('aria_lang_toggle')}
                        aria-label={t('aria_lang_toggle')}
                    >
                        <GlobeIcon className="w-5 h-5" />
                    </button>
                    
                    <button 
                        type="button"
                        onClick={toggleTheme}
                        className="min-h-touch min-w-[44px] flex items-center justify-center p-2.5 rounded-xl hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all active:scale-95 border border-transparent hover:border-[var(--border-color)]"
                        title={t('aria_theme_toggle')}
                        aria-label={t('aria_theme_toggle')}
                    >
                        {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                    </button>
                </div>
            )}
        </header>
    );
};
