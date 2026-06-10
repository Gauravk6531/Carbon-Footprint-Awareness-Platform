import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  async sendMessage(message, sessionId = null, userId = null) {
    try {
      const response = await api.post('/chat', {
        message,
        session_id: sessionId,
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  },

  async getHistory(sessionId) {
    try {
      const response = await api.get(`/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('History error:', error);
      throw error;
    }
  },
};

export const calculatorAPI = {
  async calculate(carbonInput, userId = null) {
    try {
      const response = await api.post('/calculate', {
        carbon_input: carbonInput,
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      console.error('Calculate error:', error);
      throw error;
    }
  },
};

export const simulatorAPI = {
  async whatIf(baselineData, scenarioChanges, scenarioName = null) {
    try {
      const response = await api.post('/what-if', {
        baseline_data: baselineData,
        scenario_changes: scenarioChanges,
        scenario_name: scenarioName,
      });
      return response.data;
    } catch (error) {
      console.error('What-if error:', error);
      throw error;
    }
  },
};

export const pledgeAPI = {
  async createPledge(pledge, userId = null) {
    try {
      const response = await api.post('/pledge', pledge, {
        params: { user_id: userId },
      });
      return response.data;
    } catch (error) {
      console.error('Pledge error:', error);
      throw error;
    }
  },

  async getPledges(userId) {
    try {
      const response = await api.get(`/pledges/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get pledges error:', error);
      throw error;
    }
  },
};

export default api;
