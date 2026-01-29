import React, { useState } from 'react';
import type { Case, View } from '../types';
// FIX: Added missing SettingsIcon import to resolve "Cannot find name 'SettingsIcon'" error
import { AnalysisIcon, FolderIcon, CheckBadgeIcon, DocumentTextIcon, SparklesIcon, PlusIcon, TrashIcon, SettingsIcon } from './icons';
import { ConfirmationModal } from './ConfirmationModal';

const getLocaleForLanguage = (language: string) => {
    switch (language) {
        case 'uz-lat': return 'uz-UZ';
        case 'uz-cyr': return 'uz-Cyrl-UZ';
        case 'kaa': return 'uz-UZ';
        case 'ru': return 'ru-RU';
        case 'en': return 'en-US';
        default: return 'en-US';
    }
}

const formatDate = (dateString: string, language: string) => {
    const date = new Date(dateString);
    const locale = getLocaleForLanguage(language);
    return date.toLocaleString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

interface DashboardViewProps {
    onStartAnalysis: () => void;
    cases: Case[];
    onNavigate: (view: View) => void;
    onSelectCase: (caseItem: Case) => void;
    onDeleteCase: (id: string) => void;
    t: (key: string, replacements?: { [key: string]: string }) => string;
    language: string;
}

const StatCard: React.FC<{ icon: React.ReactNode, value: number | string, label: string, color: string }> = ({ icon, value, label, color }) => (
    <div className="polished-pane p-4 sm:p-5 flex items-center gap-3 sm:gap-4 group hover:border-[var(--accent-primary)] transition-all">
        <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${color} bg-opacity-10 text-opacity-100 flex-shrink-0 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">{value}</p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium truncate">{label}</p>
        </div>
    </div>
);

const ActionCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, onClick: () => void, primary?: boolean }> = ({ icon, title, desc, onClick, primary }) => (
    <button 
        type="button"
        onClick={onClick}
        className={`w-full text-left p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border transition-all group relative overflow-hidden min-h-touch active:scale-[0.99] ${
            primary 
                ? 'bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] border-transparent text-black shadow-xl shadow-[var(--glow-color-primary)]' 
                : 'polished-pane hover:border-[var(--accent-primary)]'
        }`}
    >
        {primary && <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-20"><SparklesIcon className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20" /></div>}
        <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl inline-block mb-3 sm:mb-4 transition-transform group-hover:scale-110 flex-shrink-0 ${primary ? 'bg-black/10' : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'}`}>
            {icon}
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1">{title}</h3>
        <p className={`text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-none ${primary ? 'text-black/70' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>{desc}</p>
    </button>
);

export const DashboardView: React.FC<DashboardViewProps> = ({ onStartAnalysis, cases, onNavigate, onSelectCase, onDeleteCase, t, language }) => {
    const [caseToDelete, setCaseToDelete] = useState<string | null>(null);
    const totalCases = cases.length;
    const sortedCases = [...cases].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentCases = sortedCases.slice(0, 8); // Increased slice to fill wider space
    
    const activeTasksCount = cases.reduce((acc, c) => acc + (c.tasks?.filter(t => !t.completed).length || 0), 0);

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setCaseToDelete(id);
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-assemble-in w-full max-w-full">
            {caseToDelete && (
                <ConfirmationModal 
                    title={t('history_delete_modal_title')}
                    message={t('history_delete_modal_message')}
                    onConfirm={() => { onDeleteCase(caseToDelete); setCaseToDelete(null); }}
                    onCancel={() => setCaseToDelete(null)}
                    t={t}
                />
            )}
            {/* Welcome & Stats Row */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
                <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                        {t('auth_welcome_title')}, <span className="animated-gradient-text">Advokat</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] text-sm sm:text-base md:text-lg max-w-xl">
                        {t('dashboard_subtitle')}
                    </p>
                </div>
                <button 
                    type="button"
                    onClick={onStartAnalysis}
                    className="flex items-center justify-center gap-2 bg-[var(--accent-primary)] text-black font-bold py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg shadow-[var(--glow-color-primary)] transition-all hover:scale-105 active:scale-95 min-h-touch w-full sm:w-auto flex-shrink-0"
                >
                    <PlusIcon className="h-5 w-5 flex-shrink-0" />
                    <span>{t('dashboard_action_new_analysis_title')}</span>
                </button>
            </header>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                <StatCard 
                    icon={<FolderIcon className="h-6 w-6" />} 
                    value={totalCases} 
                    label={t('dashboard_action_all_cases_title')} 
                    color="text-blue-400 bg-blue-400" 
                />
                <StatCard 
                    icon={<CheckBadgeIcon className="h-6 w-6" />} 
                    value={activeTasksCount} 
                    label={t('tasks_pending_title')} 
                    color="text-yellow-400 bg-yellow-400" 
                />
                <StatCard 
                    icon={<DocumentTextIcon className="h-6 w-6" />} 
                    value={totalCases > 0 ? "98%" : "0%"} 
                    label="AI Samaradorlik" 
                    color="text-emerald-400 bg-emerald-400" 
                />
            </div>

            {/* Main Action Hub & Recent Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                {/* Left: Actions */}
                <div className="lg:col-span-3 space-y-4 sm:space-y-6 order-2 lg:order-1">
                    <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] px-0 sm:px-2">{t('dashboard_quick_actions')}</h2>
                    <div className="space-y-3 sm:space-y-4">
                        <ActionCard 
                            icon={<AnalysisIcon className="h-6 w-6" />}
                            title={t('dashboard_action_new_analysis_title')}
                            desc={t('dashboard_action_new_analysis_desc')}
                            onClick={onStartAnalysis}
                        />
                        <ActionCard 
                            icon={<SettingsIcon className="h-6 w-6" />}
                            title={t('nav_settings')}
                            desc={t('dashboard_settings_short_desc')}
                            onClick={() => onNavigate('settings')}
                        />
                    </div>
                </div>

                {/* Right: Recent Cases */}
                <div className="lg:col-span-9 space-y-4 sm:space-y-6 order-1 lg:order-2">
                    <div className="flex items-center justify-between px-0 sm:px-2">
                        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">{t('dashboard_my_cases')}</h2>
                    </div>

                    {recentCases.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                            {recentCases.map(c => (
                                <div 
                                    key={c.id} 
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onSelectCase(c)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectCase(c); } }}
                                    className="polished-pane p-4 sm:p-5 group cursor-pointer hover:border-[var(--accent-primary)] active:scale-[0.99] transition-all relative"
                                >
                                    <button 
                                        type="button"
                                        onClick={(e) => handleDeleteClick(e, c.id)}
                                        className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 min-h-touch min-w-[44px] flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                                        aria-label={t('history_delete_modal_title')}
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2 bg-[var(--bg-secondary)] rounded-lg text-[var(--accent-primary)] group-hover:scale-110 transition-transform">
                                            <FolderIcon className="h-6 w-6" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold bg-[var(--bg-secondary)] px-2 py-1 rounded">
                                            {c.courtStage.split(' ')[0]}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-base sm:text-lg text-[var(--text-primary)] truncate group-hover:text-[var(--accent-primary)] transition-colors mb-1 pr-10 sm:pr-6">
                                        {c.title}
                                    </h3>
                                    <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--border-color)]">
                                        <div className="flex gap-1">
                                            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            </div>
                                            <span className="text-[10px] text-[var(--text-secondary)] font-medium">{t('folder_faol')}</span>
                                        </div>
                                        <p className="text-[10px] text-[var(--text-secondary)]">{formatDate(c.timestamp, language)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="polished-pane rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center flex flex-col items-center bg-[var(--bg-secondary)]/30 border-dashed border-2">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4 sm:mb-6">
                                <PlusIcon className="h-8 w-8 sm:h-10 sm:w-10 text-[var(--text-secondary)]" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{t('dashboard_no_cases')}</h3>
                            <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-6 sm:mb-8 mx-auto max-w-sm">
                                {t('dashboard_no_cases_message')}
                            </p>
                            <button type="button" onClick={onStartAnalysis} className="bg-[var(--accent-primary)] text-black font-bold py-3 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all hover:scale-105 active:scale-95 min-h-touch">
                                {t('button_start_new_analysis')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
