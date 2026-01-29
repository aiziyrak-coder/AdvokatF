import React, { useState, useCallback, useEffect } from 'react';
import { translations } from './translations';
import type { View, Case, CaseFile, CaseParticipant, Task, EvidenceItem, Note } from './types';

import Cookies from 'js-cookie';

// Components
import { Navigation } from './components/Navigation';
import { CaseNavigation } from './components/CaseNavigation';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CaseInputForm } from './components/CaseInputForm';
import { AiDebateView } from './components/AiDebateView';
import { SummaryView } from './components/SummaryView';
import { SettingsView } from './components/SettingsView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { SimulationView } from './components/SimulationView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { PricingView } from './components/PricingView';
import { FeedbackModal } from './components/FeedbackModal';
import { TasksView } from './components/TasksView';
import { DocumentGeneratorView } from './components/DocumentGeneratorView';
import { EvidenceView } from './components/EvidenceView';
import { NotesView } from './components/NotesView';
import { ResearchView } from './components/ResearchView';

// Services
import { 
    getLegalStrategy, 
    getCourtroomScenario, 
    getCrossExaminationQuestions, 
    getClosingArgument 
} from './services/geminiService';
import { createCase, getCases } from './services/caseService';
import { getCurrentUser } from './services/authService';

// Icons
import { AnalysisIcon, DashboardIcon, SettingsIcon, DatabaseIcon, TheaterIcon, DebateIcon, StrategyIcon, CheckBadgeIcon, DocumentTextIcon, BeakerIcon, PencilSquareIcon, ResearchIcon } from './components/icons';

const useTranslation = () => {
    const [language, setLanguage] = useState<string>(() => {
        const savedLang = localStorage.getItem('language');
        return savedLang || 'uz-cyr';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = useCallback((key: string, replacements?: { [key: string]: string }) => {
        let translation = translations[language]?.[key] || translations['uz-cyr']?.[key] || translations['uz-lat']?.[key] || key;
        if (replacements) {
            Object.keys(replacements).forEach(rKey => {
                translation = translation.replace(new RegExp(`{{${rKey}}}`, 'g'), replacements[rKey]);
            });
        }
        return translation;
    }, [language]);

    return { t, setLanguage, language };
};

const useTheme = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        return savedTheme || 'dark';
    });

    useEffect(() => {
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(theme === 'light' ? 'light-mode' : 'dark-mode');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return { theme, toggleTheme };
};

const generateDeviceId = () => {
  const navigatorInfo = window.navigator;
  const screenInfo = window.screen;
  let fingerprint = navigatorInfo.userAgent + screenInfo.height + 'x' + screenInfo.width + navigatorInfo.language + new Date().getTimezoneOffset() + navigatorInfo.hardwareConcurrency + navigatorInfo.platform;
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i);
    hash = hash & hash;
  }
  return `DEV-${Math.abs(hash).toString(16).toUpperCase()}`;
};

const App: React.FC = () => {
    const { t, setLanguage, language } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true); // Initial auth check
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [deviceList, setDeviceList] = useState<string[]>([]); // Qaytarildi
    const [loginError, setLoginError] = useState<string | null>(null);
    
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [activeCaseView, setActiveCaseView] = useState<View>('knowledge_base');
    const [history, setHistory] = useState<Case[]>([]);
    const [currentCase, setCurrentCase] = useState<Case | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // Initial Auth Check and Data Loading
    useEffect(() => {
        const checkAuth = async () => {
            const token = Cookies.get('access_token');
            const identifier = localStorage.getItem('deviceIdentifier') || generateDeviceId();
            setDeviceId(identifier);
            
            if (token) {
                try {
                    // Token validligini tekshirish uchun user profilini olib ko'ramiz
                    await getCurrentUser();
                    setAuthToken(token); // Token faqat profil muvaffaqiyatli yuklangandan keyin o'rnatiladi
                    await loadCases();
                } catch (e) {
                    console.error("Auth check failed:", e);
                    // Token eskirgan bo'lsa logout qilish kerak
                    // handleLogout ni bu yerda to'g'ridan-to'g'ri chaqira olmaymiz (useCallback dependency loop),
                    // shuning uchun manual tozalaymiz
                    Cookies.remove('access_token');
                    Cookies.remove('refresh_token');
                    setAuthToken(null);
                } finally {
                    setIsAuthLoading(false);
                }
            } else {
                setIsAuthLoading(false);
            }
        };
        checkAuth();
    }, []);

    const loadCases = async () => {
        try {
            const cases = await getCases();
            const mappedCases = cases.map((c: any) => ({
                id: c.id.toString(), // Ensure ID is string
                title: c.title,
                caseDetails: c.description || c.case_data?.details || '',
                files: [], 
                result: c.analysis_result || {},
                courtStage: c.case_data?.courtStage || '',
                clientRole: c.case_data?.clientRole || '',
                clientName: c.case_data?.clientName || '',
                participants: c.participants || [],
                tasks: [],
                timeline: [],
                evidence: [],
                notes: [],
                tags: [c.status],
                folder: null,
                timestamp: c.created_at
            }));
            setHistory(mappedCases);
        } catch (e) {
            console.error("Failed to load cases", e);
        }
    };

    const handleNavigate = useCallback((view: View) => {
        if (['dashboard', 'analyze', 'settings'].includes(view)) {
            setCurrentCase(null);
        }
        setActiveView(view);
    }, []);

    const handleLogin = useCallback(async (token: string) => {
        setLoginError(null);
        setAuthToken(token);
        
        // Token endi cookie orqali keladi va avtomatik saqlanadi.
        // Biz faqat state yangilaymiz va data yuklaymiz.
        await loadCases();
    }, []);

    const handleLogout = useCallback(() => {
        Cookies.remove('authToken'); // Legacy support
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        setAuthToken(null);
        setHistory([]);
        handleNavigate('dashboard');
    }, [handleNavigate]);

    const handleRemoveDevice = useCallback((deviceToRemove: string) => {
        // Device management logic needed on backend
        console.log("Remove device logic pending backend implementation");
    }, []);

    const handleAnalyze = useCallback(async (courtType: string, caseDetails: string, files: CaseFile[], courtStage: string, finalParticipants: CaseParticipant[], client: {name: string, role: string}) => {
        setIsLoading(true);
        try {
            const { name: clientName, role: clientRole } = client;
            const result = await getLegalStrategy(caseDetails, files, courtType, courtStage, clientRole, clientName, finalParticipants, t);
            
            let newTitle = '';
            let opponentName = finalParticipants.find(p => p.name !== clientName && !p.role.toLowerCase().includes('guvoh'))?.name || '';
            if (opponentName) newTitle = t('case_title_vs_template', { clientName, opponentName });
            else newTitle = `${t(`court_type_${courtType.toLowerCase().replace("'", "")}`)}: ${t('case_title_template', { clientName })}`;

            const newCase: Case = {
                id: `temp-${Date.now()}`, // Temporary ID until saved
                title: newTitle,
                caseDetails: caseDetails,
                files: files.map(({content, ...rest}) => rest),
                result,
                courtStage: courtStage,
                clientRole: clientRole,
                clientName: clientName,
                participants: finalParticipants,
                tasks: (result.suggestedTasks || []).map((taskText, index) => ({ id: `task-${Date.now()}-${index}`, text: taskText, completed: false })),
                timeline: [], evidence: [], notes: [], tags: [courtType, courtStage], folder: null, timestamp: new Date().toISOString()
            };

            // Save to backend
            try {
                const savedCase = await createCase(newCase);
                // Reload cases to get the one with real ID from backend
                await loadCases();
                
                // Find the newly loaded case or use temp (logic to update currentCase)
                // For smoother UX, we just update currentCase with new ID if possible, 
                // but reloading whole list is safer for sync.
                setCurrentCase({ ...newCase, id: savedCase.id.toString() });
            } catch (err) {
                console.error("Failed to save case to backend", err);
                // Fallback to local state if backend fails
                setHistory(prev => [newCase, ...prev]);
                setCurrentCase(newCase);
                alert(t('error_server_offline'));
            }

            setActiveCaseView('knowledge_base');
        } catch (error: any) {
            console.error("Analysis Error:", error);
            alert(error.message || t('error_full_analysis'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    const handleSelectCase = useCallback((selectedCase: Case) => {
        setCurrentCase(selectedCase);
        setActiveCaseView('knowledge_base');
    }, []);
    
    const updateCaseInHistory = (updatedCase: Case) => {
        try {
            setCurrentCase(updatedCase);
            setHistory(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
            // TODO: Call updateCase API
        } catch (e) { console.error("Update failed", e); }
    };

    const handleDeleteCase = useCallback((id: string) => {
        setHistory(prev => prev.filter(c => c.id !== id));
        if (currentCase?.id === id) handleNavigate('dashboard');
        // TODO: Call deleteCase API
    }, [currentCase, handleNavigate]);
    
    const handleNewAnalysis = () => handleNavigate('analyze');

    const handleRateDebate = useCallback((debateIndex: number, rating: 'up' | 'down') => {
        if (!currentCase) return;
        const updatedResult = { ...currentCase.result };
        updatedResult.debate[debateIndex].rating = rating;
        updateCaseInHistory({ ...currentCase, result: updatedResult });
    }, [currentCase]);

    const handleSimulation = useCallback(async () => {
        if (!currentCase) return;
        setIsSimulating(true);
        try {
            const [scenario, questions, closingLead, closingDefender] = await Promise.all([
                getCourtroomScenario(currentCase.caseDetails, currentCase.files, currentCase.tags[0], currentCase.courtStage, currentCase.clientRole, currentCase.clientName, currentCase.participants, t),
                getCrossExaminationQuestions(currentCase.caseDetails, currentCase.files, currentCase.tags[0], currentCase.courtStage, currentCase.clientRole, currentCase.clientName, currentCase.participants, t),
                getClosingArgument(currentCase.caseDetails, currentCase.files, currentCase.tags[0], currentCase.courtStage, currentCase.clientRole, currentCase.clientName, currentCase.participants, 'lead', t),
                getClosingArgument(currentCase.caseDetails, currentCase.files, currentCase.tags[0], currentCase.courtStage, currentCase.clientRole, currentCase.clientName, currentCase.participants, 'defender', t),
            ]);
            updateCaseInHistory({ ...currentCase, result: { ...currentCase.result, courtroomScenario: scenario, crossExaminationQuestions: questions, closingArgumentLead: closingLead, closingArgumentDefender: closingDefender }});
        } catch (error: any) {
            alert(error.message || t('error_simulation_analysis'));
        } finally {
            setIsSimulating(false);
        }
    }, [currentCase, t]);

    const handleUpdateTasks = (newTasks: Task[]) => currentCase && updateCaseInHistory({ ...currentCase, tasks: newTasks });
    const handleUpdateEvidence = (newEvidence: EvidenceItem[]) => currentCase && updateCaseInHistory({ ...currentCase, evidence: newEvidence });
    const handleUpdateNotes = (newNotes: Note[]) => currentCase && updateCaseInHistory({ ...currentCase, notes: newNotes });

    const currentGlobalView = currentCase ? activeCaseView : activeView;
    const grantAccess = () => true;

    // Show loading spinner while checking auth
    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
                <LoadingSpinner t={t} />
            </div>
        );
    }

    // Auth Guard
    if (!authToken) {
        return <PricingView onLogin={handleLogin} t={t} loginError={loginError} />;
    }

    const VIEW_DATA: { [key in View]?: { title: string; description: string; icon: React.ReactElement } } = {
        dashboard: { title: t('view_dashboard_title'), description: t('view_dashboard_description'), icon: <DashboardIcon /> },
        analyze: { title: t('view_analyze_title'), description: t('view_analyze_description'), icon: <AnalysisIcon /> },
        research: { title: t('view_research_title'), description: t('view_research_description'), icon: <ResearchIcon /> },
        settings: { title: t('view_settings_title'), description: t('view_settings_description'), icon: <SettingsIcon /> },
        knowledge_base: { title: t('view_knowledge_base_title'), description: t('view_knowledge_base_description'), icon: <DatabaseIcon /> },
        evidence: { title: t('view_evidence_title'), description: t('view_evidence_description'), icon: <BeakerIcon /> },
        tasks: { title: t('view_tasks_title'), description: t('view_tasks_description'), icon: <CheckBadgeIcon/> },
        documents: { title: t('view_documents_title'), description: t('view_documents_description'), icon: <DocumentTextIcon/> },
        notes: { title: t('view_notes_title'), description: t('view_notes_description'), icon: <PencilSquareIcon /> },
        simulation: { title: t('view_simulation_title'), description: t('view_simulation_description'), icon: <TheaterIcon /> },
        debate: { title: t('view_debate_title'), description: t('view_debate_description'), icon: <DebateIcon /> },
        summary: { title: t('view_summary_title'), description: t('view_summary_description'), icon: <StrategyIcon /> },
    };

    return (
        <main className="main-container flex flex-col min-h-screen min-h-[100dvh] h-full overflow-x-hidden">
            {(isLoading || isSimulating) && <LoadingSpinner t={t} />}
            {showFeedbackModal && currentCase && <FeedbackModal caseId={currentCase.id} view={activeCaseView} onClose={() => setShowFeedbackModal(false)} onSubmit={(data) => {}} t={t} />}
            
            {/* Top Navigation */}
            <Navigation activeView={activeView} setActiveView={handleNavigate} onLogout={handleLogout} t={t} theme={theme} toggleTheme={toggleTheme} language={language} setLanguage={setLanguage} deviceId={deviceId} />
            
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scroll-smooth scroll-touch pt-20 md:pt-22">
                    <div className="p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 w-full max-w-[100vw] flex-grow mx-auto">
                       {currentCase ? (
                           <div className="w-full">
                               <Header title={VIEW_DATA[currentGlobalView]?.title || t('app_name')} description={VIEW_DATA[currentGlobalView]?.description || t('app_subtitle')} icon={VIEW_DATA[currentGlobalView]?.icon || <DashboardIcon />} theme={theme} toggleTheme={toggleTheme} language={language} setLanguage={setLanguage} deviceId={deviceId} t={t} hideControls={true} />
                               <CaseNavigation activeView={activeCaseView} setActiveView={setActiveCaseView} caseData={currentCase} t={t} />
                               <div className="mt-4 sm:mt-6 md:mt-8">
                                   {(() => {
                                       switch (activeCaseView) {
                                           case 'knowledge_base': return <KnowledgeBaseView caseData={currentCase} onNewAnalysis={handleNewAnalysis} onArticleSelect={() => {}} onOpenFeedback={() => setShowFeedbackModal(true)} t={t} />;
                                           case 'evidence': return <EvidenceView caseData={currentCase} onUpdateEvidence={handleUpdateEvidence} t={t} />;
                                           case 'tasks': return <TasksView tasks={currentCase?.tasks || []} onUpdateTasks={handleUpdateTasks} checkTokens={grantAccess} t={t} />;
                                           case 'documents': return <DocumentGeneratorView caseData={currentCase} onNewAnalysis={handleNewAnalysis} checkTokens={grantAccess} t={t} />;
                                           case 'notes': return <NotesView caseData={currentCase} onUpdateNotes={handleUpdateNotes} t={t} />;
                                           case 'debate': return <AiDebateView caseData={currentCase} onNewAnalysis={handleNewAnalysis} onRate={handleRateDebate} t={t} />;
                                           case 'simulation': return <SimulationView caseData={currentCase} onNewAnalysis={handleNewAnalysis} isLoading={isSimulating} onGenerateSimulation={handleSimulation} onOpenFeedback={() => setShowFeedbackModal(true)} t={t} />;
                                           case 'summary': return <SummaryView caseData={currentCase} onNewAnalysis={handleNewAnalysis} onOpenFeedback={() => setShowFeedbackModal(true)} onUpdateCase={updateCaseInHistory} checkTokens={grantAccess} t={t} />;
                                           default: return null;
                                       }
                                   })()}
                               </div>
                           </div>
                       ) : (
                           <div className="w-full">
                               {(() => {
                                   switch (activeView) {
                                       case 'dashboard': return <DashboardView onStartAnalysis={handleNewAnalysis} cases={history} onNavigate={handleNavigate} onSelectCase={handleSelectCase} onDeleteCase={handleDeleteCase} t={t} language={language} />;
                                       case 'analyze': return <CaseInputForm onAnalyze={handleAnalyze} isLoading={isLoading} t={t} />;
                                       case 'research': return <ResearchView initialQuery={null} onQueryHandled={() => {}} checkTokens={grantAccess} t={t} language={language} />;
                                       case 'settings': return <SettingsView t={t} deviceId={deviceId} deviceList={deviceList} onRemoveDevice={handleRemoveDevice} />;
                                       default: return null;
                                   }
                               })()}
                           </div>
                       )}
                    </div>
                    {/* Footerni alohida sticky joyga chiqarish */}
                    <footer className="w-full p-4 sm:p-6 mt-8 sm:mt-12 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/40 backdrop-blur-md shrink-0 pb-safe-bottom">
                        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-[10px] xs:text-xs text-[var(--text-secondary)] px-2 sm:px-4 text-center">
                            <span>© 2026 <a href="https://cdcgroup.uz" target="_blank" rel="noopener noreferrer" className="footer-link font-bold text-[var(--text-primary)]">CDCGroup</a>. {t('footer_rights')}</span>
                            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[var(--border-color)]"></span>
                            <span>{t('footer_supporter')} <a href="https://cdcgroup.uz" target="_blank" rel="noopener noreferrer" className="footer-link font-bold text-[var(--text-primary)]">CraDev company</a></span>
                        </div>
                    </footer>
                </div>
            </div>
        </main>
    );
};

export default App;
