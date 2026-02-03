import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../i18n';

const API_URL = 'http://localhost:4000';

interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
}

type Status = 'loading' | 'idle' | 'saving' | 'saved' | 'error';

export function RestaurantForm() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const [existing, setExisting] = useState<Restaurant | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/restaurants`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.restaurant) {
          const r = data.restaurant;
          setExisting(r);
          setName(r.name);
          setAddress(r.address || '');
          setPhone(r.phone || '');
          setLogoUrl(r.logo_url || '');
        }
        setStatus('idle');
      })
      .catch(() => {
        setStatus('idle');
      });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        setError(t('restaurant.name.required'));
        return;
      }

      setStatus('saving');
      setError('');

      try {
        const method = existing ? 'PUT' : 'POST';
        const res = await fetch(`${API_URL}/api/restaurants`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: name.trim(), address, phone, logo_url: logoUrl }),
        });
        const data = await res.json();

        if (data.ok) {
          setExisting(data.restaurant);
          setStatus('saved');
          setTimeout(() => setStatus('idle'), 2000);
        } else {
          setError(data.message);
          setStatus('error');
        }
      } catch {
        setError('Connection error');
        setStatus('error');
      }
    },
    [name, address, phone, logoUrl, existing, t]
  );

  if (status === 'loading') {
    return <p>{t('restaurant.loading')}</p>;
  }

  return (
    <div className="form-container">
      <h1 className="form-title">{t('restaurant.title')}</h1>

      {status === 'saved' && (
        <div className="form-message form-message-success">{t('restaurant.saved')}</div>
      )}
      {error && <div className="form-message form-message-error">{error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="r-name">
            {t('restaurant.name.label')}
          </label>
          <input
            id="r-name"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === 'saving'}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="r-address">
            {t('restaurant.address.label')}
          </label>
          <input
            id="r-address"
            className="form-input"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={status === 'saving'}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="r-phone">
            {t('restaurant.phone.label')}
          </label>
          <input
            id="r-phone"
            className="form-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={status === 'saving'}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="r-logo">
            {t('restaurant.logo.label')}
          </label>
          <input
            id="r-logo"
            className="form-input"
            type="url"
            placeholder="https://..."
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            disabled={status === 'saving'}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={status === 'saving'}>
            {status === 'saving' ? t('restaurant.saving') : t('restaurant.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
