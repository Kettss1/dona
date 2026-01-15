import { describe, it, expect, beforeEach, vi } from 'vitest';
import { messages, detectLocale, persistLocale, type Locale } from './messages';

describe('messages', () => {
  it('should have all keys in English', () => {
    const keys = Object.keys(messages.en);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('should have all keys in Portuguese', () => {
    const enKeys = Object.keys(messages.en);
    const ptKeys = Object.keys(messages['pt-BR']);
    expect(ptKeys).toEqual(enKeys);
  });

  it('should have non-empty values for all translations', () => {
    const locales: Locale[] = ['en', 'pt-BR'];
    locales.forEach((locale) => {
      Object.entries(messages[locale]).forEach(([key, value]) => {
        expect(value, `${locale}.${key} should not be empty`).toBeTruthy();
      });
    });
  });
});

describe('detectLocale', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return stored locale if valid', () => {
    localStorage.setItem('dona.locale', 'pt-BR');
    expect(detectLocale()).toBe('pt-BR');
  });

  it('should return en for stored en locale', () => {
    localStorage.setItem('dona.locale', 'en');
    expect(detectLocale()).toBe('en');
  });

  it('should detect Portuguese from browser language', () => {
    localStorage.clear();
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('pt-BR');
    expect(detectLocale()).toBe('pt-BR');
  });

  it('should detect Portuguese from pt language prefix', () => {
    localStorage.clear();
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('pt');
    expect(detectLocale()).toBe('pt-BR');
  });

  it('should default to English for other languages', () => {
    localStorage.clear();
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('es-ES');
    expect(detectLocale()).toBe('en');
  });

  it('should ignore invalid stored locale', () => {
    localStorage.setItem('dona.locale', 'invalid');
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    expect(detectLocale()).toBe('en');
  });
});

describe('persistLocale', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  it('should save locale to localStorage', () => {
    persistLocale('pt-BR');
    expect(localStorage.getItem('dona.locale')).toBe('pt-BR');
  });

  it('should update document lang attribute', () => {
    persistLocale('pt-BR');
    expect(document.documentElement.lang).toBe('pt-BR');
  });
});
