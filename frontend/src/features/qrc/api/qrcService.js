// frontend/src/features/qrc/api/qrcService.js
import api from "../../../api/api";

const QRC_BASE_URL = "/qrc";

export const qrcService = {
  // Update: Terima parameter type (default 'standard')
  submitAssessment: async (answersData, type = "standard") => {
    const payload = {
      answers: answersData,
      assessment_type: type,
    };
    const response = await api.post(`${QRC_BASE_URL}/submit`, payload);
    return response.data;
  },

  // ... (fungsi getMyHistory, getConsultantStats, getAssessmentList TETAP SAMA) ...
  getMyHistory: async () => {
    const response = await api.get(`${QRC_BASE_URL}/my-history`);
    return response.data;
  },

  getConsultantStats: async () => {
    const response = await api.get(`${QRC_BASE_URL}/consultant/stats`);
    return response.data;
  },

  getAssessmentList: async (params = {}) => {
    const response = await api.get(`${QRC_BASE_URL}/consultant/list`, { params });
    return response.data;
  },

  archiveAssessment: async (id) => {
    const response = await api.put(`${QRC_BASE_URL}/consultant/${id}/archive`);
    return response.data;
  },

  restoreAssessment: async (id) => {
    const response = await api.put(`${QRC_BASE_URL}/consultant/${id}/restore`);
    return response.data;
  },

  // Ambil detail satu assessment (Untuk Modal Detail & Review)
  getAssessmentDetail: async (id) => {
    const response = await api.get(`${QRC_BASE_URL}/consultant/${id}`);
    return response.data;
  },

  // Update review (Notes, Status, Final Report)
  updateReview: async (id, data) => {
    const response = await api.put(`${QRC_BASE_URL}/consultant/${id}/review`, data);
    return response.data;
  },

  generateAIAnalysis: async (id) => {
    const response = await api.post(`${QRC_BASE_URL}/consultant/${id}/generate-ai`);
    return response.data;
  },

  getActiveQuestions: async (type = "standard") => {
    const response = await api.get(`${QRC_BASE_URL}/questions`, { params: { type } });
    return response.data;
  },

  // --- ADMIN MANAGEMENT (CRUD) ---
  getAllQuestionsAdmin: async (type = "standard") => {
    const response = await api.get(`${QRC_BASE_URL}/admin/questions`, { params: { type } });
    return response.data;
  },

  createQuestion: async (data) => {
    const response = await api.post(`${QRC_BASE_URL}/admin/questions`, data);
    return response.data;
  },

  updateQuestion: async (id, data) => {
    const response = await api.put(`${QRC_BASE_URL}/admin/questions/${id}`, data);
    return response.data;
  },

  deleteQuestion: async (id) => {
    const response = await api.delete(`${QRC_BASE_URL}/admin/questions/${id}`);
    return response.data;
  },

  getConsultantQuestionsReference: async (type = "standard") => {
    const response = await api.get(`${QRC_BASE_URL}/consultant/questions`, { params: { type } });
    return response.data;
  },

  getMyLimits: async () => {
    const response = await api.get(`${QRC_BASE_URL}/my-limits`);
    return response.data;
  },
};
