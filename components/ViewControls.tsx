import React, { useState, useRef, useEffect } from 'react';
import { SunIcon, MoonIcon, ChevronDownIcon } from './icons';

interface ViewControlsProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string, replacements?: { [key: string]: string }) => string;
}

const LANGUAGES = [
    { code: 'uz-lat', name: 'O‘zbek' },
    { code: 'uz-cyr', name: 'Ўзбек' },
    { code: 'kaa', name: 'Qaraqalpaq' },
    { code: 'ru', name: 'Русский' },
    { code: 'en', name: 'English' },
];

export const ViewControls: React.FC<ViewControlsProps> = ({ theme, toggleTheme, language, setLanguage }) => {
    const [isLangOpen, setIsLangOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLangSelect = (langCode: string) => {
        setLanguage(langCode);
        setIsLangOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const currentLangName = LANGUAGES.find(l => l.code === language)?.name.substring(0, 2).toUpperCase() || 'EN';

    return (
        <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Language Switcher */}
            <div className="lang-switcher relative" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className="min-h-touch min-w-[44px] flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-2 sm:px-3 py-2 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-transform active:scale-95 hover:scale-105"
                    aria-expanded={isLangOpen}
                    aria-haspopup="listbox"
                    aria-label={currentLangName}
                >
                    <span>{currentLangName}</span>
                    <ChevronDownIcon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 flex-shrink-0 ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLangOpen && (
                    <div className="lang-switcher-dropdown polished-pane p-2 animate-assemble-in absolute right-0 mt-2 w-32 shadow-xl rounded-xl border border-[var(--border-color)] z-50" role="listbox">
                        <div className="space-y-0.5 sm:space-y-1">
                            {LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => handleLangSelect(lang.code)}
                                    className={`w-full text-left px-3 py-2 sm:py-1.5 rounded-lg text-sm min-h-touch transition-all active:scale-[0.98] ${language === lang.code ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'}`}
                                    role="option"
                                    aria-selected={language === lang.code}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Theme Switcher */}
            <button type="button" onClick={toggleTheme} className="theme-switch flex-shrink-0 min-h-touch min-w-[44px] flex items-center justify-center" aria-label="Toggle theme">
                <div className="theme-switch-handle">
                    <SunIcon className="sun-icon h-3.5 w-3.5 sm:h-4 sm:w-4 text-black" />
                    <MoonIcon className="moon-icon h-3.5 w-3.5 sm:h-4 sm:w-4 text-black" />
                </div>
            </button>
        </div>
    );
};