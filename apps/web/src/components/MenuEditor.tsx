import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../i18n';
import { SectionList } from './SectionList';
import { MenuPreview } from './MenuPreview';

const API_URL = 'http://localhost:4000';

interface MenuItem {
  id: string;
  section_id: string;
  name: string;
  description: string | null;
  price: string | null;
  tags: string[];
  sort_order: number;
}

interface MenuSection {
  id: string;
  menu_id: string;
  title: string;
  sort_order: number;
  items: MenuItem[];
}

interface Menu {
  id: string;
  title: string;
  description: string | null;
  slug: string | null;
  is_published: boolean;
  sections: MenuSection[];
}

type Tab = 'edit' | 'preview';

export function MenuEditor({ menuId }: { menuId: string }) {
  const { t } = useI18n();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<Tab>('edit');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/menus/${menuId}`, { credentials: 'include' });
      const data = await res.json();
      if (data.ok) {
        setMenu(data.menu);
        setTitle(data.menu.title);
        setDescription(data.menu.description || '');
      }
    } catch {
      setMessage('Connection error');
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/menus/${menuId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (data.ok) {
        setMenu((prev) => (prev ? { ...prev, ...data.menu } : prev));
        setMessage(t('editor.saved'));
        setTimeout(() => setMessage(''), 2000);
      }
    } catch {
      setMessage('Error saving');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!menu) return;
    try {
      const res = await fetch(`${API_URL}/api/menus/${menuId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_published: !menu.is_published }),
      });
      const data = await res.json();
      if (data.ok) {
        setMenu((prev) => (prev ? { ...prev, is_published: data.menu.is_published } : prev));
      }
    } catch {
      setMessage('Error toggling publish');
    }
  };

  if (loading) return <p style={{ color: 'var(--color-text-muted)' }}>{t('editor.loading')}</p>;
  if (!menu) return <p style={{ color: 'var(--color-text-muted)' }}>{t('editor.notfound')}</p>;

  return (
    <div className="editor">
      <div className="editor-header">
        <div className="editor-header-left">
          <a href="/menus" className="editor-back">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </a>
          <input
            type="text"
            className="editor-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('editor.title')}
          />
        </div>
        <div className="editor-actions">
          {message && <span className="editor-message">{message}</span>}
          <button
            className={`btn ${menu.is_published ? 'btn-secondary' : 'btn-secondary'}`}
            onClick={handleTogglePublish}
          >
            {menu.is_published ? t('editor.unpublish') : t('editor.publish')}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? t('editor.saving') : t('editor.save')}
          </button>
        </div>
      </div>

      {menu.is_published && menu.slug && (
        <div className="editor-share">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
          </svg>
          {t('editor.sharelink')}: <a href={`/m/${menu.slug}`} target="_blank" rel="noreferrer">/m/{menu.slug}</a>
        </div>
      )}

      <div className="editor-tabs mobile-only">
        <button className={`editor-tab ${tab === 'edit' ? 'active' : ''}`} onClick={() => setTab('edit')}>
          {t('editor.tab.edit')}
        </button>
        <button className={`editor-tab ${tab === 'preview' ? 'active' : ''}`} onClick={() => setTab('preview')}>
          {t('editor.tab.preview')}
        </button>
      </div>

      <div className="editor-split">
        <div className={`editor-panel editor-edit ${tab === 'edit' ? 'active' : ''}`}>
          <div className="editor-desc">
            <textarea
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('editor.description')}
              rows={2}
            />
          </div>
          <SectionList menuId={menuId} sections={menu.sections} onUpdate={fetchMenu} />
        </div>
        <div className={`editor-panel editor-preview ${tab === 'preview' ? 'active' : ''}`}>
          <MenuPreview menu={{ ...menu, title, description }} />
        </div>
      </div>
    </div>
  );
}
