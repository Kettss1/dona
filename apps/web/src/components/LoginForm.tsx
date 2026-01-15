import { useState, useCallback } from 'react';
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
            body: JSON.stringify({ email, password }),
          });
          data = await response.json();
        }

        if (data.ok) {
          setStatus('success');
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
          <a href="#forgot" className="login-link">
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
