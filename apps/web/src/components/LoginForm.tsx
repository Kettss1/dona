import { useState, useCallback, useEffect } from 'react';
import { useI18n } from '../i18n';
import { DonaTitle } from './DonaTitle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { mockLogin } from '../api/mock';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const API_URL = 'http://localhost:4000';
const USE_MOCK_API = import.meta.env.PROD;

export function LoginForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      window.location.href = '/dashboard';
    }
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = t('error.required');
    } else if (!email.includes('@')) {
      newErrors.email = t('error.email');
    }

    if (!password) {
      newErrors.password = t('error.required');
    } else if (password.length < 6) {
      newErrors.password = t('error.password');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, t]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      setStatus('loading');
      setErrors({});

      try {
        let data;

        if (USE_MOCK_API) {
          data = await mockLogin({ email, password });
        } else {
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });
          data = await response.json();
        }

        if (data.ok) {
          setStatus('success');
          window.location.href = '/dashboard';
          return;
        } else {
          setStatus('error');
          setErrors({ general: data.message });
        }
      } catch (err) {
        setStatus('error');
        setErrors({ general: 'Connection error. Please try again.' });
      }
    },
    [email, password, validateForm]
  );

  const isLoading = status === 'loading';

  if (status === 'success') {
    return (
      <div className="login-page">
        <LanguageSwitcher />
        <div className="login-card">
          <div className="login-header">
            <DonaTitle isPaused={true} />
            <p className="login-subtitle">{t('app.subtitle')}</p>
          </div>
          <div className="success-message" role="alert">
            {t('form.success')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <LanguageSwitcher />
      <div className="login-card">
        <header className="login-header">
          <DonaTitle />
          <p className="login-subtitle">{t('app.subtitle')}</p>
        </header>

        <div className="login-form">
          <button type="button" className="google-button" onClick={handleGoogleLogin}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t('form.google')}
          </button>

          <div className="login-divider">
            <span>{t('form.divider')}</span>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {errors.general && (
            <div className="error-message" role="alert">
              {errors.general}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email" className="input-label">
              {t('form.email.label')}
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                data-error={!!errors.email}
                className="input-field"
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </div>
            {errors.email && (
              <span id="email-error" className="input-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">
              {t('form.password.label')}
            </label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                data-error={!!errors.password}
                data-has-toggle="true"
                className="input-field"
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? t('form.password.hide') : t('form.password.show')}
              >
                {showPassword ? t('form.password.hide') : t('form.password.show')}
              </button>
            </div>
            {errors.password && (
              <span id="password-error" className="input-error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading && <span className="loading-spinner" aria-hidden="true" />}
            {isLoading ? t('form.loading') : t('form.submit')}
          </button>

          <p className="form-helper">{t('form.helper')}</p>
        </form>

        <nav className="login-links">
          <a href="/forgot-password" className="login-link">
            {t('form.forgot')}
          </a>
          <a href="#signup" className="login-link">
            {t('form.signup')}
          </a>
        </nav>
      </div>
    </div>
  );
}
