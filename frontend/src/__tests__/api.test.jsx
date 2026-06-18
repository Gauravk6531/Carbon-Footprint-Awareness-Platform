import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { chatAPI, calculatorAPI, simulatorAPI, pledgeAPI } from '../services/api';

vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('API Services', () => {
  let mockAxios;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxios = axios.create();
  });

  describe('chatAPI', () => {
    it('sendMessage calls POST /api/chat with correct parameters', async () => {
      const mockResponse = { data: { message: 'Hello user' } };
      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await chatAPI.sendMessage('Hello AI', 'session-123', 'user-456');

      expect(mockAxios.post).toHaveBeenCalledWith('/api/chat', {
        message: 'Hello AI',
        session_id: 'session-123',
        user_id: 'user-456',
      });
      expect(result).toEqual({ message: 'Hello user' });
    });

    it('getHistory calls GET /api/history/{sessionId}', async () => {
      const mockResponse = { data: { messages: [] } };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await chatAPI.getHistory('session-123');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/history/session-123');
      expect(result).toEqual({ messages: [] });
    });
  });

  describe('calculatorAPI', () => {
    it('calculate calls POST /api/calculate with correct parameters', async () => {
      const mockResponse = { data: { annual_tonnes: 3.2 } };
      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const input = { daily_car_km: 10 };
      const result = await calculatorAPI.calculate(input, 'user-456');

      expect(mockAxios.post).toHaveBeenCalledWith('/api/calculate', {
        carbon_input: input,
        user_id: 'user-456',
      });
      expect(result).toEqual({ annual_tonnes: 3.2 });
    });

    it('getHistory calls GET /api/footprints/{userId}', async () => {
      const mockResponse = { data: { footprints: [] } };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await calculatorAPI.getHistory('user-456');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/footprints/user-456');
      expect(result).toEqual({ footprints: [] });
    });
  });

  describe('simulatorAPI', () => {
    it('whatIf calls POST /api/what-if with correct parameters', async () => {
      const mockResponse = { data: { saved_kg_monthly: 45.0 } };
      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const baseline = { daily_car_km: 10 };
      const changes = { daily_car_km: 5 };
      const result = await simulatorAPI.whatIf(baseline, changes, 'scenario-1');

      expect(mockAxios.post).toHaveBeenCalledWith('/api/what-if', {
        baseline_data: baseline,
        scenario_changes: changes,
        scenario_name: 'scenario-1',
      });
      expect(result).toEqual({ saved_kg_monthly: 45.0 });
    });
  });

  describe('pledgeAPI', () => {
    it('createPledge calls POST /api/pledge with query params', async () => {
      const mockResponse = { data: { id: 'pledge-1', status: 'created' } };
      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const pledge = { action: 'Switch to public transport' };
      const result = await pledgeAPI.createPledge(pledge, 'user-456');

      expect(mockAxios.post).toHaveBeenCalledWith('/api/pledge', pledge, {
        params: { user_id: 'user-456' },
      });
      expect(result).toEqual({ id: 'pledge-1', status: 'created' });
    });

    it('getPledges calls GET /api/pledges/{userId}', async () => {
      const mockResponse = { data: { pledges: [] } };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await pledgeAPI.getPledges('user-456');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/pledges/user-456');
      expect(result).toEqual({ pledges: [] });
    });
  });
});
