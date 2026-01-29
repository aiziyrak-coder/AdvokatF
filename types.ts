import React from 'react';

export interface AiLawyerResponse {
  lawyerName: string;
  analysis: string;
  rating?: 'up' | 'down' | null;
}

export interface KnowledgeBaseEntry {
  fact?: string;
  relevance?: string;
  article?: string;
  summary?: string;
}

export interface KnowledgeBaseSection {
    keyFacts: { fact: string; relevance: string; }[];
    legalIssues: string[];
    applicableLaws: { article: string; summary: string; url?: string; }[];
    strengths: string[];
    weaknesses: string[];
    statuteOfLimitations: {
        status: 'OK' | 'Muddati o\'tgan' | 'Xavf ostida';
        summary: string;
    };
}

export interface CrossExaminationQuestion {
    question: string;
    suggestedAnswer: string;
}

export interface RiskMatrixEntry {
    risk: string;
    likelihood: 'Past' | 'O\'rta' | 'Yuqori';
    mitigation: string;
}

export interface WitnessQuestionSet {
    direct: string[];
    cross: { question: string; strategy: string; }[];
}

export interface WitnessPrep {
    participantName: string;
    questions: WitnessQuestionSet;
}

export interface DebateResult {
  debate: AiLawyerResponse[];
  summary: string;
  winProbability: number;
  probabilityJustification: string;
  positiveFactors: string[];
  negativeFactors: string[];
  riskMatrix: RiskMatrixEntry[];
  suggestedTasks: string[];
  knowledgeBase: KnowledgeBaseSection;
  deepDiveAnalysis?: string;
  courtroomScenario?: string;
  crossExaminationQuestions?: CrossExaminationQuestion[];
  closingArgumentLead?: string;
  closingArgumentDefender?: string;
  clientSummary?: string;
}

export interface AiLawyerPersona {
  name: string;
  title: string;
  description: string;
  icon: React.ReactElement<{ className?: string }>;
  bgColor: string;
  textColor: string;
  glowColor: string;
}

export interface CaseFile {
  id: string; // Unique ID for tracking during processing
  name: string;
  type: string;
  content?: string; // Base64 Data URL content - made optional to save space in localStorage
  extractedText?: string; // Extracted plain text for analysis
  images?: string[]; // Extracted images for scanned PDFs (base64)
  documentType?: string; // e.g., 'Shartnoma', 'Da'vo arizasi'
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface TimelineEvent {
  date: string;
  description: string;
  type: 'event' | 'deadline';
}

export interface CaseParticipant {
    name: string;
    role: string;
}

export interface EvidenceItem {
    id: string;
    fileId: string; // Corresponds to the id in CaseFile
    name: string;
    type: string;
    aiSummary?: string;
    timestamp: string;
}

export interface Note {
    id: string;
    content: string;
    timestamp: string;
}

export interface BillingEntry {
    id: string;
    date: string;
    hours: number;
    description: string;
    rate: number;
}

export interface Case {
  id:string;
  title: string;
  caseDetails: string;
  files: CaseFile[];
  result: DebateResult;
  courtStage: string;
  clientRole: string;
  clientName: string;
  participants: CaseParticipant[];
  tasks: Task[];
  timeline: TimelineEvent[];
  evidence: EvidenceItem[];
  notes: Note[];
  billing?: BillingEntry[];
  witnessPreps?: WitnessPrep[];
  tags: string[];
  folder: string | null;
  timestamp: string;
}

// Replaces the simple CaseHistoryItem
export type CaseHistoryItem = Case;

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: { uri: string; title: string; }[];
}

export type View = 'dashboard' | 'analyze' | 'debate' | 'summary' | 'history' | 'research' | 'settings' | 'knowledge_base' | 'simulation' | 'tasks' | 'documents' | 'timeline' | 'evidence' | 'notes' | 'billing' | 'calendar' | 'overview' | 'witness_prep';

export interface PreliminaryVerdict {
    winProbability: number;
    probabilityJustification: string;
    positiveFactors: string[];
    negativeFactors: string[];
}

export interface PendingCaseData {
    caseDetails: string;
    files: CaseFile[];
    courtType: string;
    courtStage: string;
    participants: CaseParticipant[];
    clientRole: string;
    clientName: string;
}

export interface SuggestedParticipant {
    name: string;
    suggestedRole: string;
}

export interface FeedbackData {
    caseId: string;
    view: View;
    rating: number; // 1-5 stars
    tags: string[];
    comment: string;
    timestamp: string;
}

// For backward compatibility with older components if needed
export type Tab = 'analyze' | 'debate' | 'summary' | 'history';