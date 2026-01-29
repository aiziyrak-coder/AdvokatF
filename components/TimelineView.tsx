import React, { useState, useEffect } from 'react';
import type { Case, TimelineEvent } from '../types';
import { HistoryIcon } from './icons';
import { generateTimeline } from '../services/geminiService';

interface TimelineViewProps {
    caseData: Case | null;
    onUpdateTimeline: (newTimeline: TimelineEvent[]) => void;
    checkTokens: (cost: number) => boolean;
    t: (key: string) => string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ caseData, onUpdateTimeline, checkTokens, t }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [sortedTimeline, setSortedTimeline] = useState<TimelineEvent[]>([]);

    useEffect(() => {
        if (caseData?.timeline) {
            const sorted = [...caseData.timeline].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setSortedTimeline(sorted);
        }
    }, [caseData?.timeline]);

    const handleGenerateTimeline = async () => {
        if (!caseData) return;
        
        setIsLoading(true);
        try {
            const newEvents = await generateTimeline(caseData.caseDetails, caseData.files, t);
            // Combine with existing events and remove duplicates
            const combined = [...caseData.timeline];
            newEvents.forEach(newEvent => {
                if (!combined.some(existing => existing.date === newEvent.date && existing.description === newEvent.description)) {
                    combined.push(newEvent);
                }
            });
            onUpdateTimeline(combined);
        } catch (error) {
            console.error("Failed to generate timeline:", error);
            alert(t('error_generic_title'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-assemble-in">
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleGenerateTimeline}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-[var(--accent-primary)] text-black font-bold py-2 px-5 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50"
                >
                    <HistoryIcon className="h-5 w-5" />
                    <span>{isLoading ? t('timeline_generating') : t('timeline_generate_button')}</span>
                </button>
            </div>

            <div className="polished-pane p-4">
                {sortedTimeline.length > 0 ? (
                    <div className="relative pl-6">
                        {/* Vertical line */}
                        <div className="absolute left-8 top-0 h-full w-0.5 bg-[var(--border-color)]"></div>

                        {sortedTimeline.map((event, index) => (
                            <div key={index} className="relative mb-6">
                                {/* Dot on the line */}
                                <div className="absolute left-8 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-[var(--accent-primary)] ring-4 ring-[var(--bg-secondary)]"></div>
                                <div className="ml-8">
                                    <p className="font-bold text-sm text-[var(--accent-primary)]">{new Date(event.date).toLocaleDateString()}</p>
                                    <p className="mt-1 text-slate-300">{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-500 py-8">{t('timeline_empty')}</p>
                )}
            </div>
        </div>
    );
};