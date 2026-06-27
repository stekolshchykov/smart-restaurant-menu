CREATE TABLE IF NOT EXISTS cart_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (table_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_sessions_table_id ON cart_sessions(table_id);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_token ON cart_sessions(token);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_session_id UUID REFERENCES cart_sessions(id) ON DELETE SET NULL,
    table_id UUID NOT NULL REFERENCES tables(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    status TEXT NOT NULL DEFAULT 'submitted',
    total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT orders_status_check CHECK (status IN ('submitted', 'preparing', 'ready', 'served', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_orders_cart_session_id ON orders(cart_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_project_id ON orders(project_id);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    name TEXT NOT NULL,
    base_price NUMERIC(10,2) NOT NULL,
    addons JSONB DEFAULT '[]',
    quantity INT NOT NULL,
    note TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT service_requests_type_check CHECK (type IN ('waiter', 'water', 'napkins', 'bill')),
    CONSTRAINT service_requests_status_check CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_service_requests_table_id ON service_requests(table_id);
