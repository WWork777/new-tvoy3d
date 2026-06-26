export function normalizeRussianPhoneContact(value: string) {
  const contact = value.trim();

  if (!contact || contact.includes("@") || /[a-zа-я]/i.test(contact)) {
    return contact;
  }

  const digits = contact.replace(/\D/g, "");

  if (digits.length === 11 && (digits.startsWith("8") || digits.startsWith("7"))) {
    return `+7${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    return `+7${digits}`;
  }

  return contact;
}
