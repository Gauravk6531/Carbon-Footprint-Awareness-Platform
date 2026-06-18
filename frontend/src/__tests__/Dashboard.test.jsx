import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../components/Dashboard';
import { AppProvider } from '../context/AppContext';
import { calculatorAPI, pledgeAPI } from '../services/api';

vi.mock('../services/api', () => ({
  calculatorAPI: {
    getHistory: vi.fn(),
  },
  pledgeAPI: {
    getPledges: vi.fn(),
  },
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    calculatorAPI.getHistory.mockResolvedValue({ footprints: [] });
    pledgeAPI.getPledges.mockResolvedValue({ pledges: [] });
  });

  it('renders progress dashboard after loading', async () => {
    render(
      <AppProvider>
        <Dashboard />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Your Progress')).toBeInTheDocument();
    });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays stat cards', async () => {
    render(
      <AppProvider>
        <Dashboard />
      </AppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Annual Footprint')).toBeInTheDocument();
      expect(screen.getByText('Activity Streak')).toBeInTheDocument();
    });
  });
});
