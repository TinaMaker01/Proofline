-- Schéma Supabase pour Proofline (validation landing page)
-- Exécuter ce script dans l'éditeur SQL de Supabase.

create table if not exists public.proofline_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  consent_gdpr boolean not null default false,
  builder_tool text,
  database_tool text,
  user_scale text,
  pain_point text,
  interested_plan text,
  monthly_budget text,
  app_url text,
  owns_app_confirmed boolean not null default false,
  interview_opt_in boolean not null default false,
  locale text not null default 'fr',
  source text not null default 'hero',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proofline_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  plan_id text,
  email text,
  locale text not null default 'fr',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

-- Activer RLS (aucun accès public anonyme : uniquement via service_role côté serveur)
alter table public.proofline_leads enable row level security;
alter table public.proofline_events enable row level security;

-- Droits Data API explicites (requis par Supabase pour les nouvelles tables).
-- Seul le serveur (clé secrète = rôle service_role) peut lire et écrire.
revoke all on table public.proofline_leads, public.proofline_events from anon, authenticated;
grant select, insert, update on table public.proofline_leads to service_role;
grant select, insert on table public.proofline_events to service_role;
