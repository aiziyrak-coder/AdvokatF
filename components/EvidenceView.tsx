import React from 'react';
import type { Case, EvidenceItem } from '../types';
import { BeakerIcon, UploadIcon } from './icons';

interface EvidenceViewProps {
    caseData: Case | null;
    onUpdateEvidence: (newEvidence: EvidenceItem[]) => void;
    t: (key: string) => string;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({ caseData, onUpdateEvidence, t }) => {
    
    // This component is a placeholder for a more complex evidence management system.
    // For now, it will display files from the case.
    const evidence = caseData?.files || [];

    return (
         <div className="space-y-6 animate-assemble-in">
            <div className="polished-pane p-4">
                 <div 
                    className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-6 text-center cursor-pointer hover:border-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                >
                    <label className="cursor-pointer">
                        <UploadIcon className="h-10 w-10 mx-auto text-[var(--text-secondary)]" />
                        <p className="mt-2 text-sm text-[var(--text-primary)]">{t('evidence_upload_prompt')}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{t('feature_coming_soon')}</p>
                    </label>
                </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">{t('evidence_uploaded_title')} ({evidence.length})</h3>
                <div className="space-y-3">
                    {evidence.map(item => (
                        <div key={item.id} className="polished-pane p-3 flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{item.documentType || item.type}</p>
                            </div>
                            <button className="text-sm font-semibold text-[var(--accent-primary)] hover:underline disabled:opacity-50" disabled>
                                {t('button_analyze')}
                            </button>
                        </div>
                    ))}
                     {evidence.length === 0 && (
                        <p className="text-center text-[var(--text-secondary)] py-4">{t('evidence_none')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};