import { I18nProvider } from '../i18n';
import { MenuEditor } from './MenuEditor';

export function MenuEditorApp({ menuId }: { menuId: string }) {
  return (
    <I18nProvider>
      <MenuEditor menuId={menuId} />
    </I18nProvider>
  );
}
