
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UploadIcon, AnalysisIcon, CheckCircleIcon, ExclamationIcon, UserGroupIcon } from './icons';
import { ConfirmationModal } from './ConfirmationModal';
import type { CaseFile, CaseParticipant, SuggestedParticipant } from '../types';
import { getDocumentType, getCaseParticipants } from '../services/geminiService';
import { extractTextFromPdf } from '../services/pdfService';

declare global {
    interface Window {
        mammoth: any;
    }
}

const extractTextFromFile = async (file: File): Promise<{ text: string, images?: string[] }> => {
    if (file.type === 'application/pdf') {
        try {
            const text = await extractTextFromPdf(file);
            return { text };
        } catch (error) {
            console.error("PDF extraction failed", error);
            return { text: '' };
        }
    } 
    else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && window.mammoth) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await window.mammoth.extractRawText({ arrayBuffer });
            return { text: result.value || '' };
        } catch (error) { return { text: '' }; }
    }
    else if (file.type.startsWith('text/')) {
        const t = await file.text();
        return { text: t };
    }
    return { text: '' };
};

interface CaseInputFormProps {
  onAnalyze: (courtType: string, caseDetails: string, files: CaseFile[], courtStage: string, finalParticipants: CaseParticipant[], client: {name: string, role: string}) => void;
  isLoading: boolean;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const courtTypes = ["Fuqarolik", "Jinoyat", "Ma'muriy", "Iqtisodiy"];
const courtStages = ["Tergov", "Birinchi instansiya", "Apellyatsiya", "Kassatsiya", "Nazorat tartibida"];
const PARTICIPANT_ROLES = ["Da'vogar", "Javobgar", "Sudlanuvchi", "Gumonlanuvchi", "Ayblanuvchi", "Jabrlanuvchi", "Guvoh", "Boshqa"];

type ProcessedFile = CaseFile & { status: 'processing' | 'ready' | 'error'; statusText: string; progress: number; };

export const CaseInputForm: React.FC<CaseInputFormProps> = ({ onAnalyze, isLoading, t }) => {
  const [courtType, setCourtType] = useState('');
  const [courtStage, setCourtStage] = useState('');
  const [caseDetails, setCaseDetails] = useState('');
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [showExtraInfo, setShowExtraInfo] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identifiedParticipants, setIdentifiedParticipants] = useState<SuggestedParticipant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const lastScannedFilesCount = useRef(0);
  // Fayllar tayyor yoki xato holatida bo'lsa ham, ishtirokchilarni aniqlashga urinib ko'ramiz.
  const allFilesProcessed = files.length > 0 && files.every(f => f.status === 'ready' || f.status === 'error');

  useEffect(() => {
    if (allFilesProcessed && !isIdentifying && files.length !== lastScannedFilesCount.current) {
        const identify = async () => {
            setIsIdentifying(true);
            try {
                // Faqat muvaffaqiyatli o'qilgan fayllarni AIga yuboramiz,
                // lekin hech bo'lmaganda caseDetails bo'lsa, fallback baribir ishlaydi.
                const filesToScan = files
                  .filter(f => f.status === 'ready')
                  .map(({ status, statusText, progress, ...rest }) => rest);
                const participants = await getCaseParticipants(caseDetails, filesToScan, t);
                if (participants && Array.isArray(participants)) {
                    const uniqueParticipants = Array.from(new Map(participants.map(p => [p.name.toLowerCase(), p])).values());
                    setIdentifiedParticipants(uniqueParticipants);
                    lastScannedFilesCount.current = files.length;
                }
            } catch (error) { 
                console.error("Identifying failed:", error); 
            } finally { 
                setIsIdentifying(false); 
            }
        };
        // Hech bo'lmaganda bir marta urinish uchun, fayllar ro'yxati o'zgarganida ishga tushiramiz.
        identify();
    }
  }, [allFilesProcessed, caseDetails, files, isIdentifying, t]);

  const handleFilesAdded = useCallback(async (fileList: File[]) => {
      if (!fileList || fileList.length === 0) return;

      const initialPlaceholders: ProcessedFile[] = fileList.map(file => ({
        id: `${Date.now()}-${Math.random()}`, name: file.name, type: file.type, status: 'processing', statusText: t('file_status_reading'), progress: 5, content: '', extractedText: ''
      }));
      setFiles(prev => [...prev, ...initialPlaceholders]);

      for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          const placeholder = initialPlaceholders[i];
          const update = (upd: Partial<ProcessedFile>) => setFiles(prev => prev.map(f => f.id === placeholder.id ? { ...f, ...upd } : f));

          try {
              update({ progress: 20 });
              // Tezkor matn olish (protsedura to'xtamasligi uchun)
              const extractionResult = await extractTextFromFile(file);
              update({ progress: 50 });
              
              const reader = new FileReader();
              const content = await new Promise<string>((resolve, reject) => {
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(file);
              });

              update({ 
                  progress: 80, 
                  statusText: t('status_ai_analyzing'), 
                  content, 
                  extractedText: extractionResult.text,
                  images: extractionResult.images 
              });
              
              let docType = "Hujjat";
              try {
                  docType = await getDocumentType({ ...placeholder, content, extractedText: extractionResult.text, images: extractionResult.images }, t);
              } catch (e) { console.warn("DocType detection failed:", e); }

              update({ status: 'ready', statusText: docType, progress: 100, documentType: docType });
          } catch (e: any) { 
              update({ status: 'error', statusText: e?.message || t('file_status_error'), progress: 100 }); 
          }
      }
  }, [t]);

  const toggleParticipant = (name: string) => {
    setSelectedParticipants(prev => {
        const n = new Set(prev);
        if (n.has(name)) n.delete(name); else n.add(name);
        return n;
    });
  };

  const updateRole = (name: string, role: string) => {
    setIdentifiedParticipants(prev => prev.map(p => p.name === name ? { ...p, suggestedRole: role } : p));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtType || !courtStage || selectedParticipants.size === 0) return;
    setShowConfirmModal(true);
  };

  const handleConfirmAnalyze = () => {
    setShowConfirmModal(false);
    try {
        const readyFiles: CaseFile[] = files.filter(f => f.status === 'ready').map(({ status, statusText, progress, ...rest }) => rest);
        const finalParticipants: CaseParticipant[] = identifiedParticipants.map(p => ({ name: p.name, role: p.suggestedRole || "Boshqa" })); // Default rol
        
        const clientName = Array.from(selectedParticipants).join(', ');
        const clientRole = identifiedParticipants.find(p => selectedParticipants.has(p.name))?.suggestedRole || "Mijoz";
        
        onAnalyze(courtType, caseDetails, readyFiles, courtStage, finalParticipants, { name: clientName, role: clientRole });
    } catch (err) {
        console.error("Submission failed:", err);
        alert("Tizimda kutilmagan xatolik yuz berdi.");
    }
  };

  return (
    <div className="polished-pane p-4 sm:p-5 md:p-6 lg:p-8 shadow-2xl relative animate-assemble-in max-w-full overflow-hidden">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <fieldset className="space-y-4 sm:space-y-6" disabled={isLoading}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('case_input_court_type')}</label>
                        <select value={courtType} onChange={e => setCourtType(e.target.value)} required className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all">
                            <option value="" disabled>{t('select_option_placeholder')}</option>
                            {courtTypes.map(type => <option key={type} value={type}>{t(`court_type_${type.toLowerCase().replace("'", "")}`)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('case_input_court_stage')}</label>
                        <select value={courtStage} onChange={e => setCourtStage(e.target.value)} required className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none transition-all">
                            <option value="" disabled>{t('select_option_placeholder')}</option>
                            {courtStages.map(stage => <option key={stage} value={stage}>{t(`court_stage_${stage.replace(/ /g, '_').toLowerCase()}`)}</option>)}
                        </select>
                    </div>
                </div>

                <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer hover:border-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] transition-all min-h-touch flex items-center justify-center">
                    <input type="file" id="file-upload" className="hidden" multiple onChange={e => e.target.files && handleFilesAdded(Array.from(e.target.files))} accept=".pdf,.doc,.docx,.txt,image/*" />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full py-2">
                        <UploadIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-[var(--text-secondary)] flex-shrink-0" />
                        <p className="mt-2 sm:mt-3 text-sm sm:text-base font-semibold text-[var(--text-primary)]">{t('case_input_dropzone_title')}</p>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">{t('case_input_pdf_hint')}</p>
                    </label>
                </div>

                {files.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 animate-assemble-in">
                        {files.map((file) => (
                            <div key={file.id} className="relative overflow-hidden bg-[var(--bg-secondary)]/50 rounded-lg border border-[var(--border-color)]/30 p-2 flex items-center gap-3">
                                {file.status === 'processing' ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full"></div>
                                ) : file.status === 'error' ? (
                                    <ExclamationIcon className="h-4 w-4 text-red-500" />
                                ) : (
                                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate text-[var(--text-primary)]">{file.name}</p>
                                    <p className="text-[10px] text-[var(--text-secondary)]">{file.statusText}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {(allFilesProcessed || isIdentifying) && (
                    <div className="polished-pane p-4 sm:p-5 bg-[var(--bg-secondary)]/30 border-[var(--border-color)] rounded-xl animate-assemble-in mt-4 sm:mt-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <UserGroupIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--accent-primary)] flex-shrink-0" />
                            <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">{t('participant_selector_title')}</h3>
                        </div>
                        {isIdentifying ? (
                            <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--text-secondary)] py-3 sm:py-4">
                                <div className="animate-bounce h-2 w-2 bg-[var(--accent-primary)] rounded-full"></div>
                                <div className="animate-bounce h-2 w-2 bg-[var(--accent-primary)] rounded-full [animation-delay:0.2s]"></div>
                                <div className="animate-bounce h-2 w-2 bg-[var(--accent-primary)] rounded-full [animation-delay:0.4s]"></div>
                                <span>{t('participant_identifying_loading')}</span>
                            </div>
                        ) : identifiedParticipants.length > 0 ? (
                            <div className="space-y-4">
                                <p className="text-sm text-[var(--text-secondary)]">{t('participant_selector_description')}</p>
                                <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto pr-2 scroll-touch">
                                    {identifiedParticipants.map((p) => (
                                        <div key={p.name} className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-all ${selectedParticipants.has(p.name) ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/50' : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)]'}`}>
                                            <button
                                                type="button"
                                                onClick={() => toggleParticipant(p.name)}
                                                className={`flex-1 flex items-center gap-3 text-left transition-all ${selectedParticipants.has(p.name) ? 'text-[var(--accent-primary)] font-bold' : 'text-[var(--text-secondary)]'}`}
                                            >
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedParticipants.has(p.name) ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' : 'border-[var(--border-color)]'}`}>
                                                    {selectedParticipants.has(p.name) && <CheckCircleIcon className="h-4 w-4 text-black" />}
                                                </div>
                                                <span className="truncate">{p.name}</span>
                                            </button>
                                            <select
                                                value={p.suggestedRole}
                                                onChange={(e) => updateRole(p.name, e.target.value)}
                                                className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded px-2 py-1 outline-none transition-all focus:ring-1 focus:ring-[var(--accent-primary)]"
                                            >
                                                {PARTICIPANT_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-yellow-500 mb-2">{t('participant_none_found')}</p>
                                <p className="text-xs text-[var(--text-secondary)] mb-3 max-w-md mx-auto">{t('participant_none_found_hint')}</p>
                                <button type="button" onClick={() => { lastScannedFilesCount.current = -1; setIdentifiedParticipants([]); }} className="text-xs text-[var(--accent-primary)] hover:underline">{t('participant_retry')}</button>
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-[var(--border-color)]/30">
                    <label className="flex items-start sm:items-center gap-2 sm:gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={showExtraInfo}
                                onChange={e => setShowExtraInfo(e.target.checked)}
                                className="peer appearance-none h-5 w-5 border-2 border-[var(--border-color)] rounded bg-[var(--bg-secondary)] checked:bg-[var(--accent-primary)] transition-all"
                            />
                            <svg className="absolute w-3.5 h-3.5 text-black left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 12 10" fill="none">
                                <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Qo'shimcha ma'lumot kiritish</span>
                    </label>
                    {showExtraInfo && (
                        <textarea value={caseDetails} onChange={e => setCaseDetails(e.target.value)} placeholder={t('case_input_details_placeholder')} className="w-full h-32 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] outline-none resize-y animate-assemble-in transition-all" />
                    )}
                </div>
            </fieldset>
            
            <div className="space-y-2">
                <button
                type="submit"
                disabled={isLoading || !courtType || !courtStage || selectedParticipants.size === 0}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[var(--accent-primary)] text-black font-bold py-3 sm:py-4 px-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100 mt-3 sm:mt-4 shadow-xl shadow-[var(--accent-primary)]/10 min-h-touch text-sm sm:text-base"
                >
                {isLoading ? (
                    <div className="flex items-center gap-2 sm:gap-3"><div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-black border-t-transparent rounded-full flex-shrink-0"></div><span className="truncate">{t('analysis_in_progress')}</span></div>
                ) : (
                    <><AnalysisIcon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" /><span className="truncate">{t('button_strategy_deep_analysis')}</span></>
                )}
                </button>
            </div>
        </form>

        {showConfirmModal && (
            <ConfirmationModal
                title={t('confirm_analysis_title')}
                message={t('confirm_analysis_message')}
                confirmText={t('confirm_analysis_confirm')}
                cancelText={t('confirm_analysis_cancel')}
                onConfirm={handleConfirmAnalyze}
                onCancel={() => setShowConfirmModal(false)}
                isDangerous={false}
                t={t}
            />
        )}
    </div>
  );
};
