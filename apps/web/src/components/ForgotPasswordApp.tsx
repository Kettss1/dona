import { I18nProvider } from '../i18n';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export function ForgotPasswordApp() {
  return (
    <I18nProvider>
      <ForgotPasswordForm />
    </I18nProvider>
  );
}
