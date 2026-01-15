import { I18nProvider } from '../i18n';
import { LoginForm } from './LoginForm';

export function LoginApp() {
  return (
    <I18nProvider>
      <LoginForm />
    </I18nProvider>
  );
}
