import { I18nProvider } from '../i18n';
import { RestaurantForm } from './RestaurantForm';

export function RestaurantApp() {
  return (
    <I18nProvider>
      <RestaurantForm />
    </I18nProvider>
  );
}
