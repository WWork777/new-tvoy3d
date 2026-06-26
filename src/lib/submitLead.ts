export type LeadPayload = {
  name: string;
  contact: string;
  service?: string | null;
  material?: string | null;
  volume?: string | null;
  message?: string | null;
  source?: string | null;
};

export async function submitLead(payload: LeadPayload) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Не удалось отправить заявку");
  }

  return data;
}
