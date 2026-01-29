import React from 'react';
import type { View, Case } from '../types';
import { DatabaseIcon, CheckBadgeIcon, DocumentTextIcon, DebateIcon, TheaterIcon, StrategyIcon, PencilSquareIcon } from './icons';

interface CaseNavigationProps {
    activeView: View;
    setActiveView: (view: View) => void;
    caseData: Case;
    t: (key: string) => string;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactElement;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 min-h-touch rounded-t-lg border-b-2 transition-all duration-300 text-xs sm:text-sm font-semibold whitespace-nowrap active:scale-[0.98] ${
            isActive
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--bg-secondary)]'
                : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-pane)] hover:text-[var(--text-primary)]'
        }`}
        aria-current={isActive ? 'page' : undefined}
        aria-label={label}
    >
        {React.cloneElement(icon, { className: "h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" })}
        <span className="truncate max-w-[80px] xs:max-w-[100px] sm:max-w-none">{label}</span>
    </button>
);


export const CaseNavigation: React.FC<CaseNavigationProps> = ({ activeView, setActiveView, caseData, t }) => {
    // Removed Timeline, Billing, and Investigation specific logic
    const views = [
        { id: 'knowledge_base', label: t('nav_knowledge_base'), icon: <DatabaseIcon /> },
        { id: 'evidence', label: t('nav_evidence'), icon: <CheckBadgeIcon /> }, // Reusing icon for simplicity
        { id: 'tasks', label: t('nav_tasks'), icon: <CheckBadgeIcon /> },
        { id: 'documents', label: t('nav_documents'), icon: <DocumentTextIcon /> },
        { id: 'notes', label: t('nav_notes'), icon: <PencilSquareIcon /> },
        { id: 'debate', label: t('nav_debate'), icon: <DebateIcon /> },
        { id: 'simulation', label: t('nav_simulation'), icon: <TheaterIcon /> },
        { id: 'summary', label: t('nav_summary'), icon: <StrategyIcon /> },
    ];

    return (
        <div className="mt-4 sm:mt-6 md:mt-8 border-b border-[var(--border-color)] -mx-2 xs:-mx-3 sm:mx-0">
            <nav className="flex items-stretch overflow-x-auto scroll-touch scrollbar-hide -mb-px gap-0 sm:flex-wrap sm:justify-center sm:gap-0 px-2 xs:px-3 sm:px-0" aria-label="Case tabs">
                {views.map((view) => (
                    <NavItem
                        key={view.id}
                        label={view.label}
                        icon={view.icon}
                        isActive={activeView === view.id}
                        onClick={() => setActiveView(view.id as View)}
                    />
                ))}
            </nav>
        </div>
    );
};