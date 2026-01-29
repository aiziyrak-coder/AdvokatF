import React, { useState, useEffect } from 'react';
import type { SuggestedParticipant, CaseParticipant } from '../types';
import { XMarkIcon, UserGroupIcon, TrashIcon, CheckCircleIcon } from './icons';

// Define the shape of an editable participant with a unique ID
interface EditableParticipant {
  id: string;
  name: string;
  role: string;
  isAiSuggested: boolean;
}

interface ParticipantEditorModalProps {
    initialParticipants: SuggestedParticipant[];
    onConfirm: (finalParticipants: CaseParticipant[], client: {name: string, role: string}) => void;
    onCancel: () => void;
    isLoading: boolean;
    t: (key: string, replacements?: { [key: string]: string }) => string;
}

const ParticipantRow: React.FC<{
    participant: EditableParticipant;
    isClient: boolean;
    onUpdate: (id: string, field: 'name' | 'role', value: string) => void;
    onRemove: (id: string) => void;
    onSetClient: (id: string) => void;
    roles: string[];
    t: (key: string) => string;
    hasError: boolean;
}> = ({ participant, isClient, onUpdate, onRemove, onSetClient, roles, t, hasError }) => {
    
    const baseClasses = "flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg border transition-all duration-300";
    const stateClasses = isClient
        ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/50 shadow-lg shadow-[var(--glow-color)]"
        : `bg-[var(--bg-secondary)]/60 border-[var(--border-color)] hover:border-slate-600`;
    
    return (
        <div className={`${baseClasses} ${stateClasses}`}>
            <div className="flex-1 w-full flex items-center gap-3">
                 {participant.isAiSuggested && <span className="text-xs font-bold text-cyan-400 opacity-70" title="AI suggested participant">AI</span>}
                 <input
                    type="text"
                    value={participant.name}
                    placeholder={t('participant_name_placeholder')}
                    onChange={(e) => onUpdate(participant.id, 'name', e.target.value)}
                    className={`w-full p-2 bg-[var(--bg-secondary)] border ${hasError ? 'border-red-500/80' : 'border-[var(--border-color)]'} rounded-lg text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] focus:border-transparent`}
                />
            </div>
            <div className="flex-1 w-full">
                <select 
                    value={participant.role} 
                    onChange={(e) => onUpdate(participant.id, 'role', e.target.value)} 
                    className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] focus:border-transparent cursor-pointer"
                >
                    {roles.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                {isClient ? (
                    <div className="w-full flex items-center justify-center gap-2 text-center text-[var(--accent-primary)] font-bold text-sm px-4 py-2 rounded-lg bg-[var(--accent-primary)]/20">
                       <CheckCircleIcon className="h-5 w-5"/> <span>{t('this_is_client')}</span>
                    </div>
                ) : (
                    <button 
                        onClick={() => onSetClient(participant.id)}
                        className="w-full text-center text-[var(--text-secondary)] hover:text-white font-medium text-sm px-4 py-2 rounded-lg bg-[var(--bg-pane)] hover:bg-[var(--bg-secondary)] transition-all transform hover:scale-105 cursor-pointer"
                    >
                       {t('set_as_client')}
                    </button>
                )}
                 <button 
                    onClick={() => onRemove(participant.id)}
                    title={t('remove_participant_tooltip')}
                    className="p-2 text-[var(--text-secondary)] hover:text-red-400 transition-all transform hover:scale-110 rounded-lg bg-[var(--bg-pane)] hover:bg-red-900/40 cursor-pointer"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export const ParticipantEditorModal: React.FC<ParticipantEditorModalProps> = ({ initialParticipants, onConfirm, onCancel, isLoading, t }) => {
    const [participants, setParticipants] = useState<EditableParticipant[]>([]);
    const [clientId, setClientId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const roleKeys = ["davogar", "javobgar", "sudlanuvchi", "jabrlanuvchi", "guvoh", "boshqa"];

    useEffect(() => {
        const mappedParticipants = initialParticipants.map((p, i) => ({
            id: `ai-${i}-${p.name}`,
            name: p.name,
            role: t(`client_role_${p.suggestedRole.toLowerCase().replace("'", "")}`),
            isAiSuggested: true,
        }));
        setParticipants(mappedParticipants);

        const clientRoleCandidates = [
          t("client_role_davogar"),
          t("client_role_javobgar"),
          t("client_role_sudlanuvchi"),
          t("client_role_jabrlanuvchi"),
        ];

        const firstClientCandidate = mappedParticipants.find(p => clientRoleCandidates.includes(p.role));
        if (firstClientCandidate) {
            setClientId(firstClientCandidate.id);
        } else if (mappedParticipants.length > 0) {
            setClientId(mappedParticipants[0].id);
        }
    }, [initialParticipants, t]);

    const handleUpdateParticipant = (id: string, field: 'name' | 'role', value: string) => {
        setParticipants(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
        if (field === 'name' && value.trim() !== '') {
            setError(null);
        }
    };

    const handleAddParticipant = () => {
        const newId = `manual-${Date.now()}`;
        setParticipants(prev => [...prev, { id: newId, name: '', role: t('client_role_boshqa'), isAiSuggested: false }]);
    };

    const handleRemoveParticipant = (id: string) => {
        setParticipants(prev => {
            const newParticipants = prev.filter(p => p.id !== id);
            if (clientId === id) {
                setClientId(newParticipants.length > 0 ? newParticipants[0].id : null);
            }
            return newParticipants;
        });
    };

    const handleConfirm = () => {
        setSubmitted(true);

        if (!clientId) {
            setError(t('error_no_client_selected'));
            return;
        }
        
        const emptyNameParticipant = participants.find(p => p.name.trim() === '');
        if (emptyNameParticipant) {
            setError(t('error_empty_name'));
            return;
        }
        
        setError(null);
        
        const clientParticipant = participants.find(p => p.id === clientId);
        if (clientParticipant) {
            const finalParticipants: CaseParticipant[] = participants.map(({ id, isAiSuggested, ...rest }) => rest);
            const client = { name: clientParticipant.name, role: clientParticipant.role };
            onConfirm(finalParticipants, client);
        }
    };

    const roles = roleKeys.map(key => t(`client_role_${key}`));

    const hasEmptyName = participants.some(p => p.name.trim() === '');
    const isConfirmDisabled = isLoading || !clientId || (submitted && hasEmptyName);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="polished-pane shadow-2xl w-full max-w-3xl relative animate-assemble-in p-6 sm:p-8 max-h-[90vh] flex flex-col">
                <button onClick={onCancel} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer disabled:cursor-default" disabled={isLoading}>
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="text-center mb-6">
                    <UserGroupIcon className="h-12 w-12 mx-auto text-[var(--accent-primary)]" />
                    <h2 className="text-2xl font-bold mt-4 mb-2">{t('participant_editor_title')}</h2>
                    <p className="text-sm text-[var(--text-secondary)] max-w-lg mx-auto">{t('participant_editor_description')}</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
                    {participants.map((p) => (
                        <ParticipantRow
                            key={p.id}
                            participant={p}
                            isClient={clientId === p.id}
                            onUpdate={handleUpdateParticipant}
                            onRemove={handleRemoveParticipant}
                            onSetClient={setClientId}
                            roles={roles}
                            t={t}
                            hasError={submitted && p.name.trim() === ''}
                        />
                    ))}
                </div>
                
                <div className="mt-4">
                    <button 
                        onClick={handleAddParticipant}
                        className="w-full text-sm text-center text-[var(--accent-primary)] hover:underline p-2 rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                    >
                       + {t('add_participant')}
                    </button>
                </div>
                
                <div className="mt-6 flex flex-col-reverse sm:flex-row-reverse gap-3 pt-4 border-t border-[var(--border-color)]">
                    <button
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                        className="w-full flex items-center justify-center gap-3 bg-[var(--accent-primary)] text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--glow-color)] disabled:scale-100 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8_0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>{t('button_analysis_starting')}</span>
                            </>
                        ) : t('button_proceed_to_analysis')}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="w-full text-center rounded-lg border border-transparent shadow-sm px-4 py-3 bg-transparent font-medium text-[var(--text-secondary)] hover:text-white transition-all transform hover:-translate-y-0.5 focus:outline-none sm:text-sm disabled:opacity-50 cursor-pointer disabled:cursor-default"
                    >
                        {t('button_go_back')}
                    </button>
                </div>
                {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
            </div>
        </div>
    );
};