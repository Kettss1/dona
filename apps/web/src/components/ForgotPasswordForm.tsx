import { useState, useCallback } from 'react';
import { useI18n } from '../i18n';

const API_URL = 'http://localhost:4000';

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !email.includes('@')) {
        setError(t('error.email'));
        return;
      }

      setStatus('loading');
      setError('');

      try {
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        await res.json();

        if (res.status === 429) {
          setError(t('forgot.ratelimit'));
          setStatus('error');
        } else {
          setStatus('sent');
        }
      } catch {
        setError('Connection error');
        setStatus('error');
      }
    },
    [email, t]
  );

  return (
    <div className="login-page">
      <div className="login-card">
        <header className="login-header">
          <h1 style={{ fontSize: '2rem', fontWeight: 600, color: '#3d3a36' }}>Dona</h1>
          <p className="login-subtitle">{t('forgot.subtitle')}</p>
        </header>

        {status === 'sent' ? (
          <div className="success-message" role="alert">
            {t('forgot.sent')}
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="error-message" role="alert">{error}</div>
            )}
            <div className="input-group">
              <label htmlFor="email" className="input-label">{t('form.email.label')}</label>
              <input
                id="email"
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
              />
            </div>
            <button type="submit" className="submit-button" disabled={status === 'loading'}>
              {status === 'loading' ? t('forgot.sending') : t('forgot.submit')}
            </button>
          </form>
        )}

        <nav className="login-links">
          <a href="/" className="login-link">{t('forgot.back')}</a>
        </nav>
      </div>
    </div>
  );
}
