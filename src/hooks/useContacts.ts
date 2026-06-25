import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Contact = {
  id?: string;
  label: string;
  value: string;
  href: string;
  icon: string;
  sort_order?: number;
};

// Sensible defaults (mirror the admin seed) so the UI looks correct during SSR
// and before the client fetch resolves.
export const DEFAULT_CONTACTS: Contact[] = [
  { label: "Адрес", value: "Куровское, ул. Советская 105", href: "https://yandex.ru/maps/?text=Куровское%20ул.%20Советская%20105", icon: "MapPin" },
  { label: "Почта", value: "tvoy-3d@yandex.ru", href: "mailto:tvoy-3d@yandex.ru", icon: "Mail" },
  { label: "Телефон", value: "+7 (993) 630-70-48", href: "tel:+79936307048", icon: "Phone" },
  { label: "Telegram", value: "@Tvoy3d", href: "https://t.me/Tvoy3d", icon: "Send" },
];

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(DEFAULT_CONTACTS);

  useEffect(() => {
    supabase
      .from("contacts")
      .select("icon, label, value, href, sort_order")
      .order("sort_order")
      .then(({ data }: { data: Contact[] | null }) => {
        if (data && data.length > 0) setContacts(data);
      });
  }, []);

  const byIcon = (icon: string) => contacts.find((c) => c.icon === icon);
  const byLabel = (label: string) => contacts.find((c) => c.label.toLowerCase() === label.toLowerCase());

  return { contacts, byIcon, byLabel };
}
