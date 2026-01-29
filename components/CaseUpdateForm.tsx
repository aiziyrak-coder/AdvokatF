import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';
import type { CaseFile } from '../types';
import { getDocumentType } from '../services/geminiService';

declare global {
    interface Window {
        mammoth: any;
        pdfjsLib: any;
    }
}

const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf' && window.pdfjsLib) {
        try {
            // Check if PDF.js is properly initialized
            if (!window.pdfjsLib || typeof window.pdfjsLib.getDocument !== 'function') {
                console.warn('PDF.js is not properly initialized');
                return `[PDF faylini o'qishda xatolik: ${file.name}]`;
            }
            
            const arrayBuffer = await file.arrayBuffer();
            
            // Wrap in try-catch to prevent privileged instruction errors
            let pdf;
            try {
                pdf = await window.pdfjsLib.getDocument({ 
                    data: arrayBuffer,
                    useWorkerFetch: false,
                    isEvalSupported: false,
                    verbosity: 0
                }).promise;
            } catch (pdfError: any) {
                // If privileged instruction error occurs, return error message
                if (pdfError?.message?.includes('STATUS_PRIVILEGED_INSTRUCTION') || 
                    pdfError?.name === 'STATUS_PRIVILEGED_INSTRUCTION') {
                    console.warn('PDF.js privileged instruction error, skipping text extraction');
                    return `[PDF faylini o'qishda xatolik: ${file.name}]`;
                }
                throw pdfError;
            }
            
            let text = '';
            const totalPages = pdf.numPages;
            for (let i = 1; i <= totalPages; i++) {
                try {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map((item: any) => item.str).join(' ') + '\n';
                } catch (pageError: any) {
                    // Skip problematic pages
                    if (pageError?.message?.includes('STATUS_PRIVILEGED_INSTRUCTION')) {
                        console.warn(`Skipping page ${i} due to privileged instruction error`);
                        continue;
                    }
                    throw pageError;
                }
            }
            return text;
        } catch (error: any) {
            // Catch all errors including privileged instruction errors
            if (error?.message?.includes('STATUS_PRIVILEGED_INSTRUCTION') || 
                error?.name === 'STATUS_PRIVILEGED_INSTRUCTION') {
                console.warn('PDF text extraction skipped due to privileged instruction error');
                return `[PDF faylini o'qishda xatolik: ${file.name}]`;
            }
            console.error('Error extracting text from PDF:', error);
            return `[PDF faylini o'qishda xatolik: ${file.name}]`;
        }
    } 
    else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && window.mammoth) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await window.mammoth.extractRawText({ arrayBuffer });
            return result.value;
        } catch (error) {
            console.error('Error extracting text from DOCX:', error);
            return `[DOCX faylini o'qishda xatolik: ${file.name}]`;
        }
    }
    else if (file.type.startsWith('text/')) {
        return file.text();
    }
    return '';
};

interface CaseUpdateFormProps {
  onUpdate: (additionalDetails: string, newFiles: CaseFile[]) => void;
  isLoading: boolean;
  t: (key: string) => string;
}

export const CaseUpdateForm: React.FC<CaseUpdateFormProps> = ({ onUpdate, isLoading, t }) => {
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [newFiles, setNewFiles] = useState<CaseFile[]>([]);

  const handleFilesAdded = useCallback(async (fileList: File[]) => {
      if (!fileList || fileList.length === 0) return;

      const readFileAsDataURL = (fileToRead: File): Promise<string> => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileToRead);
      });

      const placeholders: CaseFile[] = fileList.map(file => ({
        id: `${Date.now()}-${file.name}`, name: file.name, type: file.type, content: '',
        documentType: t('file_status_analyzing'),
        extractedText: t('file_status_analyzing'),
      }));
      setNewFiles(prev => [...prev, ...placeholders]);

      const processSingleFile = async (file: File, placeholder: CaseFile): Promise<CaseFile> => {
        try {
          const [content, extractedText] = await Promise.all([
            readFileAsDataURL(file),
            extractTextFromFile(file)
          ]);
          const fileWithData: CaseFile = { ...placeholder, content, extractedText };
          const detectedType = await getDocumentType(fileWithData, t);
          const finalType = detectedType === "Boshqa" ? t('file_status_ready') : detectedType;
          return { ...fileWithData, documentType: finalType };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return { ...placeholder, documentType: t('file_status_error'), extractedText: t('file_status_read_error') };
        }
      };
      
      const processedFiles = await Promise.all(
          fileList.map((file, i) => processSingleFile(file, placeholders[i]))
      );

      setNewFiles(prevFiles => {
          const fileMap = new Map(prevFiles.map(f => [f.id, f]));
          processedFiles.forEach(pf => fileMap.set(pf.id, pf));
          return Array.from(fileMap.values());
      });
  }, [t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFilesAdded(Array.from(e.target.files));
  };
  
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if(e.dataTransfer.files) handleFilesAdded(Array.from(e.dataTransfer.files));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!additionalDetails.trim() && newFiles.length === 0) return;
    onUpdate(additionalDetails, newFiles);
    setAdditionalDetails('');
    setNewFiles([]);
  };

  return (
    <div className="polished-pane p-4 bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]">
      <h4 className="font-semibold text-slate-200 mb-3 text-lg">{t('kb_update_section_title')}</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="additional-details" className="block text-sm font-medium text-slate-300 mb-1">{t('kb_update_notes_label')}</label>
            <textarea
                id="additional-details"
                value={additionalDetails}
                onChange={e => setAdditionalDetails(e.target.value)}
                placeholder={t('kb_update_notes_placeholder')}
                className="w-full h-24 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-300 resize-y"
            />
        </div>
        <div>
            <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[var(--border-color)] rounded-lg p-4 text-center cursor-pointer hover:border-[var(--accent-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
                <input type="file" id="update-file-upload" className="hidden" multiple onChange={handleFileChange} accept=".pdf,.doc,.docx,.txt,image/*" />
                <label htmlFor="update-file-upload" className="cursor-pointer">
                    <UploadIcon className="h-8 w-8 mx-auto text-[var(--text-secondary)]" />
                    <p className="mt-1 text-sm text-slate-300">{t('case_input_dropzone_title')}</p>
                </label>
            </div>
             {newFiles.length > 0 && (
                <div className="space-y-2 mt-3">
                    {newFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between bg-[var(--bg-secondary)]/70 p-2 rounded-md text-sm border border-[var(--border-color)]/50">
                            <p className="text-[var(--accent-primary)] truncate pr-4">{file.name}</p>
                             <span className={`flex-shrink-0 text-xs font-semibold px-2 py-1 rounded-full ${
                                file.documentType === t('file_status_analyzing') ? 'bg-yellow-500/20 text-yellow-300 animate-pulse' :
                                file.documentType === t('file_status_error') || file.documentType === t('file_status_read_error') ? 'bg-red-500/20 text-red-300' :
                                'bg-cyan-500/20 text-cyan-300'
                            }`}>
                                {file.documentType}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
        <div className="text-right">
             <button
              type="submit"
              disabled={isLoading || (!additionalDetails.trim() && newFiles.length === 0)}
              className="inline-flex items-center justify-center gap-2 bg-[var(--accent-primary)] text-black font-bold py-2 px-5 rounded-lg transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--glow-color)] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                  <>
                  <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t('kb_updating_button')}</span>
                  </>
              ) : (
                  <span>{t('kb_update_button')}</span>
              )}
            </button>
        </div>
      </form>
    </div>
  );
};