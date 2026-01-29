import React from 'react';

interface EmptyStateProps {
    icon: React.ReactElement<{ className?: string }>;
    title: string; // Now receives the translated title directly
    message: string; // Now receives the translated message directly
    children?: React.ReactNode;
    t: (key: string, replacements?: { [key: string]: string }) => string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, children, t }) => {
    return (
        <div className="mt-6 sm:mt-10 text-center flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 polished-pane rounded-2xl sm:rounded-3xl">
            <div className="text-[var(--accent-primary)] mb-3 sm:mb-4 p-3 sm:p-4 bg-[var(--bg-secondary)]/50 rounded-full border border-[var(--border-color)] flex-shrink-0">
                {React.cloneElement(icon, { className: "h-8 w-8 sm:h-10 sm:w-10" })}
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-200">{title}</h3>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1 sm:mt-2 max-w-sm px-2">{message}</p>
            {children && <div className="mt-4 sm:mt-6 w-full max-w-xs">{children}</div>}
        </div>
    );
};