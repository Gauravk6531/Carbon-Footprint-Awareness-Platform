import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { AppProvider } from '../context/AppContext';

vi.mock('../components/IntroPage', () => ({
  default: ({ onEnter }) => (
    <button type="button" onClick={onEnter}>Enter App</button>
  ),
}));

const renderApp = () => render(
  <AppProvider>
    <App />
  </AppProvider>
);

describe('App navigation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders intro and enters main app', () => {
    renderApp();
    fireEvent.click(screen.getByText('Enter App'));
    expect(screen.getAllByText('Chat Coach').length).toBeGreaterThan(0);
  });

  it('switches between tabs', () => {
    renderApp();
    fireEvent.click(screen.getByText('Enter App'));
    fireEvent.click(screen.getByText('Calculator'));
    expect(screen.getByText('Carbon Footprint Calculator')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Dashboard'));
    expect(screen.getByText('Your Progress')).toBeInTheDocument();
  });

  it('has skip to main content link', () => {
    renderApp();
    fireEvent.click(screen.getByText('Enter App'));
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });
});
