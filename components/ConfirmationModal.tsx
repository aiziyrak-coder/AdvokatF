import React from 'react';
import { XMarkIcon, ExclamationIcon } from './icons';

interface ConfirmationModalProps {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    t?: (key: string, replacements?: { [key: string]: string }) => string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    title, 
    message, 
    confirmText, 
    cancelText, 
    isDangerous = true, 
    onConfirm, 
    onCancel, 
    t 
}) => {
    
    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 xs:p-4 sm:p-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] animate-assemble-in overflow-y-auto">
            <div className="polished-pane shadow-2xl w-full max-w-md relative animate-assemble-in my-auto max-h-[90dvh] overflow-y-auto">
                <button type="button" onClick={onCancel} className="absolute top-2 right-2 sm:top-3 sm:right-3 min-h-touch min-w-[44px] flex items-center justify-center p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-colors" aria-label={t ? t('button_cancel') : 'Close'}>
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
                <div className="p-5 sm:p-6 md:p-8 pr-10 sm:pr-12">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full ${isDangerous ? 'bg-red-900/50' : 'bg-blue-900/50'}`}>
                           <ExclamationIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${isDangerous ? 'text-red-400' : 'text-blue-400'}`} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-slate-100">{title}</h3>
                            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[var(--text-secondary)] overflow-y-auto max-h-[40vh]">{message}</p>
                        </div>
                    </div>
                     <div className="mt-4 sm:mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full sm:w-auto min-h-touch inline-flex justify-center items-center rounded-xl border border-[var(--border-color)] shadow-sm px-4 py-3 sm:py-2 bg-[var(--bg-secondary)] text-sm sm:text-base font-medium text-slate-300 hover:bg-[var(--bg-pane)] focus:outline-none active:scale-95"
                        >
                            {cancelText || (t ? t('button_cancel') : 'Cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className={`w-full sm:w-auto min-h-touch inline-flex justify-center items-center rounded-xl border border-transparent shadow-sm px-4 py-3 sm:py-2 text-sm sm:text-base font-medium text-white focus:outline-none active:scale-95 ${isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {confirmText || (t ? t('button_confirm') : 'Confirm')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};