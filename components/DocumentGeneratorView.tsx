import React, { useState } from 'react';
import type { Case } from '../types';
import { EmptyState } from './EmptyState';
import { DocumentTextIcon, CopyIcon, CheckIcon, DownloadIcon } from './icons';
import { generateDocument } from '../services/geminiService';

interface DocumentGeneratorViewProps {
    caseData: Case | null | undefined;
    onNewAnalysis: () => void;
    checkTokens: (cost: number) => boolean;
    t: (key: string, replacements?: { [key: string]: string }) => string;
}

const DOCUMENT_TEMPLATES = [
    "Da'vo arizasi",
    "Qarshi da'vo arizasi",
    "Iltimosnoma",
    "Apellyatsiya shikoyati",
    "Kassatsiya shikoyati",
    "Advokat so'rovi",
    "Kafillik xati",
    "Dalillarni qabul qilish to'g'risida ariza",
];

export const DocumentGeneratorView: React.FC<DocumentGeneratorViewProps> = ({ caseData, onNewAnalysis, checkTokens, t }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [generatedText, setGeneratedText] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!selectedTemplate || !caseData) return;
        
        setIsLoading(true);
        setGeneratedText('');
        try {
            const text = await generateDocument(selectedTemplate, caseData, t);
            setGeneratedText(text);
        } catch (error) {
            console.error("Document generation failed:", error);
            setGeneratedText(t('error_doc_generation'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (generatedText) {
            navigator.clipboard.writeText(generatedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (!generatedText || !caseData) return;
        const blob = new Blob([generatedText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeCaseTitle = caseData.title.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_');
        link.download = `${selectedTemplate}_${safeCaseTitle}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!caseData) {
        return (
            <EmptyState
                icon={<DocumentTextIcon />}
                title={t('empty_state_documents_title')}
                message={t('empty_state_documents_message')}
                t={t}
            />
        );
    }
    
    return (
        <div className="space-y-6 animate-assemble-in">
            <div className="polished-pane p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <label htmlFor="doc-template" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('doc_generator_template_label')}</label>
                        <select
                            id="doc-template"
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition-all duration-300"
                        >
                            <option value="" disabled>{t('select_option_placeholder')}</option>
                            {DOCUMENT_TEMPLATES.map(template => (
                                <option key={template} value={template}>{t(`doc_template_${template.toLowerCase().replace(/ /g, '_').replace(/'/g, "")}`)}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !selectedTemplate}
                        className="w-full sm:w-auto self-end flex items-center justify-center gap-3 bg-[var(--accent-primary)] text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.03] disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>{t('button_generating')}</span>
                            </>
                        ) : (
                            <span>{t('button_generate')}</span>
                        )}
                    </button>
                </div>
            </div>

            {generatedText && (
                 <div className="polished-pane">
                     <div className="p-4 flex justify-between items-center border-b border-[var(--border-color)]">
                         <h3 className="font-semibold text-lg">{t(`doc_template_${selectedTemplate.toLowerCase().replace(/ /g, '_').replace(/'/g, "")}`)}</h3>
                         <div className="flex items-center gap-2">
                             <button onClick={handleCopy} className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-white interactive-hover">
                                {copied ? <CheckIcon className="h-5 w-5 text-[var(--accent-primary)]" /> : <CopyIcon className="h-5 w-5" />}
                             </button>
                             <button onClick={handleDownload} className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-white interactive-hover">
                                <DownloadIcon className="h-5 w-5" />
                             </button>
                         </div>
                     </div>
                     <pre className="p-4 text-sm text-slate-300 whitespace-pre-wrap font-sans overflow-x-auto max-h-[50vh]">
                         {generatedText}
                     </pre>
                 </div>
            )}
        </div>
    );
};