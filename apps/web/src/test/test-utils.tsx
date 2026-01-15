import { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { I18nContext } from '../i18n/I18nProvider';
import { messages, type Locale, type Messages } from '../i18n/messages';

interface I18nProviderProps {
  children: ReactNode;
  locale?: Locale;
}

function TestI18nProvider({ children, locale = 'en' }: I18nProviderProps) {
  const t = (key: keyof Messages) => messages[locale][key] || key;
  const setLocale = () => {};

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: Locale;
}

function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { locale = 'en', ...renderOptions } = options;

  return render(ui, {
    wrapper: ({ children }) => <TestI18nProvider locale={locale}>{children}</TestI18nProvider>,
    ...renderOptions,
  });
}

export * from '@testing-library/react';
export { customRender as render };
