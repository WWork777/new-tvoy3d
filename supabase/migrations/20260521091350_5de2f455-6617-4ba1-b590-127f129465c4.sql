CREATE TABLE public.ozon_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  posting_number TEXT NOT NULL UNIQUE,
  order_number TEXT,
  status TEXT NOT NULL DEFAULT 'awaiting_packaging',
  event_type TEXT,
  order_created_at TIMESTAMPTZ,
  shipment_date TIMESTAMPTZ,
  delivering_date TIMESTAMPTZ,
  total_price NUMERIC(12,2),
  currency TEXT DEFAULT 'RUB',
  customer_name TEXT,
  customer_phone TEXT,
  delivery_address TEXT,
  warehouse_name TEXT,
  delivery_method TEXT,
  tracking_number TEXT,
  products JSONB NOT NULL DEFAULT '[]'::jsonb,
  admin_note TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ozon_orders_status ON public.ozon_orders(status);
CREATE INDEX idx_ozon_orders_created_at ON public.ozon_orders(created_at DESC);

ALTER TABLE public.ozon_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read ozon orders" ON public.ozon_orders
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update ozon orders" ON public.ozon_orders
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete ozon orders" ON public.ozon_orders
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "service can insert ozon orders" ON public.ozon_orders
  FOR INSERT WITH CHECK (true);

CREATE TRIGGER set_ozon_orders_updated_at
  BEFORE UPDATE ON public.ozon_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();