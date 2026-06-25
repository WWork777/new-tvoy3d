import logo from "@/assets/logo.png";
import type { City } from "@/data/cities";
import { cityPath } from "@/data/cities";
import { useContacts } from "@/hooks/useContacts";

type FooterLink = {
  label: string;
  href: string;
  hash?: string;
};

const SERVICE_LINKS: FooterLink[] = [
  { label: "3D-печать", href: "/services/3dpechat" },
  { label: "Лазерная резка CO₂", href: "/services/rezkaco2" },
  { label: "3D-сканирование", href: "/services/scan" },
  { label: "3D-моделирование", href: "/services/model" },
  { label: "Прототипирование", href: "/services/prototip" },
];

const STUDIO_LINKS: FooterLink[] = [
  { label: "О нас", href: "/about" },
  { label: "Галерея", href: "/gallery" },
  { label: "Блог", href: "/blog" },
  { label: "Процесс", href: "/", hash: "process" },
  { label: "Контакты", href: "/contact" },
];

const isExternalHref = (href: string) => /^https?:/i.test(href);

function footerHref(item: FooterLink, city?: City) {
  const href = city ? cityPath(city, item.href) : item.href;
  return item.hash ? `${href}#${item.hash}` : href;
}

export function Footer({ city }: { city?: City }) {
  const { contacts } = useContacts();

  return (
    <footer className="relative border-t border-foreground/5 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Твой3д" width={26} height={26} className="drop-shadow-[0_0_12px_rgba(219,17,37,0.5)]" />
            <span className="font-display text-base font-semibold">Твой3д</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-foreground/50">
            Премиальная студия 3D-печати и прототипирования. Работаем по всей России.
          </p>
        </div>

        <Col title="Услуги" items={SERVICE_LINKS} city={city} />
        <Col title="Студия" items={STUDIO_LINKS} city={city} />

        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-foreground/40">Контакты</p>
          <ul className="mt-4 space-y-2 text-sm text-foreground/70">
            {contacts.map((contact) => {
              const external = isExternalHref(contact.href);

              return (
                <li key={contact.label}>
                  <a
                    href={contact.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="transition-colors hover:text-foreground"
                  >
                    {contact.value}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-start justify-between gap-3 px-5 text-xs text-foreground/40 sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} Твой3д. Все права защищены.</p>
        <p>Made with precision and red light.</p>
      </div>
    </footer>
  );
}

function Col({ title, items, city }: { title: string; items: FooterLink[]; city?: City }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-foreground/40">{title}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.label}>
            <a href={footerHref(item, city)} className="text-foreground/70 transition-colors hover:text-foreground">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
