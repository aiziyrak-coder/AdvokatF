import React from 'react';
import { CalendarIcon } from './icons';

interface CalendarViewProps {
    t: (key: string) => string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ t }) => {
    // This is a placeholder component for a future calendar implementation.
    return (
        <div className="mt-10 text-center flex flex-col items-center justify-center p-8 polished-pane animate-assemble-in">
            <div className="text-[var(--accent-primary)] mb-4 p-4 bg-[var(--bg-secondary)]/50 rounded-full border border-[var(--border-color)]">
                <CalendarIcon className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold text-slate-200">{t('calendar_title')}</h3>
            <p className="text-[var(--text-secondary)] mt-2 max-w-sm">{t('feature_coming_soon_long')}</p>
        </div>
    );
};