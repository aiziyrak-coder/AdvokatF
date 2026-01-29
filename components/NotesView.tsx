import React, { useState } from 'react';
import type { Case, Note } from '../types';
import { PencilSquareIcon, PlusIcon, TrashIcon } from './icons';

interface NotesViewProps {
    caseData: Case | null;
    onUpdateNotes: (newNotes: Note[]) => void;
    t: (key: string) => string;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

export const NotesView: React.FC<NotesViewProps> = ({ caseData, onUpdateNotes, t }) => {
    const [newNoteContent, setNewNoteContent] = useState('');
    
    const notes = caseData?.notes || [];

    const handleAddNote = () => {
        if (newNoteContent.trim() === '') return;
        const newNote: Note = {
            id: `note-${Date.now()}`,
            content: newNoteContent,
            timestamp: new Date().toISOString(),
        };
        onUpdateNotes([newNote, ...notes]);
        setNewNoteContent('');
    };

    const handleDeleteNote = (id: string) => {
        onUpdateNotes(notes.filter(note => note.id !== id));
    };

    return (
        <div className="space-y-6 animate-assemble-in">
            <div className="polished-pane p-4">
                <textarea
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    placeholder={t('notes_add_placeholder')}
                    className="w-full h-24 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                />
                <div className="text-right mt-2">
                    <button onClick={handleAddNote} className="flex items-center justify-center gap-2 bg-[var(--accent-primary)] text-black font-bold py-2 px-5 rounded-lg">
                        <PlusIcon className="h-5 w-5" />
                        <span>{t('button_add_note')}</span>
                    </button>
                </div>
            </div>
            
            <div className="space-y-4">
                {notes.map(note => (
                    <div key={note.id} className="polished-pane p-4">
                        <p className="text-[var(--text-primary)] whitespace-pre-wrap">{note.content}</p>
                        <div className="flex justify-between items-center mt-3 text-xs text-[var(--text-secondary)]">
                            <span>{formatDate(note.timestamp)}</span>
                            <button onClick={() => handleDeleteNote(note.id)} className="hover:text-red-400">
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {notes.length === 0 && (
                    <p className="text-center text-[var(--text-secondary)] py-8">{t('notes_empty')}</p>
                )}
            </div>
        </div>
    );
};