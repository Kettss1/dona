import { I18nProvider } from '../i18n';
import { ResetPasswordForm } from './ResetPasswordForm';

export function ResetPasswordApp() {
  return (
    <I18nProvider>
      <ResetPasswordForm />
    </I18nProvider>
  );
}
