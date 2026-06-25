import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { TablesUpdate } from "@/integrations/supabase/types";

/**
 * Ozon Seller push-notifications endpoint.
 * Docs: https://docs.ozon.ru/api/seller/#tag/push
 *
 * URL: https://<your-domain>/api/public/ozon-webhook
 *
 * Security: Ozon allows passing a custom token. We require header
 *   "x-ozon-token" === OZON_WEBHOOK_SECRET (set in project secrets).
 * Also Ozon sends a PING event with message_type === "TYPE_PING" — отвечаем 200.
 *
 * Поддерживаемые типы событий (реально полезные для клиента):
 *  - TYPE_PING                       — проверка соединения
 *  - TYPE_NEW_POSTING                — новый заказ (создать запись)
 *  - TYPE_POSTING_CANCELLED          — заказ отменён (обновить статус)
 *  - TYPE_STATE_CHANGED              — смена статуса отправления
 *  - TYPE_CUTOFF_DATE_CHANGED        — изменилась дата отгрузки
 *  - TYPE_DELIVERY_DATE_CHANGED      — изменилась дата доставки
 *  - TYPE_CREATE_OR_UPDATE_RETURN    — возврат/претензия
 */

type OzonProduct = {
  sku?: number | string;
  offer_id?: string;
  name?: string;
  quantity?: number;
  price?: string | number;
  currency_code?: string;
};

type OzonPayload = {
  message_type?: string;
  posting_number?: string;
  order_number?: string;
  new_state?: string;
  status?: string;
  in_process_at?: string;
  shipment_date?: string;
  delivering_date?: string;
  warehouse_name?: string;
  warehouse_id?: number;
  products?: OzonProduct[];
  seller_id?: number;
  return_reason_name?: string;
  cutoff_date?: string;
  tracking_number?: string;
  delivery_method_name?: string;
};

export const Route = createFileRoute("/api/public/ozon-webhook")({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          JSON.stringify({ result: true, message: "Ozon webhook endpoint is alive" }),
          { headers: { "Content-Type": "application/json" } },
        ),

      POST: async ({ request }) => {
        const expected = process.env.OZON_WEBHOOK_SECRET;
        if (!expected) {
          return jsonError("OZON_WEBHOOK_SECRET is not configured", 500);
        }

        // Ozon allows either a header token or a token inside the body — поддерживаем оба.
        const headerToken = request.headers.get("x-ozon-token");

        const raw = await request.text();
        let payload: OzonPayload & { token?: string };
        try {
          payload = JSON.parse(raw);
        } catch {
          return jsonError("Invalid JSON", 400);
        }

        const bodyToken = (payload as { token?: string }).token;
        if (headerToken !== expected && bodyToken !== expected) {
          return jsonError("Unauthorized", 401);
        }

        const messageType = payload.message_type ?? "";

        // 1. PING — Ozon ждёт {"result": true}
        if (messageType === "TYPE_PING") {
          return Response.json({ result: true });
        }

        const postingNumber = payload.posting_number;
        if (!postingNumber) {
          // Событие без номера отправления — просто принять
          return Response.json({ result: true });
        }

        const products = Array.isArray(payload.products)
          ? payload.products.map((p) => ({
              sku: p.sku ?? null,
              offer_id: p.offer_id ?? null,
              name: p.name ?? null,
              quantity: p.quantity ?? 1,
              price: p.price ?? null,
              currency_code: p.currency_code ?? "RUB",
            }))
          : [];

        const totalPrice = products.reduce((sum, p) => {
          const price = Number(p.price ?? 0);
          const qty = Number(p.quantity ?? 1);
          return sum + (Number.isFinite(price) ? price * qty : 0);
        }, 0);

        const currency = products[0]?.currency_code ?? "RUB";
        const status = mapStatus(messageType, payload);

        // upsert по posting_number
        const { data: existing } = await supabaseAdmin
          .from("ozon_orders")
          .select("id, admin_note, products")
          .eq("posting_number", postingNumber)
          .maybeSingle();

        if (existing) {
          const update: TablesUpdate<"ozon_orders"> = {
            status,
            event_type: messageType,
            raw_payload: payload as unknown as TablesUpdate<"ozon_orders">["raw_payload"],
          };
          if (payload.shipment_date) update.shipment_date = payload.shipment_date;
          if (payload.delivering_date) update.delivering_date = payload.delivering_date;
          if (payload.cutoff_date) update.shipment_date = payload.cutoff_date;
          if (payload.warehouse_name) update.warehouse_name = payload.warehouse_name;
          if (payload.delivery_method_name) update.delivery_method = payload.delivery_method_name;
          if (payload.tracking_number) update.tracking_number = payload.tracking_number;
          if (products.length) {
            update.products = products;
            update.total_price = totalPrice;
            update.currency = currency;
          }

          const { error } = await supabaseAdmin
            .from("ozon_orders")
            .update(update)
            .eq("id", existing.id);
          if (error) return jsonError(error.message, 500);
        } else {
          const { error } = await supabaseAdmin.from("ozon_orders").insert({
            posting_number: postingNumber,
            order_number: payload.order_number ?? null,
            status,
            event_type: messageType,
            order_created_at: payload.in_process_at ?? new Date().toISOString(),
            shipment_date: payload.shipment_date ?? payload.cutoff_date ?? null,
            delivering_date: payload.delivering_date ?? null,
            warehouse_name: payload.warehouse_name ?? null,
            delivery_method: payload.delivery_method_name ?? null,
            tracking_number: payload.tracking_number ?? null,
            total_price: totalPrice || null,
            currency,
            products,
            raw_payload: payload,
          });
          if (error) return jsonError(error.message, 500);
        }

        return Response.json({ result: true });
      },
    },
  },
});

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ result: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function mapStatus(messageType: string, payload: OzonPayload): string {
  if (messageType === "TYPE_POSTING_CANCELLED") return "cancelled";
  if (messageType === "TYPE_CREATE_OR_UPDATE_RETURN") return "returned";
  if (messageType === "TYPE_NEW_POSTING") return "awaiting_packaging";
  // STATE_CHANGED / прочее — берём состояние из payload
  return payload.new_state ?? payload.status ?? "awaiting_packaging";
}