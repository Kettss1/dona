import React from 'react';
import { useI18n, type Locale } from '../i18n';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value as Locale);
  };

  return (
    <div className="language-switcher">
      <select
        className="language-select"
        value={locale}
        onChange={handleChange}
        aria-label={t('lang.label')}
      >
        <option value="en">{t('lang.en')}</option>
        <option value="pt-BR">{t('lang.ptbr')}</option>
      </select>
    </div>
  );
}
