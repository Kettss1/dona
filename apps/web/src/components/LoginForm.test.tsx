import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LoginForm', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    render(<LoginForm />);
    expect(screen.getByText('Create and share menus with ease.')).toBeInTheDocument();
  });

  it('should render helper text', () => {
    render(<LoginForm />);
    expect(screen.getByText("We'll never share your information.")).toBeInTheDocument();
  });

  it('should render forgot password and signup links', () => {
    render(<LoginForm />);
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByText('Create account')).toBeInTheDocument();
  });

  it('should show password toggle button', () => {
    render(<LoginForm />);
    expect(screen.getByRole('button', { name: 'Show' })).toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show' }));
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hide' }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should show validation error for empty email', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('Please fill in all fields.')).toBeInTheDocument();
  });

  it('should show validation error for invalid email', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'invalid-email');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('Please enter a valid email.')).toBeInTheDocument();
  });

  it('should show validation error for short password', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), '12345');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ ok: true }),
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );
    });
  });

  it('should show success message after successful login', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ ok: true }),
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(screen.getByText('Logged in!')).toBeInTheDocument();
    });
  });

  it('should show error message on failed login', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ ok: false, message: 'Invalid credentials' }),
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ json: () => ({ ok: true }) }), 100))
    );

    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
  });

  it('should disable inputs during loading', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ json: () => ({ ok: true }) }), 100))
    );

    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
  });

  it('should handle network errors', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(screen.getByText('Connection error. Please try again.')).toBeInTheDocument();
    });
  });

  it('should render in Portuguese', () => {
    render(<LoginForm />, { locale: 'pt-BR' });
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
    expect(screen.getByText('Crie e compartilhe cardápios com facilidade.')).toBeInTheDocument();
  });

  it('should have accessible error messages', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    const errorMessages = screen.getAllByRole('alert');
    expect(errorMessages.length).toBeGreaterThan(0);
  });
});
