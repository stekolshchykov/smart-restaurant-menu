CREATE TABLE IF NOT EXISTS project_themes (
    project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    appearance TEXT DEFAULT 'dark',
    accent_color TEXT DEFAULT '#c9a227',
    card_style TEXT DEFAULT 'elevated',
    button_shape TEXT DEFAULT 'rounded',
    show_large_photos BOOLEAN DEFAULT true,
    use_promo_page BOOLEAN DEFAULT true,
    logo_url TEXT,
    hero_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
