-- Site insights tables (Neon / Postgres)
-- Applied to neon-cinnabar-tree (lingering-cell-35208024)

CREATE TABLE IF NOT EXISTS site_events (
  id text PRIMARY KEY,
  ts timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL,
  name text NOT NULL,
  path text NOT NULL,
  title text,
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  referrer text,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS site_events_ts_idx ON site_events (ts DESC);
CREATE INDEX IF NOT EXISTS site_events_type_idx ON site_events (type);
CREATE INDEX IF NOT EXISTS site_events_visitor_idx ON site_events (visitor_id);
CREATE INDEX IF NOT EXISTS site_events_path_idx ON site_events (path);
CREATE INDEX IF NOT EXISTS site_events_utm_source_idx ON site_events (utm_source);

CREATE TABLE IF NOT EXISTS site_identities (
  visitor_id text PRIMARY KEY,
  email text,
  name text,
  company text,
  linked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_identities_email_idx ON site_identities (email);
