import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../i18n';

const API_URL = 'http://localhost:4000';

interface Menu {
  id: string;
  title: string;
  description: string | null;
  slug: string | null;
  is_published: boolean;
  created_at: string;
}

export function MenuList() {
  const { t } = useI18n();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchMenus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/menus`, { credentials: 'include' });
      const data = await res.json();
      if (data.ok) setMenus(data.menus);
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/menus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setNewTitle('');
        setShowCreate(false);
        fetchMenus();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Connection error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('menus.delete.confirm'))) return;
    try {
      await fetch(`${API_URL}/api/menus/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchMenus();
    } catch {
      setError('Connection error');
    }
  };

  if (loading) return <p style={{ color: 'var(--color-text-muted)' }}>{t('menus.loading')}</p>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('menus.title')}</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('menus.create')}
        </button>
      </div>

      {error && <div className="form-message form-message-error">{error}</div>}

      {showCreate && (
        <form className="menu-create-form" onSubmit={handleCreate}>
          <input
            className="form-input"
            placeholder={t('menus.create.placeholder')}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={creating}
            autoFocus
          />
          <button type="submit" className="btn btn-primary" disabled={creating || !newTitle.trim()}>
            {creating ? '...' : t('menus.create.submit')}
          </button>
        </form>
      )}

      {menus.length === 0 ? (
        <div className="menus-empty">
          <svg className="menus-empty-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p className="menus-empty-text">{t('menus.empty')}</p>
          {!showCreate && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              {t('menus.create')}
            </button>
          )}
        </div>
      ) : (
        <div className="menu-cards">
          {menus.map((menu) => (
            <div key={menu.id} className="menu-card">
              <div className="menu-card-body">
                <a href={`/menus/${menu.id}`} className="menu-card-title">
                  {menu.title}
                </a>
                <span className={`menu-badge ${menu.is_published ? 'published' : 'draft'}`}>
                  {menu.is_published ? t('menus.published') : t('menus.draft')}
                </span>
              </div>
              <div className="menu-card-actions">
                <a href={`/menus/${menu.id}`} className="btn-icon" title={t('menus.edit')}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                  </svg>
                </a>
                <button className="btn-icon btn-danger" onClick={() => handleDelete(menu.id)} title={t('menus.delete')}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
