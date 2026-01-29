import React, { useState, useEffect, useRef } from 'react';
import type { AiLawyerResponse } from '../types';
import { AI_LAWYERS, AI_INVESTIGATORS } from '../constants';
import { ThumbDownIcon, ThumbUpIcon, XMarkIcon } from './icons';
import { getArticleSummary } from '../services/geminiService';

interface AiLawyerCardProps {
  response: AiLawyerResponse;
  onRate: (rating: 'up' | 'down') => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
  isInvestigationStage: boolean;
}

const LegalCodeTooltip: React.FC<{
    content: string;
    isLoading: boolean;
    x: number;
    y: number;
    onClose: () => void;
}> = ({ content, isLoading, x, y, onClose }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: y, left: x });

    useEffect(() => {
        if (tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect();
            let newLeft = x;
            if (newLeft + rect.width > window.innerWidth - 16) {
                newLeft = window.innerWidth - rect.width - 16;
            }
            setPosition({ top: y + 8, left: newLeft });
        }
    }, [x, y, content, isLoading]);

    return (
        <div
            ref={tooltipRef}
            style={{ top: position.top, left: position.left }}
            className="fixed z-50 w-full max-w-sm p-3 polished-pane shadow-2xl animate-assemble-in"
        >
            <button onClick={onClose} className="absolute top-2 right-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <XMarkIcon className="w-4 h-4" />
            </button>
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-[var(--accent-primary)] rounded-full animate-pulse"></span>
                    <span className="text-sm text-[var(--text-secondary)]">Sharh olinmoqda...</span>
                </div>
            ) : (
                <p className="text-sm text-[var(--text-primary)]">{content}</p>
            )}
        </div>
    );
};


export const AiLawyerCard: React.FC<AiLawyerCardProps> = ({ response, onRate, t, isInvestigationStage }) => {
  const personas = isInvestigationStage ? AI_INVESTIGATORS : AI_LAWYERS;
  const persona = personas.find(p => p.name === response.lawyerName);

  const [activeTooltip, setActiveTooltip] = useState<{ code: string; x: number; y: number } | null>(null);
  const [tooltipContent, setTooltipContent] = useState<Record<string, string>>({});
  const [loadingCode, setLoadingCode] = useState<string | null>(null);

  const handleCodeClick = async (code: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const newTooltip = { code, x: rect.left, y: rect.bottom + window.scrollY };

    if (activeTooltip?.code === code) {
        setActiveTooltip(null);
        return;
    }
    
    setActiveTooltip(newTooltip);

    if (!tooltipContent[code]) {
        setLoadingCode(code);
        try {
            const summary = await getArticleSummary(code, t);
            setTooltipContent(prev => ({ ...prev, [code]: summary }));
        } catch (error) {
            console.error("Failed to get article summary:", error);
            setTooltipContent(prev => ({ ...prev, [code]: "Ma'lumot olishda xatolik." }));
        } finally {
            setLoadingCode(null);
        }
    }
  };

  if (!persona) {
    return null; // Or a fallback UI
  }

  const personaKey = persona.name.toLowerCase().replace(/ /g, '_').replace('-', '_');
  const personaNameKey = isInvestigationStage ? `persona_investigator_${personaKey}_name` : `persona_${personaKey}_name`;
  const personaTitleKey = isInvestigationStage ? `persona_investigator_${personaKey}_title` : `persona_${personaKey}_title`;
  const personaDescriptionKey = isInvestigationStage ? `persona_investigator_${personaKey}_description` : `persona_${personaKey}_description`;
  
  const personaName = t(personaNameKey);
  const personaTitle = t(personaTitleKey);
  const personaDescription = t(personaDescriptionKey);

  const formattedAnalysis = response.analysis.split('\n').map((line, index) => {
    // Regex to match markdown links OR legal codes.
    const combinedRegex = new RegExp(`(\\[[^\\]]+\\]\\([^\\)]+\\))|(${t('legal_code_regex')})`, 'gi');
    
    // Using split with a regex that has capturing groups will include the separators in the result array.
    const parts = line.split(combinedRegex).filter(p => p); // Filter out undefined/empty parts
    
    return (
      <p key={index} className="mb-2">
        {parts.map((part, i) => {
            // Check if it's a markdown link
            if (part.match(/^\[.*\]\(.*\)$/)) {
                const text = part.substring(part.indexOf('[') + 1, part.indexOf(']'));
                const url = part.substring(part.indexOf('(') + 1, part.indexOf(')'));
                return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--accent-primary)] hover:underline cursor-pointer transition-colors">
                        {text}
                    </a>
                );
            } 
            // Check if it's a legal code
            else if (part.match(new RegExp(`^${t('legal_code_regex')}$`, 'i'))) {
                 return (
                    <button 
                        key={i}
                        onClick={(e) => handleCodeClick(part, e)}
                        className="font-bold text-[var(--accent-primary)] hover:underline cursor-pointer transition-colors"
                    >
                        {part}
                    </button>
                );
            } 
            // It's plain text
            else {
                return <React.Fragment key={i}>{part}</React.Fragment>;
            }
        })}
      </p>
    );
  });

  return (
    <>
      {activeTooltip && (
            <LegalCodeTooltip
                content={tooltipContent[activeTooltip.code] || ''}
                isLoading={loadingCode === activeTooltip.code}
                x={activeTooltip.x}
                y={activeTooltip.y}
                onClose={() => setActiveTooltip(null)}
            />
        )}
    <div className="polished-pane overflow-hidden interactive-hover">
      <div className="p-5">
        <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full ${persona.bgColor} border border-white/10 shadow-lg ${persona.glowColor}`}>
                <span className={persona.textColor}>{React.cloneElement(persona.icon, { className: "h-8 w-8"})}</span>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${persona.textColor}`}>{personaName}</h3>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{personaTitle}</p>
                <p className="text-xs text-[var(--text-secondary)] italic mt-1 max-w-sm">{personaDescription}</p>
              </div>
            </div>
            {/* Rating Buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                <button 
                    onClick={() => onRate('up')} 
                    className={`p-1.5 rounded-full transition-all duration-200 ${response.rating === 'up' ? 'bg-lime-500/20 text-lime-400 scale-110 ring-2 ring-lime-500/50' : 'text-gray-500 hover:bg-[var(--bg-secondary)] hover:text-gray-300'}`}
                    aria-label={t('button_rate_up')}
                >
                    <ThumbUpIcon className="h-5 w-5" />
                </button>
                <button 
                    onClick={() => onRate('down')} 
                    className={`p-1.5 rounded-full transition-all duration-200 ${response.rating === 'down' ? 'bg-red-500/20 text-red-400 scale-110 ring-2 ring-red-500/50' : 'text-gray-500 hover:bg-[var(--bg-secondary)] hover:text-gray-300'}`}
                    aria-label={t('button_rate_down')}
                >
                    <ThumbDownIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
        <div className="mt-4 pl-16 text-[var(--text-primary)] leading-relaxed">
          {formattedAnalysis}
        </div>
      </div>
    </div>
    </>
  );
};