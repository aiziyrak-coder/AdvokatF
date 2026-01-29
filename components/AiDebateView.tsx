import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Case, ChatMessage } from '../types';
import { AiLawyerCard } from './AiLawyerCard';
import { EmptyState } from './EmptyState';
import { AnalysisIcon, PaperAirplaneIcon } from './icons';
import { AI_LAWYERS } from '../constants';
import { sendCaseMessage, getSuggestedQuestions, startCaseChat, isApiKeyIssueDetected } from '../services/geminiService';

interface AiDebateViewProps {
  caseData: Case | undefined | null;
  onNewAnalysis: () => void;
  onRate: (debateIndex: number, rating: 'up' | 'down') => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

export const AiDebateView: React.FC<AiDebateViewProps> = ({ caseData, onNewAnalysis, onRate, t }) => {
  const [selectedLawyerName, setSelectedLawyerName] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const debate = caseData?.result?.debate;
  const personas = AI_LAWYERS;

  useEffect(() => {
    if (debate && debate.length > 0) {
      if (!selectedLawyerName || !debate.some(d => d.lawyerName === selectedLawyerName)) {
        setSelectedLawyerName(debate[0].lawyerName);
      }
    }
  }, [debate, selectedLawyerName]);

  useEffect(() => {
    if (showChat && caseData && !isApiKeyIssueDetected()) {
      try {
        startCaseChat(caseData, t);
        getSuggestedQuestions(caseData, t).then(questions => {
          setSuggestedQuestions(questions);
        });
        setChatMessages([{
          id: 'welcome',
          role: 'model',
          text: t('case_chat_welcome') || "Salom! Ushbu ish bo'yicha savollaringizga javob berishga tayyorman. Savol bering yoki quyidagi takliflardan birini tanlang."
        }]);
      } catch (error) {
        // Agar API key muammo bo'lsa, chatni yopamiz
        setShowChat(false);
      }
    } else if (isApiKeyIssueDetected() && showChat) {
      // Agar API key muammo bo'lsa, chatni yopamiz
      setShowChat(false);
    }
  }, [showChat, caseData, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChatMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoadingChat || !caseData) return;

    const userMessage: ChatMessage = {
      id: new Date().toISOString(),
      role: 'user',
      text: messageText,
    };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoadingChat(true);
    setChatInput('');

    try {
      const modelResponse = await sendCaseMessage(messageText, caseData, t);
      setChatMessages(prev => [...prev, modelResponse]);
    } catch (error) {
      console.error("Chat xatosi:", error);
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'model',
        text: t('chat_error_message') || "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  }, [isLoadingChat, caseData, t]);
  
  if (!debate) {
    return (
        <EmptyState 
            icon={<AnalysisIcon />}
            title={t('empty_state_debate_title')}
            message={t('empty_state_debate_message')}
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

  const selectedResponse = debate.find(response => response.lawyerName === selectedLawyerName);
  const selectedResponseIndex = debate.findIndex(response => response.lawyerName === selectedLawyerName);

  return (
    <section>
        <div className="mb-6">
            <div className="flex items-center justify-center flex-wrap gap-2">
            {debate.map((response) => {
                const persona = personas.find(p => p.name === response.lawyerName);
                if (!persona) return null;
                const isActive = selectedLawyerName === response.lawyerName;
                const personaKey = persona.name.toLowerCase().replace(/ /g, '_').replace('-', '_');
                const personaNameKey = `persona_${personaKey}_name`;
                const personaTitleKey = `persona_${personaKey}_title`;
                const personaDescriptionKey = `persona_${personaKey}_description`;
                
                return (
                <div key={response.lawyerName} className="relative group flex-1 sm:flex-auto">
                    <button
                        onClick={() => setSelectedLawyerName(response.lawyerName)}
                        className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
                        isActive
                            ? `bg-[var(--bg-secondary)] text-white shadow-lg scale-105 border-[var(--border-color)] ring-2 ring-[var(--accent-primary)]`
                            : `bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-pane)] hover:text-white hover:-translate-y-1 hover:scale-105`
                        }`}
                    >
                        <span className={persona.textColor}>
                        {React.cloneElement(persona.icon, { className: "h-6 w-6" })}
                        </span>
                        <span className="font-semibold text-sm whitespace-nowrap">{t(personaNameKey)}</span>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 w-64 left-1/2 -translate-x-1/2 p-3 text-xs text-left polished-pane rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        <p className="font-bold text-sm text-slate-200">{t(personaTitleKey)}</p>
                        <p className="text-slate-400 mt-1">{t(personaDescriptionKey)}</p>
                    </div>
                </div>
                );
            })}
            </div>
      </div>
      
      {/* Chat tugmasi - faqat API key muammo bo'lmasa ko'rsatiladi */}
      {!isApiKeyIssueDetected() && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-4 py-2 rounded-lg transition-all ${
              showChat 
                ? 'bg-[var(--accent-primary)] text-black' 
                : 'bg-[var(--bg-secondary)] text-white hover:bg-[var(--bg-pane)]'
            }`}
          >
            {showChat ? (t('hide_chat') || 'Chatni yopish') : (t('ask_about_case') || 'Ish bo\'yicha savol berish')}
          </button>
        </div>
      )}

      {showChat && !isApiKeyIssueDetected() && (
        <div className="polished-pane p-4 rounded-2xl mb-6">
          <h3 className="text-lg font-bold mb-4">{t('case_chat_title') || 'Ish bo\'yicha savol-javob'}</h3>
          
          {/* Savol takliflari */}
          {suggestedQuestions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-[var(--text-secondary)] mb-2">{t('suggested_questions') || 'Taklif etilgan savollar:'}</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendChatMessage(question)}
                    className="px-3 py-1.5 text-sm bg-[var(--bg-secondary)] hover:bg-[var(--bg-pane)] rounded-lg transition-all text-left"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          <div className="max-h-96 overflow-y-auto mb-4 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-[var(--accent-primary)] text-black rounded-br-none' 
                    : 'bg-[var(--bg-secondary)] text-white rounded-bl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendChatMessage(chatInput);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t('ask_question_placeholder') || 'Savol bering...'}
              className="flex-1 px-4 py-2 bg-[var(--bg-pane)] border border-[var(--border-color)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              disabled={isLoadingChat}
            />
            <button
              type="submit"
              disabled={isLoadingChat || !chatInput.trim()}
              className="px-4 py-2 bg-[var(--accent-primary)] text-black rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {selectedResponse && selectedResponseIndex !== -1 && (
          <AiLawyerCard 
            key={selectedResponseIndex} 
            response={selectedResponse} 
            onRate={(rating) => onRate(selectedResponseIndex, rating)}
            t={t}
            isInvestigationStage={false}
          />
        )}
      </div>
    </section>
  );
};