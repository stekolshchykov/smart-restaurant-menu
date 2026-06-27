-- Index for admin order status filtering.
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
