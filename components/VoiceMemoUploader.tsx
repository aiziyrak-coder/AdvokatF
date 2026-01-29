
import React, { useState, useRef } from 'react';
import { MicrophoneIcon, CheckIcon, CopyIcon, XMarkIcon } from './icons';
import { transcribeAudioMemo } from '../services/geminiService';

interface VoiceMemoUploaderProps {
    t: (key: string) => string;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'finished';

export const VoiceMemoUploader: React.FC<VoiceMemoUploaderProps> = ({ t }) => {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [transcribedText, setTranscribedText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await processAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setRecordingState('recording');
            setError(null);
            
            // Auto stop after 10 seconds to avoid massive files
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    stopRecording();
                }
            }, 10000);

        } catch (err) {
            console.error("Mic access error:", err);
            setError(t('error_mic_permission'));
            setRecordingState('idle');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const processAudio = async (blob: Blob) => {
        setRecordingState('processing');
        try {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64Data = (reader.result as string).split(',')[1];
                const text = await transcribeAudioMemo(base64Data, t);
                setTranscribedText(text);
                setRecordingState('finished');
            };
        } catch (err: any) {
            setError(err.message || t('error_transcription'));
            setRecordingState('idle');
        }
    };

    const handleCopy = () => {
        if (transcribedText) {
            navigator.clipboard.writeText(transcribedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const reset = () => {
        setRecordingState('idle');
        setTranscribedText('');
        setError(null);
    };

    const getButtonContent = () => {
        switch(recordingState) {
            case 'recording':
                return <><div className="animate-pulse h-3 w-3 bg-red-500 rounded-full"></div><span>To'xtatish (10s)</span></>;
            case 'processing':
                return <div className="flex items-center gap-2"><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div><span>{t('voice_memo_processing')}</span></div>;
            case 'finished':
                return <span>{t('voice_memo_record_again')}</span>;
            case 'idle':
            default:
                return <><MicrophoneIcon className="h-6 w-6" /><span>{t('voice_memo_start')}</span></>;
        }
    }

    return (
        <div className="polished-pane p-5 rounded-xl w-full h-full flex flex-col">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    <div className="p-3 bg-[var(--bg-secondary)]/50 rounded-lg text-[var(--accent-secondary)] border border-[var(--border-color)]">
                        <MicrophoneIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-slate-200">{t('dashboard_action_voice_memo_title')}</h3>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">{t('dashboard_action_voice_memo_desc')}</p>
                    </div>
                </div>
                {recordingState === 'finished' && (
                    <button onClick={reset} className="text-[var(--text-secondary)] hover:text-white">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                )}
            </div>

            <div className="flex-1 mt-4 flex flex-col">
                <button 
                    onClick={recordingState === 'recording' ? stopRecording : startRecording} 
                    disabled={recordingState === 'processing'}
                    className={`w-full flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg transition-all ${
                        recordingState === 'recording' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-[var(--bg-secondary)] hover:bg-[var(--bg-pane)] text-white'
                    }`}
                >
                    {getButtonContent()}
                </button>

                {(transcribedText || error) && (
                    <div className="mt-3 p-3 bg-black/20 rounded-lg flex-1 text-sm text-slate-300 relative min-h-[80px]">
                        {error ? <p className="text-red-400">{error}</p> : <p className="whitespace-pre-wrap">{transcribedText}</p>}
                        
                        {transcribedText && !error && (
                             <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white">
                                {copied ? <CheckIcon className="h-4 w-4 text-[var(--accent-primary)]" /> : <CopyIcon className="h-4 w-4" />}
                             </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
