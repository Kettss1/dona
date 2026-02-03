import { useState, useCallback } from 'react';
import { useI18n } from '../i18n';

const API_URL = 'http://localhost:4000';

export function ResetPasswordForm() {
  const { t } = useI18n();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('token')
    : null;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (password.length < 6) {
        setError(t('error.password'));
        return;
      }
      if (password !== confirm) {
        setError(t('reset.mismatch'));
        return;
      }
      if (!token) {
        setError(t('reset.invalid'));
        return;
      }

      setStatus('loading');

      try {
        const res = await fetch(`${API_URL}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json();

        if (data.ok) {
          setStatus('success');
        } else {
          setError(data.message);
          setStatus('error');
        }
      } catch {
        setError('Connection error');
        setStatus('error');
      }
    },
    [password, confirm, token, t]
  );

  return (
    <div className="login-page">
      <div className="login-card">
        <header className="login-header">
          <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#3d3a36' }}>Dona</h1>
          <p className="login-subtitle">{t('reset.subtitle')}</p>
        </header>

        {status === 'success' ? (
          <>
            <div className="success-message" role="alert">{t('reset.success')}</div>
            <nav className="login-links">
              <a href="/" className="login-link">{t('reset.login')}</a>
            </nav>
          </>
        ) : (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="error-message" role="alert">{error}</div>}
            <div className="input-group">
              <label htmlFor="password" className="input-label">{t('reset.password.label')}</label>
              <input
                id="password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status === 'loading'}
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirm" className="input-label">{t('reset.confirm.label')}</label>
              <input
                id="confirm"
                type="password"
                className="input-field"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={status === 'loading'}
              />
            </div>
            <button type="submit" className="submit-button" disabled={status === 'loading'}>
              {status === 'loading' ? t('reset.saving') : t('reset.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
