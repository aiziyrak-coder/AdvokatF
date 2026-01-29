import React, { useState } from 'react';
import { EmptyState } from './EmptyState';
import { AnalysisIcon, CopyIcon, CheckIcon, DownloadIcon, ChevronDownIcon, CheckCircleIcon, ShieldExclamationIcon, BrainIcon, ChatBubbleLeftRightIcon } from './icons';
import type { Case, RiskMatrixEntry } from '../types';
import { ClientSummaryModal } from './ClientSummaryModal';
import { generateClientSummary } from '../services/geminiService';

interface SummaryViewProps {
  caseData: Case | undefined | null;
  onNewAnalysis: () => void;
  onOpenFeedback: () => void;
  onUpdateCase: (updatedCase: Case) => void;
  checkTokens: (cost: number) => boolean;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const RiskMatrix: React.FC<{ matrix: RiskMatrixEntry[], t: (key: string) => string }> = ({ matrix, t }) => {
    const getLikelihoodClass = (likelihood: 'Past' | 'O\'rta' | 'Yuqori') => {
        switch (likelihood) {
            case 'Past': return 'bg-green-500/20 text-green-300';
            case 'O\'rta': return 'bg-yellow-500/20 text-yellow-300';
            case 'Yuqori': return 'bg-red-500/20 text-red-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
        <div className="polished-pane rounded-xl my-4 sm:my-6 md:my-8 overflow-hidden">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-200 p-3 sm:p-4 border-b border-[var(--border-color)]">{t('risk_matrix_title')}</h2>
            <div className="overflow-x-auto scroll-touch -mx-1 px-1">
                <table className="min-w-full text-xs sm:text-sm">
                    <thead>
                        <tr className="text-left text-[var(--text-secondary)] font-semibold">
                            <th className="p-2 sm:p-3 whitespace-nowrap">{t('risk_matrix_header_risk')}</th>
                            <th className="p-2 sm:p-3 whitespace-nowrap">{t('risk_matrix_header_likelihood')}</th>
                            <th className="p-2 sm:p-3 whitespace-nowrap">{t('risk_matrix_header_mitigation')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matrix.map((item, index) => (
                            <tr key={index} className="border-t border-[var(--border-color)]">
                                <td className="p-2 sm:p-3 text-slate-300 align-top">{item.risk}</td>
                                <td className="p-2 sm:p-3 align-top whitespace-nowrap">
                                    <span className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${getLikelihoodClass(item.likelihood)}`}>
                                        {t(`likelihood_${item.likelihood.toLowerCase().replace(/'/g, '')}`)}
                                    </span>
                                </td>
                                <td className="p-2 sm:p-3 text-slate-400 align-top">{item.mitigation}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-bold text-slate-100 mt-8 mb-4">{line.substring(3)}</h2>);
      continue;
    }
    
    if (line.trim().startsWith('* ')) {
      const listItems = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith('* ')) {
        const itemLine = lines[j];
        listItems.push(<li key={j}>{itemLine.substring(itemLine.indexOf('* ') + 2)}</li>);
        j++;
      }
      elements.push(<ul key={`ul-start-${i}`} className="list-disc list-inside space-y-2 pl-4 my-3">{listItems}</ul>);
      i = j - 1;
      continue;
    }

    const parts = line.split('**');
    const renderedParts = parts.map((part, index) => 
        index % 2 !== 0 ? <strong key={index} className="font-bold text-slate-100">{part}</strong> : <span key={index}>{part}</span>
    );

    elements.push(<p key={i} className="mb-2 text-slate-400">{renderedParts}</p>);
  }
  return elements;
};

export const WinProbabilityGauge: React.FC<{ probability: number, justification: string, positiveFactors: string[], negativeFactors: string[], t: (key: string, replacements?: { [key: string]: string }) => string }> = ({ probability, justification, positiveFactors, negativeFactors, t }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (probability / 100) * circumference;

    const getColor = (p: number) => {
        if (p < 40) return '#ef4444';
        if (p < 70) return '#eab308';
        return 'var(--accent-primary)';
    }
    const color = getColor(probability);

    return (
        <div className="polished-pane rounded-xl mb-4 sm:mb-6 md:mb-8 overflow-hidden">
            <div className="p-4 sm:p-5 md:p-6">
                <h2 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-slate-200 text-center">{t('win_probability_details')}</h2>
                <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40">
                        <svg className="w-full h-full" viewBox="0 0 140 140">
                            <circle cx="70" cy="70" r="50" fill="none" stroke="rgba(0, 245, 255, 0.1)" strokeWidth="1" />
                            <circle cx="70" cy="70" r="50" fill="none" stroke="var(--accent-secondary)" strokeWidth="1" strokeDasharray="10 20" className="animate-spin" style={{ animationDuration: '10s' }}/>
                            <circle strokeWidth="10" stroke="var(--bg-secondary)" fill="transparent" r={radius} cx="70" cy="70" />
                            <circle
                                strokeWidth="10"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                stroke={color}
                                fill="transparent"
                                r={radius}
                                cx="70"
                                cy="70"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease-out' }}
                            />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color }}>
                            {probability}<span className="text-lg sm:text-xl md:text-2xl opacity-70">%</span>
                        </span>
                    </div>
                    <p className="mt-3 sm:mt-4 max-w-lg text-xs sm:text-sm text-slate-400 italic text-center px-2">
                        {justification}
                    </p>
                </div>
                
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[var(--border-color)]' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
                        <div>
                            <h3 className="flex items-center gap-2 font-semibold text-green-400 mb-2">
                                <CheckCircleIcon className="h-5 w-5" />
                                <span>{t('win_probability_positive_factors')}</span>
                            </h3>
                            <ul className="space-y-2 text-sm text-slate-300">
                                {positiveFactors.map((factor, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-green-400 mt-0.5">&bull;</span>
                                        <span>{factor}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                         <div>
                            <h3 className="flex items-center gap-2 font-semibold text-red-400 mb-2">
                                <ShieldExclamationIcon className="h-5 w-5" />
                                <span>{t('win_probability_negative_factors')}</span>
                            </h3>
                             <ul className="space-y-2 text-sm text-slate-300">
                                {negativeFactors.map((factor, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                       <span className="text-red-400 mt-0.5">&bull;</span>
                                        <span>{factor}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-[var(--border-color)] text-center py-3">
                 <button 
                    onClick={() => setIsExpanded(!isExpanded)} 
                    className="font-semibold text-sm text-[var(--accent-primary)] hover:underline flex items-center gap-2 mx-auto"
                >
                    <span>{isExpanded ? t('button_hide_details') : t('button_show_details')}</span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
    );
};


export const SummaryView: React.FC<SummaryViewProps> = ({ caseData, onNewAnalysis, onOpenFeedback, onUpdateCase, checkTokens, t }) => {
  const [copied, setCopied] = useState(false);
  const [exportingType, setExportingType] = useState<'word' | null>(null);
  const [showClientSummary, setShowClientSummary] = useState(false);
  const [isGeneratingClientSummary, setIsGeneratingClientSummary] = useState(false);
  
  const result = caseData?.result;
  const summary = result?.summary;
  const viewTitle = t('view_summary_title');

  const handleCopy = () => {
    if (summary) {
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleExportWord = () => {
    if (!caseData || !result) return;
    setExportingType('word');

    try {
        const { winProbability, probabilityJustification, positiveFactors, negativeFactors, summary: resultSummary, debate } = result;
        
        const listToHtml = (items: string[]) => `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
        const markdownToHtml = (text: string) => text
            .replace(/##\s*(.*)/g, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*\s(.*)/g, '<li>$1</li>')
            .replace(/(\r\n|\n|\r)/gm, '<br>');

        let html = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>${caseData.title}</title></head>
            <body>
                <h1>${t('pdf_report_title')}</h1>
                <h2>${t('case_prefix')}${caseData.title}</h2>
                <hr/>
                <h3>${t('win_probability_details')}</h3>
                <p><strong>${t('pdf_win_probability')}: ${winProbability}%</strong></p>
                <p><i>${probabilityJustification}</i></p>
                <h4>${t('win_probability_positive_factors')}</h4>
                ${listToHtml(positiveFactors)}
                <h4>${t('win_probability_negative_factors')}</h4>
                ${listToHtml(negativeFactors)}
                <hr/>
                <h3>${t('pdf_battle_plan')}</h3>
                ${markdownToHtml(resultSummary)}
                <hr/>
                <h3>${t('pdf_debate_title')}</h3>
                ${debate.map(d => {
                    const personaKey = d.lawyerName.toLowerCase().replace(/ /g, '_').replace('-', '_');
                    const personaName = t(`persona_${personaKey}_name`);
                    return `<h4>${personaName}</h4><p>${markdownToHtml(d.analysis)}</p>`;
                }).join('')}
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeCaseTitle = caseData.title.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_');
        link.download = `${safeCaseTitle}_hisobot.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch(e) {
        console.error("Failed to generate Word file", e);
    } finally {
        setExportingType(null);
    }
  };

  const handleGenerateClientSummary = async () => {
    if (!caseData || !summary) return;
    
    setIsGeneratingClientSummary(true);
    try {
        const clientSummaryText = await generateClientSummary(summary, t);
        const updatedCase = {
            ...caseData,
            result: { ...caseData.result, clientSummary: clientSummaryText },
        };
        onUpdateCase(updatedCase);
        setShowClientSummary(true);
    } catch (error) {
        console.error("Failed to generate client summary", error);
        alert(t('error_generic_title'));
    } finally {
        setIsGeneratingClientSummary(false);
    }
  };


  if (!caseData || !result || !summary) {
    return (
        <EmptyState 
            icon={<AnalysisIcon />}
            title={t('empty_state_summary_title')}
            message={t('empty_state_summary_message')}
            t={t}
        >
            <button
                onClick={onNewAnalysis}
                className="mt-6 bg-[var(--accent-primary)] text-black font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg hover:shadow-[var(--glow-color)]"
            >
                {t('button_start_new_analysis')}
            </button>
        </EmptyState>
    )
  }

  return (
    <section>
       {showClientSummary && result.clientSummary && (
            <ClientSummaryModal 
                summaryText={result.clientSummary}
                onClose={() => setShowClientSummary(false)}
                t={t}
            />
        )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold animated-gradient-text">{viewTitle}</h2>
        <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleGenerateClientSummary} disabled={isGeneratingClientSummary} className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-white interactive-hover disabled:opacity-50">
                <BrainIcon className="h-5 w-5" />
                <span>{isGeneratingClientSummary ? t('button_generating') : t('button_generate_client_summary')}</span>
            </button>
            <button onClick={onOpenFeedback} className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-white interactive-hover">
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>{t('button_feedback')}</span>
            </button>
            <button onClick={handleCopy} className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-white interactive-hover">
                {copied ? <CheckIcon className="h-5 w-5 text-[var(--accent-primary)]" /> : <CopyIcon className="h-5 w-5" />}
                <span>{copied ? t('button_copied') : t('button_copy')}</span>
            </button>
            <button onClick={handleExportWord} disabled={!!exportingType} className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-white interactive-hover disabled:opacity-50">
                <DownloadIcon className="h-5 w-5" />
                <span>{exportingType ? t('button_generating') : t('button_export_word_summary')}</span>
            </button>
        </div>
      </div>
      <WinProbabilityGauge 
        probability={result.winProbability}
        justification={result.probabilityJustification}
        positiveFactors={result.positiveFactors}
        negativeFactors={result.negativeFactors}
        t={t}
      />
      {result.riskMatrix && <RiskMatrix matrix={result.riskMatrix} t={t} />}
      <div className="polished-pane p-6">
        {renderMarkdown(summary)}
      </div>
    </section>
  );
};