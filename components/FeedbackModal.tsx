import React, { useState } from 'react';
import type { View, FeedbackData } from '../types';
import { XMarkIcon, StarIcon, CheckCircleIcon } from './icons';

interface FeedbackModalProps {
    caseId: string;
    view: View;
    onClose: () => void;
    onSubmit: (data: FeedbackData) => void;
    t: (key: string) => string;
}

const TagButton: React.FC<{ tag: string, isSelected: boolean, onToggle: () => void }> = ({ tag, isSelected, onToggle }) => (
    <button
        onClick={onToggle}
        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
            isSelected 
                ? 'bg-[var(--accent-primary)] text-black border-transparent' 
                : 'bg-transparent border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-white'
        }`}
    >
        {tag}
    </button>
);

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ caseId, view, onClose, onSubmit, t }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const tags = [
        t('feedback_tag_inaccurate'),
        t('feedback_tag_helpful'),
        t('feedback_tag_unclear'),
        t('feedback_tag_other'),
    ];

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = () => {
        const feedbackData: FeedbackData = {
            caseId,
            view,
            rating,
            tags: selectedTags,
            comment,
            timestamp: new Date().toISOString(),
        };
        onSubmit(feedbackData);
        setIsSubmitted(true);
        setTimeout(() => {
            onClose();
        }, 2000);
    };
    
    if (isSubmitted) {
        return (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="polished-pane shadow-2xl w-full max-w-md relative animate-assemble-in p-8 text-center">
                    <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">{t('feedback_thank_you')}</h2>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="polished-pane shadow-2xl w-full max-w-lg relative animate-assemble-in p-6 sm:p-8 max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-white transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-center mb-6">{t('feedback_modal_title')}</h2>
                
                <div className="space-y-5">
                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 text-center">{t('feedback_rating_label')}</label>
                        <div className="flex justify-center items-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button 
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-transform transform hover:scale-125 focus:outline-none"
                                >
                                    <StarIcon 
                                        className="h-8 w-8" 
                                        fill={(hoverRating || rating) >= star ? 'var(--accent-primary)' : 'none'}
                                        stroke={(hoverRating || rating) >= star ? 'var(--accent-primary)' : 'currentColor'}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                         <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3 text-center">{t('feedback_tags_label')}</label>
                         <div className="flex justify-center flex-wrap gap-2">
                            {tags.map(tag => (
                                <TagButton 
                                    key={tag}
                                    tag={tag}
                                    isSelected={selectedTags.includes(tag)}
                                    onToggle={() => handleTagToggle(tag)}
                                />
                            ))}
                         </div>
                    </div>
                    
                    {/* Comment */}
                    <div>
                        <label htmlFor="feedback-comment" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('feedback_comment_label')}</label>
                        <textarea
                            id="feedback-comment"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder={t('feedback_comment_placeholder')}
                            className="w-full h-28 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent resize-y"
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0 && comment.trim() === ''}
                        className="w-full bg-[var(--accent-primary)] text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('button_submit_feedback')}
                    </button>
                </div>
            </div>
        </div>
    );
};