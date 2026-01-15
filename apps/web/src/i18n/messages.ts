export type Locale = 'en' | 'pt-BR';

export interface Messages {
  'app.subtitle': string;
  'form.email.label': string;
  'form.password.label': string;
  'form.password.show': string;
  'form.password.hide': string;
  'form.submit': string;
  'form.forgot': string;
  'form.signup': string;
  'form.helper': string;
  'form.loading': string;
  'form.success': string;
  'error.required': string;
  'error.email': string;
  'error.password': string;
  'lang.label': string;
  'lang.en': string;
  'lang.ptbr': string;
}

export const messages: Record<Locale, Messages> = {
  en: {
    'app.subtitle': 'Create and share menus with ease.',
    'form.email.label': 'Email',
    'form.password.label': 'Password',
    'form.password.show': 'Show',
    'form.password.hide': 'Hide',
    'form.submit': 'Continue',
    'form.forgot': 'Forgot password?',
    'form.signup': 'Create account',
    'form.helper': "We'll never share your information.",
    'form.loading': 'Signing in...',
    'form.success': 'Logged in!',
    'error.required': 'Please fill in all fields.',
    'error.email': 'Please enter a valid email.',
    'error.password': 'Password must be at least 6 characters.',
    'lang.label': 'Language',
    'lang.en': 'English',
    'lang.ptbr': 'Português (BR)',
  },
  'pt-BR': {
    'app.subtitle': 'Crie e compartilhe cardápios com facilidade.',
    'form.email.label': 'Email',
    'form.password.label': 'Senha',
    'form.password.show': 'Mostrar',
    'form.password.hide': 'Ocultar',
    'form.submit': 'Continuar',
    'form.forgot': 'Esqueceu a senha?',
    'form.signup': 'Criar conta',
    'form.helper': 'Nós nunca compartilharemos suas informações.',
    'form.loading': 'Entrando...',
    'form.success': 'Você entrou!',
    'error.required': 'Por favor, preencha todos os campos.',
    'error.email': 'Por favor, informe um email válido.',
    'error.password': 'A senha deve ter pelo menos 6 caracteres.',
    'lang.label': 'Idioma',
    'lang.en': 'English',
    'lang.ptbr': 'Português (BR)',
  },
};

const STORAGE_KEY = 'dona.locale';

export function detectLocale(): Locale {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'pt-BR') {
      return stored;
    }

    const browserLang =
      navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage;
    if (browserLang && browserLang.toLowerCase().startsWith('pt')) {
      return 'pt-BR';
    }
  }

  return 'en';
}

export function persistLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }
}
