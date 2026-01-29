import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { sendResearchMessage, startResearchChat } from '../services/geminiService';
import { PaperAirplaneIcon } from './icons';
import { AI_LAWYERS } from '../constants';

interface ResearchViewProps {
    initialQuery: string | null;
    onQueryHandled: () => void;
    checkTokens: () => boolean;
    t: (key: string, replacements?: { [key: string]: string }) => string;
    language: string;
}

export const ResearchView: React.FC<ResearchViewProps> = ({ initialQuery, onQueryHandled, checkTokens, t, language }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    
    useEffect(() => {
        startResearchChat(t, language);
        setMessages([{
            id: 'initial',
            role: 'model',
            text: t('research_initial_greeting') || "Salom! Men sizga O'zbekiston Respublikasi qonunchiligi, yangi qarorlar, JK, FK, MK, Oliy Sud Plenum qarorlari va boshqa huquqiy masalalar bo'yicha yordam bera olaman. Savol bering!"
        }]);
    }, [t, language]);


    const sendMessage = useCallback(async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: new Date().toISOString(),
            role: 'user',
            text: messageText,
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setInput('');

        try {
            const modelResponse = await sendResearchMessage(userMessage.text, t, language);
            setMessages(prev => [...prev, modelResponse]);
        } catch (error) {
            console.error("Failed to get response from research model:", error);
            const errorMessage: ChatMessage = {
                id: 'error-' + new Date().toISOString(),
                role: 'model',
                text: t('research_error_message')
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, t, language, checkTokens]);


    useEffect(() => {
        if (initialQuery) {
            sendMessage(initialQuery);
            onQueryHandled();
        }
    }, [initialQuery, onQueryHandled, sendMessage]);


    useEffect(scrollToBottom, [messages]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const researcherPersona = AI_LAWYERS[0];

    return (
        <div className="h-full flex flex-col animate-assemble-in">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id}>
                        <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                               <div className={`p-2 rounded-full ${researcherPersona.bgColor} border border-white/10 flex-shrink-0`}>
                                   <span className={researcherPersona.textColor}>{React.cloneElement(researcherPersona.icon, { className: "h-6 w-6"})}</span>
                               </div>
                            )}
                            <div className={`max-w-xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-[var(--accent-primary)] text-black rounded-br-none' : 'polished-pane rounded-bl-none'}`}>
                               <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="ml-12 mt-2 flex flex-wrap gap-2">
                                <span className="text-xs font-semibold text-slate-500">{t('research_sources_label')}:</span>
                                {msg.sources.map((source, index) => (
                                    <a 
                                        key={index}
                                        href={source.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-cyan-900/50 text-cyan-400 px-2 py-0.5 rounded-md hover:bg-cyan-900/80 hover:text-cyan-300 transition-colors truncate"
                                    >
                                        {index+1}. {source.title || new URL(source.uri).hostname}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                 {isLoading && (
                     <div className="flex items-start gap-3">
                         <div className={`p-2 rounded-full ${researcherPersona.bgColor} border border-white/10 flex-shrink-0`}>
                            <span className={researcherPersona.textColor}>{React.cloneElement(researcherPersona.icon, { className: "h-6 w-6"})}</span>
                        </div>
                        <div className="polished-pane px-4 py-3 rounded-2xl rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 bg-[var(--accent-primary)] rounded-full animate-pulse delay-0"></span>
                                <span className="h-2 w-2 bg-[var(--accent-primary)] rounded-full animate-pulse delay-150"></span>
                                <span className="h-2 w-2 bg-[var(--accent-primary)] rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-[var(--border-color)]">
                <form onSubmit={handleFormSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('research_input_placeholder')}
                        disabled={isLoading}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full text-[var(--text-primary)] pl-5 pr-14 py-3 focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--accent-primary)] rounded-full text-black disabled:opacity-50 transition-transform hover:scale-110">
                        <PaperAirplaneIcon className="h-6 w-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};