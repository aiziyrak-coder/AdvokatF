import React, { useState } from 'react';
import { XMarkIcon, CopyIcon, CheckIcon, DownloadIcon } from './icons';

interface ClientSummaryModalProps {
    summaryText: string;
    onClose: () => void;
    t: (key: string) => string;
}

export const ClientSummaryModal: React.FC<ClientSummaryModalProps> = ({ summaryText, onClose, t }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(summaryText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = t('client_summary_filename');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="polished-pane shadow-2xl w-full max-w-2xl relative animate-assemble-in max-h-[90vh] flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-[var(--border-color)]">
                    <h2 className="text-lg font-bold">{t('client_summary_title')}</h2>
                    <div className="flex items-center gap-2">
                         <button onClick={handleCopy} className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-white interactive-hover">
                            {copied ? <CheckIcon className="h-5 w-5 text-[var(--accent-primary)]" /> : <CopyIcon className="h-5 w-5" />}
                         </button>
                         <button onClick={handleDownload} className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-white interactive-hover">
                            <DownloadIcon className="h-5 w-5" />
                         </button>
                         <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white transition-colors">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto">
                    <p className="text-slate-300 whitespace-pre-wrap">{summaryText}</p>
                </div>
            </div>
        </div>
    );
};