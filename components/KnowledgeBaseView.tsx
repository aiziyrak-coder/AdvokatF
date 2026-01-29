
import React, { useState } from 'react';
import type { Case } from '../types';
import { EmptyState } from './EmptyState';
import { WinProbabilityGauge } from './SummaryView';
import { DatabaseIcon, CheckCircleIcon, ShieldExclamationIcon, LightBulbIcon, DocumentTextIcon, ChartBarIcon, ResearchIcon, DownloadIcon, UsersIcon, ChatBubbleLeftRightIcon, BrainIcon, ChevronDownIcon } from './icons';

interface KnowledgeBaseViewProps {
  caseData: Case | undefined | null;
  onNewAnalysis: () => void;
  onArticleSelect: (article: string) => void;
  onOpenFeedback: () => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const renderMarkdown = (text: string | undefined) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-bold text-slate-100 mt-8 mb-4 border-b border-[var(--border-color)] pb-2">{line.substring(3)}</h2>);
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-xl font-bold text-slate-100 mt-6 mb-3">{line.substring(4)}</h3>);
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
      elements.push(<ul key={`ul-start-${i}`} className="list-disc list-inside space-y-2 pl-4 my-3 text-slate-300">{listItems}</ul>);
      i = j - 1;
      continue;
    }

    const parts = line.split(/(\*\*.*?\*\*)/g).map((part, index) => 
        part.startsWith('**') ? <strong key={index} className="font-bold text-slate-100">{part.slice(2, -2)}</strong> : <span key={index}>{part}</span>
    );
    elements.push(<p key={i} className="mb-3 text-slate-400 leading-relaxed">{parts}</p>);
  }
  return elements;
};

const SectionCard: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
}> = ({ title, icon, children }) => (
    <div className="polished-pane p-3 sm:p-4 rounded-2xl sm:rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="text-[var(--accent-secondary)] flex-shrink-0 [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-5 sm:[&>svg]:w-5">{icon}</div>
                <h3 className="font-semibold text-base sm:text-lg text-[var(--text-primary)] truncate">{title}</h3>
            </div>
        </div>
        <div className="text-[var(--text-secondary)] text-xs sm:text-sm overflow-x-auto">
            {children}
        </div>
    </div>
);

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ caseData, onNewAnalysis, onArticleSelect, onOpenFeedback, t }) => {
  const [exportingType, setExportingType] = useState<'word' | null>(null);
  const result = caseData?.result;
  
  if (!caseData || !result || !result.knowledgeBase) {
    return (
        <EmptyState
            icon={<DatabaseIcon />}
            title={t('empty_state_kb_title')}
            message={t('empty_state_kb_message')}
            t={t}
        >
            <button
                onClick={onNewAnalysis}
                className="mt-6 bg-[var(--accent-primary)] text-black font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--glow-color)]"
            >
                {t('button_start_new_analysis')}
            </button>
        </EmptyState>
    )
  }

  const { knowledgeBase, winProbability, probabilityJustification, positiveFactors, negativeFactors, deepDiveAnalysis } = result;
  const sol = knowledgeBase.statuteOfLimitations;
  const [openInsightId, setOpenInsightId] = useState<string | null>(null);

  const insights = [
    {
      id: 'practical_plan',
      title: t('kb_insight_practical_plan_title'),
      desc: t('kb_insight_practical_plan_desc'),
      render: () => (
        <ul className="list-disc list-inside space-y-1 pl-5">
          {result.suggestedTasks?.length
            ? result.suggestedTasks.map((task, i) => <li key={i}>{task}</li>)
            : <li>{t('tasks_ai_prioritize') || 'AI tavsiya qilgan amaliy vazifalar bu yerda paydo bo‘ladi.'}</li>}
        </ul>
      ),
    },
    {
      id: 'evidence',
      title: t('kb_insight_evidence_title'),
      desc: t('kb_insight_evidence_desc'),
      render: () => (
        <ul className="list-disc list-inside space-y-1 pl-5">
          {(knowledgeBase.keyFacts || []).map((f, i) => (
            <li key={i}>
              <strong>{f.fact}:</strong> {f.relevance}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'laws',
      title: t('kb_insight_laws_title'),
      desc: t('kb_insight_laws_desc'),
      render: () => (
        <ul className="list-disc list-inside space-y-1 pl-5">
          {(knowledgeBase.applicableLaws || []).map((l, i) => (
            <li key={i}>
              <strong>{l.article}:</strong> {l.summary}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'risks',
      title: t('kb_insight_risks_title'),
      desc: t('kb_insight_risks_desc'),
      render: () => (
        <ul className="list-disc list-inside space-y-1 pl-5">
          {result.riskMatrix?.map((r, i) => (
            <li key={i}>
              <strong>{r.risk}</strong> — {r.mitigation} ({r.likelihood})
            </li>
          )) || null}
        </ul>
      ),
    },
    {
      id: 'counter',
      title: t('kb_insight_counter_title'),
      desc: t('kb_insight_counter_desc'),
      render: () => (
        <ul className="list-disc list-inside space-y-1 pl-5">
          {(knowledgeBase.weaknesses || []).map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      ),
    },
    {
      id: 'client',
      title: t('kb_insight_client_title'),
      desc: t('kb_insight_client_desc'),
      render: () => (
        <div className="space-y-2 text-sm">
          <p><strong>{t('kb_client_tag')}:</strong> {caseData.clientName} ({caseData.clientRole})</p>
          <ul className="list-disc list-inside space-y-1 pl-5">
            {result.suggestedTasks?.slice(0, 3).map((task, i) => <li key={i}>{task}</li>)}
          </ul>
        </div>
      ),
    },
    {
      id: 'witness',
      title: t('kb_insight_witness_title'),
      desc: t('kb_insight_witness_desc'),
      render: () => (
        <ul className="list-disc list-inside space-y-1 pl-5">
          {caseData.participants
            .filter(p => p.role !== t('client_role_boshqa'))
            .map((p, i) => (
              <li key={i}>
                <strong>{p.name}</strong> — {p.role}
              </li>
            ))}
        </ul>
      ),
    },
    {
      id: 'procedural_errors',
      title: t('kb_insight_procedural_errors_title'),
      desc: t('kb_insight_procedural_errors_desc'),
      render: () => (
        <ul className="list-disc list-inside space-y-1 pl-5">
          {(knowledgeBase.weaknesses || []).slice(0, 5).map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      ),
    },
    {
      id: 'future_appeal',
      title: t('kb_insight_future_appeal_title'),
      desc: t('kb_insight_future_appeal_desc'),
      render: () => (
        <ul className="list-disc list-inside space-y-1 pl-5">
          {result.suggestedTasks?.slice(3).map((task, i) => <li key={i}>{task}</li>)}
        </ul>
      ),
    },
    {
      id: 'deep_dive_raw',
      title: t('kb_deep_dive_title'),
      desc: t('kb_deep_dive_prompt'),
      render: () => (
        <div className="space-y-2">
          {renderMarkdown(deepDiveAnalysis)}
        </div>
      ),
    },
  ];

  const handleExportWord = () => {
    if (!caseData || !result) return;
    setExportingType('word');

    try {
        const listToHtml = (items: string[] | undefined, title: string) => `<h4>${title}</h4><ul>${(items || []).map(item => `<li>${item}</li>`).join('')}</ul>`;
        
        let html = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>${caseData.title}</title></head>
            <body>
                <h1>${t('pdf_kb_full_report_title')}</h1>
                <h2>${t('pdf_report_for_case', { caseTitle: caseData.title })}</h2>
                <hr/>
                <h3>${t('win_probability_details')}</h3>
                <p><strong>${t('pdf_win_probability')}: ${winProbability}%</strong> - <i>${probabilityJustification}</i></p>
                ${listToHtml(positiveFactors, t('win_probability_positive_factors'))}
                ${listToHtml(negativeFactors, t('win_probability_negative_factors'))}
                <hr/>
                <h3>${t('kb_participants_title')}</h3>
                <ul>${caseData.participants.map(p => `<li><strong>${p.name}</strong> - ${p.role}${p.name === caseData.clientName ? ` (${t('kb_client_tag')})` : ''}</li>`).join('')}</ul>
                <hr/>
                <h3>${t('kb_key_facts')}</h3>
                <ul>${(knowledgeBase.keyFacts || []).map(item => `<li><strong>${item.fact}:</strong> ${item.relevance}</li>`).join('')}</ul>
                <hr/>
                <h3>${t('kb_legal_issues')}</h3>
                ${listToHtml(knowledgeBase.legalIssues, '')}
                <hr/>
                 <h3>${t('kb_applicable_laws')}</h3>
                <ul>${(knowledgeBase.applicableLaws || []).map(item => `<li><strong>${item.article}:</strong> ${item.summary}</li>`).join('')}</ul>
                <hr/>
                <h3>${t('kb_strengths')}</h3>
                ${listToHtml(knowledgeBase.strengths, '')}
                <h3>${t('kb_weaknesses')}</h3>
                ${listToHtml(knowledgeBase.weaknesses, '')}
                <hr/>
                <h3>${t('kb_deep_dive_title')}</h3>
                <div>${deepDiveAnalysis || ''}</div>
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


  return (
    <section className="animate-assemble-in space-y-4 sm:space-y-6 max-w-full overflow-hidden">
        <div className="flex flex-wrap justify-end mb-2 gap-2">
            <button type="button" onClick={onOpenFeedback} className="flex items-center gap-2 polished-pane p-2.5 sm:p-2 rounded-xl text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] interactive-hover min-h-touch">
                <ChatBubbleLeftRightIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span>{t('button_feedback')}</span>
            </button>
            <button type="button" onClick={handleExportWord} disabled={!!exportingType} className="flex items-center gap-2 polished-pane p-2.5 sm:p-2 rounded-xl text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] interactive-hover disabled:opacity-50 min-h-touch">
                <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span>{exportingType ? t('button_generating') : t('button_export_word_kb')}</span>
            </button>
        </div>
        
        <WinProbabilityGauge 
            probability={winProbability}
            justification={probabilityJustification}
            positiveFactors={positiveFactors}
            negativeFactors={negativeFactors}
            t={t}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <SectionCard 
                title={t('kb_key_facts')}
                icon={<DocumentTextIcon/>}
            >
                <ul className="list-disc list-inside space-y-2 pl-9">
                    {(knowledgeBase.keyFacts || []).map((item, index) => <li key={index}><strong>{item.fact}:</strong> {item.relevance}</li>)}
                </ul>
            </SectionCard>
            <SectionCard 
                title={t('kb_participants_title')} 
                icon={<UsersIcon />}
            >
                 <ul className="list-disc list-inside space-y-2 pl-9">
                    {caseData.participants.map((p, index) => (
                        <li key={index}>
                            <strong>{p.name}</strong> - <span className="text-[var(--text-secondary)]">{p.role}</span>
                            {p.name === caseData.clientName && <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]">{t('kb_client_tag')}</span>}
                        </li>
                    ))}
                </ul>
            </SectionCard>
            {sol && (
                <SectionCard
                    title={t('kb_sol_title')}
                    icon={
                        sol.status === 'OK' ? <CheckCircleIcon className="text-green-400" /> :
                        <ShieldExclamationIcon className="text-red-400" />
                    }
                >
                    <div className="pl-9">
                        <p className={`font-bold ${
                            sol.status === 'OK' ? 'text-green-400' : 'text-red-400'
                        }`}>{t(`sol_status_${sol.status.replace(/ /g, '_').replace("'", "")}`)}</p>
                        <p className="text-[var(--text-secondary)] mt-1 text-xs">{sol.summary}</p>
                    </div>
                </SectionCard>
            )}
             <SectionCard 
                title={t('kb_applicable_laws')}
                icon={<ChartBarIcon/>}
            >
                <ul className="space-y-1 -mx-2">
                    {(knowledgeBase.applicableLaws || []).map((item, index) => (
                        <li key={index} className="rounded-md hover:bg-[var(--bg-secondary)] transition-all group transform hover:scale-[1.02]">
                           <div className="p-2 flex items-start gap-3">
                                <ResearchIcon className="h-4 w-4 text-[var(--accent-primary)] mt-1 flex-shrink-0" />
                                <div>
                                    <div className="flex items-center flex-wrap gap-2">
                                        <button
                                            onClick={() => onArticleSelect(item.article)}
                                            className="text-left font-semibold text-[var(--accent-primary)] group-hover:underline"
                                            title={t('case_input_research_article_tooltip', { article: item.article })}
                                        >
                                            {item.article}
                                        </button>
                                    </div>
                                    <p className="text-[var(--text-secondary)] text-xs mt-1">{item.summary}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </SectionCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <SectionCard 
                    title={t('kb_strengths')} 
                    icon={<CheckCircleIcon className="text-green-400"/>}
                >
                    <ul className="list-disc list-inside space-y-1 pl-9">
                        {(knowledgeBase.strengths || []).map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </SectionCard>
                 <SectionCard 
                    title={t('kb_weaknesses')} 
                    icon={<ShieldExclamationIcon className="text-red-400"/>}
                >
                    <ul className="list-disc list-inside space-y-1 pl-9">
                        {knowledgeBase.weaknesses.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </SectionCard>
            </div>
             <SectionCard 
                title={t('kb_legal_issues')} 
                icon={<LightBulbIcon/>}
            >
                 <ul className="list-disc list-inside space-y-1 pl-9">
                    {(knowledgeBase.legalIssues || []).map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </SectionCard>
        </div>

        {/* Combined Deep Dive Analysis Section */}
        {deepDiveAnalysis && (() => {
            // Agar deepDiveAnalysis JSON string bo'lsa, uni parse qilamiz
            let analysisText = deepDiveAnalysis;
            if (typeof deepDiveAnalysis === 'string' && deepDiveAnalysis.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(deepDiveAnalysis);
                    // Agar parse qilingan obyekt bo'lsa, uni formatlab ko'rsatamiz
                    if (typeof parsed === 'object' && parsed !== null) {
                        // Agar parsed obyekt ichida deepDiveAnalysis bo'lsa, uni olamiz
                        if (parsed.deepDiveAnalysis) {
                            analysisText = parsed.deepDiveAnalysis;
                        } else {
                            // Aks holda, barcha ma'lumotlarni formatlab ko'rsatamiz
                            analysisText = JSON.stringify(parsed, null, 2);
                        }
                    }
                } catch (e) {
                    // Parse qilishda xato bo'lsa, oddiy matn sifatida ko'rsatamiz
                    analysisText = deepDiveAnalysis;
                }
            }
            return (
                <div className="polished-pane p-4 sm:p-5 md:p-6 mt-4 sm:mt-6 md:mt-8 rounded-2xl sm:rounded-3xl overflow-hidden">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 border-b border-[var(--border-color)] pb-3 sm:pb-4">
                        <BrainIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--accent-primary)] flex-shrink-0" />
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold animated-gradient-text">{t('kb_deep_dive_title')}</h2>
                    </div>
                    <div className="space-y-3 sm:space-y-4 text-sm sm:text-base overflow-x-auto">
                        {renderMarkdown(analysisText)}
                    </div>
                </div>
            );
        })()}

        {/* Qo'shimcha chuqur tahlil bloklari – 10 ta button */}
        <div className="polished-pane p-4 sm:p-5 md:p-6 mt-4 sm:mt-6 md:mt-8 rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 border-b border-[var(--border-color)] pb-3 sm:pb-4">
            <BrainIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--accent-secondary)] flex-shrink-0" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--text-primary)]">
              {t('kb_insights_title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {insights.map(block => (
              <div key={block.id} className="polished-pane rounded-2xl p-3 sm:p-4">
                <button
                  type="button"
                  onClick={() => setOpenInsightId(openInsightId === block.id ? null : block.id)}
                  className="w-full text-left flex items-center justify-between gap-2"
                >
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
                      {block.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                      {block.desc}
                    </p>
                  </div>
                  <ChevronDownIcon
                    className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${
                      openInsightId === block.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openInsightId === block.id && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-secondary)] space-y-2 max-h-64 overflow-y-auto scroll-touch">
                    {block.render()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
    </section>
  );
};
