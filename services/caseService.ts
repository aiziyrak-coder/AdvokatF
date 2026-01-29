import api from './api';
import { Case } from '../types';

export const getCases = async () => {
    const response = await api.get('/cases/');
    return response.data;
};

export const createCase = async (caseData: Partial<Case>) => {
    // API ga mos formatga o'tkazish kerak bo'lishi mumkin
    // Case modeli backendda biroz boshqacha bo'lishi mumkin, shuning uchun mapper kerak
    const payload = {
        title: caseData.title,
        description: caseData.caseDetails,
        status: 'new',
        case_data: {
            details: caseData.caseDetails,
            courtType: caseData.tags?.[0], // Taxminan
            courtStage: caseData.courtStage,
            clientRole: caseData.clientRole,
            clientName: caseData.clientName,
        },
        participants: caseData.participants,
        analysis_result: caseData.result,
        simulation_data: {
            courtroomScenario: caseData.result?.courtroomScenario,
            crossExaminationQuestions: caseData.result?.crossExaminationQuestions,
            closingArgumentLead: caseData.result?.closingArgumentLead,
            closingArgumentDefender: caseData.result?.closingArgumentDefender,
        }
    };
    
    const response = await api.post('/cases/', payload);
    return response.data;
};

export const updateCase = async (id: string, caseData: Partial<Case>) => {
    const response = await api.patch(`/cases/${id}/`, caseData);
    return response.data;
};

export const deleteCase = async (id: string) => {
    const response = await api.delete(`/cases/${id}/`);
    return response.data;
};
