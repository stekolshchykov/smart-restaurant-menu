CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_project_id ON categories(project_id);

CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    short_description TEXT,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL,
    image_url TEXT,
    images TEXT[] NOT NULL DEFAULT '{}',
    ingredients TEXT[] NOT NULL DEFAULT '{}',
    availability_status TEXT NOT NULL DEFAULT 'available',
    quick_add_enabled BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);

CREATE TABLE IF NOT EXISTS modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    required BOOLEAN NOT NULL DEFAULT false,
    min_select INT NOT NULL DEFAULT 0,
    max_select INT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_modifier_groups_menu_item_id ON modifier_groups(menu_item_id);

CREATE TABLE IF NOT EXISTS modifier_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modifier_group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_modifier_options_group_id ON modifier_options(modifier_group_id);

CREATE TABLE IF NOT EXISTS allergens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT
);

CREATE INDEX IF NOT EXISTS idx_allergens_project_id ON allergens(project_id);

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    kind TEXT NOT NULL DEFAULT 'dietary'
);

CREATE INDEX IF NOT EXISTS idx_tags_project_id ON tags(project_id);

CREATE TABLE IF NOT EXISTS item_allergens (
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    allergen_id UUID NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, allergen_id)
);

CREATE TABLE IF NOT EXISTS item_tags (
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, tag_id)
);
