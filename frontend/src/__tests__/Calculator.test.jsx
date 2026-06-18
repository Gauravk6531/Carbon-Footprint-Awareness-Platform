import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Calculator from '../components/Calculator';
import { AppProvider } from '../context/AppContext';
import { calculatorAPI } from '../services/api';

vi.mock('../services/api', () => ({
  calculatorAPI: {
    calculate: vi.fn(),
    getHistory: vi.fn(),
  },
}));

const mockResult = {
  annual_tonnes: 4.2,
  monthly_kg: 350,
  confidence: 'High',
  sources: { car: 150 },
  recommendations: ['Use public transport'],
};

describe('Calculator Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders form fields', () => {
    render(
      <AppProvider>
        <Calculator />
      </AppProvider>
    );
    expect(screen.getByText('Carbon Footprint Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText(/Daily car travel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fuel type/i)).toBeInTheDocument();
  });

  it('submits form and displays results', async () => {
    calculatorAPI.calculate.mockResolvedValue(mockResult);
    render(
      <AppProvider>
        <Calculator />
      </AppProvider>
    );

    fireEvent.change(screen.getByLabelText(/Daily car travel/i), { target: { value: '18' } });
    fireEvent.click(screen.getByText('Calculate Footprint'));

    await waitFor(() => {
      expect(screen.getByText('4.2')).toBeInTheDocument();
    });
    expect(calculatorAPI.calculate).toHaveBeenCalled();
  });

  it('shows accessible error on failure', async () => {
    calculatorAPI.calculate.mockRejectedValue(new Error('Network error'));
    render(
      <AppProvider>
        <Calculator />
      </AppProvider>
    );

    fireEvent.click(screen.getByText('Calculate Footprint'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Failed to calculate footprint/i);
    });
  });
});
