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
  'form.google': string;
  'form.divider': string;
  'error.required': string;
  'error.email': string;
  'error.password': string;
  'lang.label': string;
  'lang.en': string;
  'lang.ptbr': string;
  'nav.dashboard': string;
  'nav.restaurant': string;
  'nav.menus': string;
  'nav.logout': string;
  'dashboard.welcome': string;
  'dashboard.subtitle': string;
  'dashboard.restaurant': string;
  'dashboard.menus': string;
  'restaurant.title': string;
  'restaurant.loading': string;
  'restaurant.name.label': string;
  'restaurant.name.required': string;
  'restaurant.address.label': string;
  'restaurant.phone.label': string;
  'restaurant.logo.label': string;
  'restaurant.save': string;
  'restaurant.saving': string;
  'restaurant.saved': string;
  'menus.title': string;
  'menus.loading': string;
  'menus.empty': string;
  'menus.create': string;
  'menus.create.placeholder': string;
  'menus.create.submit': string;
  'menus.edit': string;
  'menus.delete': string;
  'menus.delete.confirm': string;
  'menus.published': string;
  'menus.draft': string;
  'editor.loading': string;
  'editor.notfound': string;
  'editor.back': string;
  'editor.save': string;
  'editor.saving': string;
  'editor.saved': string;
  'editor.publish': string;
  'editor.unpublish': string;
  'editor.sharelink': string;
  'editor.tab.edit': string;
  'editor.tab.preview': string;
  'editor.title': string;
  'editor.description': string;
  'editor.section.placeholder': string;
  'editor.section.add': string;
  'editor.section.delete': string;
  'editor.section.delete.confirm': string;
  'editor.item.placeholder': string;
  'editor.item.add': string;
  'editor.item.name': string;
  'editor.item.description': string;
  'editor.item.price': string;
  'editor.item.save': string;
  'editor.item.cancel': string;
  'forgot.subtitle': string;
  'forgot.submit': string;
  'forgot.sending': string;
  'forgot.sent': string;
  'forgot.ratelimit': string;
  'forgot.back': string;
  'reset.subtitle': string;
  'reset.password.label': string;
  'reset.confirm.label': string;
  'reset.submit': string;
  'reset.saving': string;
  'reset.success': string;
  'reset.mismatch': string;
  'reset.invalid': string;
  'reset.login': string;
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
    'form.google': 'Continue with Google',
    'form.divider': 'or',
    'error.required': 'Please fill in all fields.',
    'error.email': 'Please enter a valid email.',
    'error.password': 'Password must be at least 6 characters.',
    'lang.label': 'Language',
    'lang.en': 'English',
    'lang.ptbr': 'Português (BR)',
    'nav.dashboard': 'Dashboard',
    'nav.restaurant': 'Restaurant',
    'nav.menus': 'Menus',
    'nav.logout': 'Logout',
    'dashboard.welcome': 'Welcome',
    'dashboard.subtitle': 'What would you like to do?',
    'dashboard.restaurant': 'My Restaurant',
    'dashboard.menus': 'My Menus',
    'restaurant.title': 'My Restaurant',
    'restaurant.loading': 'Loading...',
    'restaurant.name.label': 'Restaurant Name',
    'restaurant.name.required': 'Please enter a restaurant name.',
    'restaurant.address.label': 'Address',
    'restaurant.phone.label': 'Phone',
    'restaurant.logo.label': 'Logo URL',
    'restaurant.save': 'Save',
    'restaurant.saving': 'Saving...',
    'restaurant.saved': 'Saved!',
    'menus.title': 'My Menus',
    'menus.loading': 'Loading...',
    'menus.empty': 'No menus yet. Create your first one!',
    'menus.create': 'New Menu',
    'menus.create.placeholder': 'Menu title...',
    'menus.create.submit': 'Create',
    'menus.edit': 'Edit',
    'menus.delete': 'Delete',
    'menus.delete.confirm': 'Are you sure you want to delete this menu?',
    'menus.published': 'Published',
    'menus.draft': 'Draft',
    'editor.loading': 'Loading...',
    'editor.notfound': 'Menu not found.',
    'editor.back': 'Back to menus',
    'editor.save': 'Save',
    'editor.saving': 'Saving...',
    'editor.saved': 'Saved!',
    'editor.publish': 'Publish',
    'editor.unpublish': 'Unpublish',
    'editor.sharelink': 'Share link',
    'editor.tab.edit': 'Edit',
    'editor.tab.preview': 'Preview',
    'editor.title': 'Menu Title',
    'editor.description': 'Description',
    'editor.section.placeholder': 'New section title...',
    'editor.section.add': 'Add Section',
    'editor.section.delete': 'Delete',
    'editor.section.delete.confirm': 'Delete this section and all its items?',
    'editor.item.placeholder': 'Add item...',
    'editor.item.add': 'Add',
    'editor.item.name': 'Name',
    'editor.item.description': 'Description',
    'editor.item.price': 'Price',
    'editor.item.save': 'Save',
    'editor.item.cancel': 'Cancel',
    'forgot.subtitle': 'Enter your email to receive a reset link.',
    'forgot.submit': 'Send reset link',
    'forgot.sending': 'Sending...',
    'forgot.sent': 'If the email exists, a reset link has been sent. Check your inbox.',
    'forgot.ratelimit': 'Please wait a moment before trying again.',
    'forgot.back': 'Back to login',
    'reset.subtitle': 'Choose a new password.',
    'reset.password.label': 'New Password',
    'reset.confirm.label': 'Confirm Password',
    'reset.submit': 'Reset Password',
    'reset.saving': 'Resetting...',
    'reset.success': 'Your password has been reset!',
    'reset.mismatch': 'Passwords do not match.',
    'reset.invalid': 'Invalid or expired reset link.',
    'reset.login': 'Back to login',
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
    'form.google': 'Continuar com Google',
    'form.divider': 'ou',
    'error.required': 'Por favor, preencha todos os campos.',
    'error.email': 'Por favor, informe um email válido.',
    'error.password': 'A senha deve ter pelo menos 6 caracteres.',
    'lang.label': 'Idioma',
    'lang.en': 'English',
    'lang.ptbr': 'Português (BR)',
    'nav.dashboard': 'Painel',
    'nav.restaurant': 'Restaurante',
    'nav.menus': 'Cardápios',
    'nav.logout': 'Sair',
    'dashboard.welcome': 'Bem-vindo',
    'dashboard.subtitle': 'O que você gostaria de fazer?',
    'dashboard.restaurant': 'Meu Restaurante',
    'dashboard.menus': 'Meus Cardápios',
    'restaurant.title': 'Meu Restaurante',
    'restaurant.loading': 'Carregando...',
    'restaurant.name.label': 'Nome do Restaurante',
    'restaurant.name.required': 'Por favor, insira o nome do restaurante.',
    'restaurant.address.label': 'Endereço',
    'restaurant.phone.label': 'Telefone',
    'restaurant.logo.label': 'URL do Logo',
    'restaurant.save': 'Salvar',
    'restaurant.saving': 'Salvando...',
    'restaurant.saved': 'Salvo!',
    'menus.title': 'Meus Cardápios',
    'menus.loading': 'Carregando...',
    'menus.empty': 'Nenhum cardápio ainda. Crie o primeiro!',
    'menus.create': 'Novo Cardápio',
    'menus.create.placeholder': 'Título do cardápio...',
    'menus.create.submit': 'Criar',
    'menus.edit': 'Editar',
    'menus.delete': 'Excluir',
    'menus.delete.confirm': 'Tem certeza que deseja excluir este cardápio?',
    'menus.published': 'Publicado',
    'menus.draft': 'Rascunho',
    'editor.loading': 'Carregando...',
    'editor.notfound': 'Cardápio não encontrado.',
    'editor.back': 'Voltar aos cardápios',
    'editor.save': 'Salvar',
    'editor.saving': 'Salvando...',
    'editor.saved': 'Salvo!',
    'editor.publish': 'Publicar',
    'editor.unpublish': 'Despublicar',
    'editor.sharelink': 'Link de compartilhamento',
    'editor.tab.edit': 'Editar',
    'editor.tab.preview': 'Visualizar',
    'editor.title': 'Título do Cardápio',
    'editor.description': 'Descrição',
    'editor.section.placeholder': 'Título da nova seção...',
    'editor.section.add': 'Adicionar Seção',
    'editor.section.delete': 'Excluir',
    'editor.section.delete.confirm': 'Excluir esta seção e todos os seus itens?',
    'editor.item.placeholder': 'Adicionar item...',
    'editor.item.add': 'Adicionar',
    'editor.item.name': 'Nome',
    'editor.item.description': 'Descrição',
    'editor.item.price': 'Preço',
    'editor.item.save': 'Salvar',
    'editor.item.cancel': 'Cancelar',
    'forgot.subtitle': 'Insira seu email para receber um link de redefinição.',
    'forgot.submit': 'Enviar link',
    'forgot.sending': 'Enviando...',
    'forgot.sent': 'Se o email existir, um link de redefinição foi enviado. Verifique sua caixa de entrada.',
    'forgot.ratelimit': 'Aguarde um momento antes de tentar novamente.',
    'forgot.back': 'Voltar ao login',
    'reset.subtitle': 'Escolha uma nova senha.',
    'reset.password.label': 'Nova Senha',
    'reset.confirm.label': 'Confirmar Senha',
    'reset.submit': 'Redefinir Senha',
    'reset.saving': 'Redefinindo...',
    'reset.success': 'Sua senha foi redefinida!',
    'reset.mismatch': 'As senhas não coincidem.',
    'reset.invalid': 'Link de redefinição inválido ou expirado.',
    'reset.login': 'Voltar ao login',
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
