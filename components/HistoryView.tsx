import React, { useState, useMemo } from 'react';
import type { Case } from '../types';
import { EmptyState } from './EmptyState';
import { HistoryIcon, SearchIcon, FolderIcon, TagIcon, TrashIcon, ChevronDownIcon } from './icons';
import { ConfirmationModal } from './ConfirmationModal';

const getLocaleForLanguage = (language: string) => {
    switch (language) {
        case 'uz-lat': return 'uz-UZ';
        case 'uz-cyr': return 'uz-Cyrl-UZ';
        case 'kaa': return 'uz-UZ'; // Fallback to uz-UZ for date formatting as kaa might not be fully supported in all Intl implementations yet.
        case 'ru': return 'ru-RU';
        case 'en': return 'en-US';
        default: return 'en-US';
    }
}

const formatDate = (dateString: string, language: string) => {
    const date = new Date(dateString);
    const locale = getLocaleForLanguage(language);
    return date.toLocaleString(locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

interface HistoryViewProps {
    history: Case[];
    onSelect: (item: Case) => void;
    onDelete: (id: string) => void;
    onSetFolder: (id: string, folder: string | null) => void;
    t: (key: string, replacements?: { [key: string]: string }) => string;
    language: string;
}

const FOLDERS = ['Faol', 'Arxivlangan', 'Muzlatilgan'];

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onDelete, onSetFolder, t, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const filteredHistory = useMemo(() => {
    return history.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.caseDetails.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [history, searchTerm]);
  
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItemToDelete(id);
  }

  const confirmDelete = () => {
    if (itemToDelete) {
        onDelete(itemToDelete);
        setItemToDelete(null);
    }
  }

  if (history.length === 0) {
    return (
        <EmptyState 
            icon={<HistoryIcon />}
            title={t('empty_state_history_title')}
            message={t('empty_state_history_message')}
            t={t}
        />
    )
  }

  return (
    <>
    {itemToDelete && (
        <ConfirmationModal
            title={t('history_delete_modal_title')}
            message={t('history_delete_modal_message')}
            onConfirm={confirmDelete}
            onCancel={() => setItemToDelete(null)}
            t={t}
        />
    )}
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
            <input 
                type="text"
                placeholder={t('history_search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] pl-11 pr-4 py-2.5 focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
            />
        </div>
      </div>

      {filteredHistory.map(item => (
        <div 
            key={item.id} 
            onClick={() => onSelect(item)}
            className="polished-pane interactive-hover p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer"
        >
          <div className="flex-1 mb-3 sm:mb-0">
            <p className="text-[var(--text-secondary)] text-sm">{formatDate(item.timestamp, language)}</p>
            <p className="text-[var(--text-primary)] font-medium mt-1 truncate">{item.title}</p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className="relative" onClick={e => e.stopPropagation()}>
                <select
                    value={item.folder || ''}
                    onChange={(e) => onSetFolder(item.id, e.target.value || null)}
                    className="appearance-none bg-[var(--bg-secondary)] border border-[var(--border-color)] p-2 rounded-md hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-all text-sm pr-8"
                >
                    <option value="">{t('history_folder_none')}</option>
                    {FOLDERS.map(f => <option key={f} value={f}>{t(`folder_${f.toLowerCase()}`)}</option>)}
                </select>
                <ChevronDownIcon className="h-4 w-4 text-[var(--text-secondary)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button
              onClick={(e) => handleDeleteClick(e, item.id)}
              className="bg-red-900/40 hover:bg-red-900/60 p-2 rounded-lg text-red-300 transition-all duration-300 transform hover:scale-110"
              aria-label={t('button_delete')}
            >
              <TrashIcon className="h-5 w-5"/>
            </button>
          </div>
        </div>
      ))}
       {filteredHistory.length === 0 && searchTerm && (
           <p className="text-center text-[var(--text-secondary)] mt-8">{t('history_no_search_results')}</p>
       )}
    </div>
    </>
  );
};