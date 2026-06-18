import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmissionCard from '../components/EmissionCard';

describe('EmissionCard Component', () => {
  const mockResult = {
    annual_tonnes: 4.8,
    monthly_kg: 400,
    confidence: 'High',
    sources: {
      car: 150,
      electricity: 250,
    },
  };

  it('renders annual footprint tonnes correctly', () => {
    render(<EmissionCard result={mockResult} />);
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('tonnes CO₂e per year')).toBeInTheDocument();
  });

  it('renders monthly footprint kg correctly', () => {
    render(<EmissionCard result={mockResult} />);
    expect(screen.getByText('400')).toBeInTheDocument();
    expect(screen.getByText('kg CO₂e')).toBeInTheDocument();
  });

  it('renders confidence score correctly', () => {
    render(<EmissionCard result={mockResult} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders sources breakdown correctly', () => {
    render(<EmissionCard result={mockResult} />);
    expect(screen.getByText('car')).toBeInTheDocument();
    expect(screen.getByText('electricity')).toBeInTheDocument();
  });

  it('returns null if result is missing', () => {
    const { container } = render(<EmissionCard result={null} />);
    expect(container.firstChild).toBeNull();
  });
});
