import { useI18n } from '../i18n';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

interface Menu {
  title: string;
  description: string | null;
  sections: MenuSection[];
}

export function MenuPreview({ menu }: { menu: Menu }) {
  const { locale } = useI18n();

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return new Intl.NumberFormat(locale, { style: 'currency', currency: locale === 'pt-BR' ? 'BRL' : 'USD' }).format(num);
  };

  return (
    <div className="preview">
      <h2 className="preview-title">{menu.title}</h2>
      {menu.description && <p className="preview-description">{menu.description}</p>}
      {menu.sections.map((section) => (
        <div key={section.id} className="preview-section">
          <h3 className="preview-section-title">{section.title}</h3>
          {section.items.map((item) => (
            <div key={item.id} className="preview-item">
              <div className="preview-item-header">
                <span className="preview-item-name">{item.name}</span>
                {item.price && <span className="preview-item-price">{formatPrice(item.price)}</span>}
              </div>
              {item.description && <p className="preview-item-desc">{item.description}</p>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
