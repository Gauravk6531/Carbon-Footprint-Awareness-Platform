import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://carbon-footprint-awareness-platform-art3.onrender.com/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  async sendMessage(message, sessionId = null, userId = null) {
    try {
      const response = await api.post('/api/chat', {
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
      const response = await api.get(`/api/history/${sessionId}`);
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
      const response = await api.post('/api/calculate', {
        carbon_input: carbonInput,
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      console.error('Calculate error:', error);
      throw error;
    }
  },

  async getHistory(userId) {
    try {
      const response = await api.get(`/api/footprints/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Footprint history error:', error);
      throw error;
    }
  },
};

export const simulatorAPI = {
  async whatIf(baselineData, scenarioChanges, scenarioName = null) {
    try {
      const response = await api.post('/api/what-if', {
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
      const response = await api.post('/api/pledge', pledge, {
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
      const response = await api.get(`/api/pledges/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get pledges error:', error);
      throw error;
    }
  },
};

export default api;
