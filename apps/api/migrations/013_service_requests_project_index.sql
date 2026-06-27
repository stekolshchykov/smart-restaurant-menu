-- Index to support staff service-request list queries.
-- service_requests does not have project_id; we join through tables, so the
-- composite index on (table_id, status, created_at) lets the database filter
-- by table efficiently and sort the most recent requests first.
CREATE INDEX IF NOT EXISTS idx_service_requests_table_status_created
ON service_requests(table_id, status, created_at);
