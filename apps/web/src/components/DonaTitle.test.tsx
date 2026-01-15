import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DonaTitle } from './DonaTitle';

describe('DonaTitle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with initial text "Dona"', () => {
    render(<DonaTitle />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText('Dona')).toBeInTheDocument();
  });

  it('should have aria-label for accessibility', () => {
    render(<DonaTitle />);
    const heading = screen.getByRole('heading');
    expect(heading).toHaveAttribute('aria-label', 'Dona');
  });

  it('should render cursor element', () => {
    render(<DonaTitle />);
    expect(screen.getByText('|')).toBeInTheDocument();
  });

  it('should have blinking cursor when not typing', () => {
    render(<DonaTitle />);
    const cursor = screen.getByText('|');
    expect(cursor).toHaveClass('blinking');
  });

  it('should not animate when isPaused is true', () => {
    render(<DonaTitle isPaused={true} />);
    const heading = screen.getByRole('heading');
    expect(heading).toHaveTextContent('Dona');

    vi.advanceTimersByTime(5000);
    expect(heading).toHaveTextContent('Dona');
  });

  it('should start deleting after pause', async () => {
    render(<DonaTitle />);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const heading = screen.getByRole('heading');
    expect(heading.textContent).toContain('Don');
  });

  it('should apply correct CSS class', () => {
    render(<DonaTitle />);
    const heading = screen.getByRole('heading');
    expect(heading).toHaveClass('dona-title');
  });
});
