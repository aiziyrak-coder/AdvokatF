import React, { useState } from 'react';
import type { Case } from '../types';
import { EmptyState } from './EmptyState';
import { TheaterIcon, LightBulbIcon, ArrowsRightLeftIcon, DownloadIcon, ChatBubbleLeftRightIcon } from './icons';
import { AI_LAWYERS } from '../constants';

interface SimulationViewProps {
  caseData: Case | undefined | null;
  onNewAnalysis: () => void;
  isLoading: boolean;
  onGenerateSimulation: () => void;
  onOpenFeedback: () => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const renderMarkdown = (text: string | undefined) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-xl font-bold text-[var(--text-primary)] mt-6 mb-3">{line.substring(4)}</h3>);
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-bold text-[var(--text-primary)] mt-8 mb-4 border-b border-[var(--border-color)] pb-2">{line.substring(3)}</h2>);
      continue;
    }
    
    const parts = line.split(/(\*\*.*?\*\*)/g).map((part, index) => 
        part.startsWith('**') ? <strong key={index} className="font-bold text-[var(--text-primary)]">{part.slice(2, -2)}</strong> : <span key={index}>{part}</span>
    );
    elements.push(<p key={i} className="mb-2.5 text-[var(--text-secondary)]">{parts}</p>);
  }
  return <div className="prose prose-invert max-w-none prose-p:text-[var(--text-secondary)] prose-strong:text-[var(--text-primary)]">{elements}</div>;
};

const ModuleCard: React.FC<{ title: string, description: string, icon: React.ReactElement, children: React.ReactNode }> = ({ title, description, icon, children }) => (
    <div className="polished-pane overflow-hidden animate-assemble-in">
        <div className="p-5 border-b border-[var(--border-color)]">
            <div className="flex items-start space-x-4">
                <div className="p-3 bg-[var(--bg-secondary)]/50 rounded-lg text-[var(--accent-secondary)]">
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-[var(--text-primary)]">{title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
                </div>
            </div>
        </div>
        <div className="p-5 bg-[var(--bg-secondary)]/10">
            {children}
        </div>
    </div>
);


export const SimulationView: React.FC<SimulationViewProps> = ({ caseData, onNewAnalysis, isLoading, onGenerateSimulation, onOpenFeedback, t }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const handleUserAnswerChange = (index: number, value: string) => {
    setUserAnswers(prev => ({ ...prev, [index]: value }));
  };

  const toggleReveal = (index: number) => {
    setRevealedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleExportWord = () => {
    if (!caseData || !caseData.result) return;
    setIsExporting(true);
    try {
        const { courtroomScenario, crossExaminationQuestions, closingArgumentLead, closingArgumentDefender } = caseData.result;
        const markdownToHtml = (text: string | undefined) => text ? text.replace(/##\s*(.*)/g, '<h2>$1</h2>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/(\r\n|\n|\r)/gm, '<br/>') : '';
        
        let questionsHtml = '';
        if (crossExaminationQuestions && crossExaminationQuestions.length > 0) {
            questionsHtml = crossExaminationQuestions.map((q, i) => 
                `<p><strong>${i+1}. ${t('excel_sim_question')}:</strong> ${q.question}</p>
                 <p><em>${t('excel_sim_answer')}:</em> ${q.suggestedAnswer}</p>`
            ).join('<br/>');
        }

        let html = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>${caseData.title} Simulation</title></head>
            <body>
                <h1>${t('pdf_sim_title')}</h1>
                <h2>${t('pdf_report_for_case', { caseTitle: caseData.title })}</h2>
                <hr/>
                ${courtroomScenario ? `<h3>${t('simulation_scenario_title')}</h3>${markdownToHtml(courtroomScenario)}<hr/>` : ''}
                ${questionsHtml ? `<h3>${t('simulation_questions_title')}</h3>${questionsHtml}<hr/>` : ''}
                ${closingArgumentLead ? `<h3>${t('excel_sim_closing_lead')}</h3>${markdownToHtml(closingArgumentLead)}<hr/>` : ''}
                ${closingArgumentDefender ? `<h3>${t('excel_sim_closing_defender')}</h3>${markdownToHtml(closingArgumentDefender)}` : ''}
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeCaseTitle = caseData.title.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_');
        const filename = t('pdf_sim_filename', { caseTitle: safeCaseTitle }).replace('.pdf', '.doc');
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch(e) {
        console.error("Failed to generate Simulation Word file", e);
    } finally {
        setIsExporting(false);
    }
  };

  if (!caseData || !caseData.result) {
    return (
      <EmptyState
        icon={<TheaterIcon />}
        title={t('empty_state_simulation_title')}
        message={t('empty_state_simulation_message')}
        t={t}
      >
        <button
          onClick={onNewAnalysis}
          className="mt-6 bg-[var(--accent-primary)] text-black font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 hover:-translate-y-1"
        >
          {t('button_start_new_analysis')}
        </button>
      </EmptyState>
    );
  }

  const { courtroomScenario, crossExaminationQuestions, closingArgumentLead, closingArgumentDefender } = caseData.result;

  if (!courtroomScenario && !crossExaminationQuestions) {
       if (isLoading) {
          // The global spinner from App.tsx is active, so we return null to avoid flashing content.
          return null; 
      }
      return (
          <EmptyState
              icon={<TheaterIcon />}
              title={t('simulation_generate_prompt_title')}
              message={t('simulation_generate_prompt_message')}
              t={t}
          >
              <button
                  onClick={onGenerateSimulation}
                  disabled={isLoading}
                  className="mt-6 bg-[var(--accent-primary)] text-black font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 flex items-center gap-2"
              >
                  <TheaterIcon className="h-6 w-6"/>
                  <span>{t('button_generate_simulation')}</span>
              </button>
          </EmptyState>
      );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-end gap-2">
        <button onClick={onOpenFeedback} className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] interactive-hover">
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            <span>{t('button_feedback')}</span>
        </button>
        <button 
            onClick={handleExportWord} 
            disabled={isExporting} 
            className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] interactive-hover"
        >
            <DownloadIcon className="h-5 w-5" />
            <span>{isExporting ? t('button_generating') : t('button_export_word_simulation')}</span>
            {isExporting && <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
        </button>
      </div>

      <ModuleCard 
        title={t('simulation_scenario_title')}
        description={t('simulation_scenario_desc')}
        icon={<TheaterIcon className="h-8 w-8" />}
      >
        {courtroomScenario ? renderMarkdown(courtroomScenario) : <p className="text-[var(--text-secondary)]">{t('simulation_data_not_generated')}</p>}
      </ModuleCard>

      <ModuleCard
        title={t('simulation_questions_title')}
        description={t('simulation_questions_desc')}
        icon={<ArrowsRightLeftIcon className="h-8 w-8" />}
      >
        {crossExaminationQuestions && crossExaminationQuestions.length > 0 ? (
            <div className="space-y-6">
                {crossExaminationQuestions.map((q, index) => (
                    <div key={index} className="polished-pane p-4 rounded-lg">
                         <p className="text-sm font-semibold text-[var(--text-secondary)] mb-2">{t('simulation_ai_question_prefix')} #{index + 1}</p>
                         <p className="font-semibold text-[var(--text-primary)]">{q.question}</p>
                         <div className="mt-4">
                             <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('simulation_qa_your_answer_label')}</label>
                             <textarea
                                 value={userAnswers[index] || ''}
                                 onChange={(e) => handleUserAnswerChange(index, e.target.value)}
                                 placeholder={t('simulation_your_answer_placeholder')}
                                 className="w-full h-24 p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                             />
                         </div>
                          <div className="mt-3 text-right">
                            <button onClick={() => toggleReveal(index)} className="text-sm font-semibold text-[var(--accent-primary)] hover:underline">
                                {revealedAnswers.has(index) ? t('simulation_qa_hide_suggestion') : t('simulation_qa_compare_with_ai')}
                            </button>
                         </div>
                         {revealedAnswers.has(index) && (
                             <div className="mt-3 p-3 bg-[var(--accent-primary)]/10 rounded-md border border-[var(--accent-primary)]/20">
                                 <p className="text-sm font-semibold text-[var(--accent-primary)] mb-1">{t('simulation_qa_ai_suggestion_label')}</p>
                                 <p className="text-sm text-[var(--text-primary)]">{q.suggestedAnswer}</p>
                             </div>
                         )}
                    </div>
                ))}
            </div>
        ) : <p className="text-[var(--text-secondary)]">{t('simulation_data_not_generated')}</p>}
      </ModuleCard>

      <ModuleCard
        title={t('simulation_closing_title')}
        description={t('simulation_closing_desc')}
        icon={<LightBulbIcon className="h-8 w-8" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 className="font-bold text-lg text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    {React.cloneElement(AI_LAWYERS[1].icon, { className: "h-6 w-6"})}
                    <span>{t('excel_sim_closing_lead')}</span>
                </h4>
                 {closingArgumentLead ? renderMarkdown(closingArgumentLead) : <p className="text-[var(--text-secondary)]">{t('simulation_data_not_generated')}</p>}
            </div>
             <div>
                <h4 className="font-bold text-lg text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    {React.cloneElement(AI_LAWYERS[2].icon, { className: "h-6 w-6"})}
                    <span>{t('excel_sim_closing_defender')}</span>
                </h4>
                 {closingArgumentDefender ? renderMarkdown(closingArgumentDefender) : <p className="text-[var(--text-secondary)]">{t('simulation_data_not_generated')}</p>}
            </div>
        </div>
      </ModuleCard>

    </div>
  );
};