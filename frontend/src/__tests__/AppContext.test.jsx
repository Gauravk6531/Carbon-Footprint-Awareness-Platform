import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider, useAppContext } from '../context/AppContext';

const TestConsumer = () => {
  const { userId, sessionId } = useAppContext();
  return (
    <div>
      <span data-testid="user-id">{userId}</span>
      <span data-testid="session-id">{sessionId || 'none'}</span>
    </div>
  );
};

describe('AppContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates persistent user id', () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );
    const userId = screen.getByTestId('user-id').textContent;
    expect(userId).toMatch(/^user-/);
    expect(localStorage.getItem('userId')).toBe(userId);
  });

  it('reuses stored user id on remount', () => {
    const { unmount } = render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );
    const firstId = screen.getByTestId('user-id').textContent;
    unmount();
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );
    expect(screen.getByTestId('user-id').textContent).toBe(firstId);
  });
});
