import { I18nProvider } from '../i18n';
import { MenuList } from './MenuList';

export function MenuListApp() {
  return (
    <I18nProvider>
      <MenuList />
    </I18nProvider>
  );
}
