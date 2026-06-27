-- Performance indexes for frequently queried foreign keys and lookup columns.
CREATE INDEX IF NOT EXISTS idx_menu_items_status ON menu_items(availability_status);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);

CREATE INDEX IF NOT EXISTS idx_modifier_groups_menu_item_id ON modifier_groups(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_modifier_options_modifier_group_id ON modifier_options(modifier_group_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_tables_active ON tables(active);
CREATE INDEX IF NOT EXISTS idx_tables_sort_order ON tables(sort_order);

CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
