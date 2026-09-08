-- Massa Mãe — schema Supabase
-- Uso pessoal/familiar, sem contas de utilizador.
-- Tabelas prefixadas com massamae_ para poderem partilhar projeto Supabase com outras apps.

create table if not exists massamae_starters (
  id uuid primary key default gen_random_uuid(),
  nome text not null default 'Massa Mãe',
  data_inicio date not null,
  storage_mode text not null default 'pending' check (storage_mode in ('pending', 'bancada', 'frigorifico')),
  status text not null default 'ativa' check (status in ('ativa', 'pausada', 'descartada')),
  ultima_alimentacao_em date,
  google_calendar_ligado boolean not null default false,
  criado_em timestamptz not null default now()
);

-- Tokens OAuth do Google Calendar (uma ligação única, pessoal)
create table if not exists massamae_google_tokens (
  id int primary key default 1,
  access_token text,
  refresh_token text,
  expiry_date bigint,
  calendar_id text default 'primary',
  atualizado_em timestamptz not null default now(),
  constraint massamae_google_tokens_singleton check (id = 1)
);

-- Regista cada evento de calendário / lembrete de email já criado, para não duplicar
create table if not exists massamae_lembretes (
  id uuid primary key default gen_random_uuid(),
  starter_id uuid not null references massamae_starters(id) on delete cascade,
  data date not null,
  tipo_tarefa text not null,
  google_event_id text,
  email_enviado boolean not null default false,
  criado_em timestamptz not null default now(),
  unique (starter_id, data)
);

-- Histórico de diagnósticos (respostas ao questionário + recomendação devolvida)
create table if not exists massamae_diagnosticos (
  id uuid primary key default gen_random_uuid(),
  starter_id uuid not null references massamae_starters(id) on delete cascade,
  respostas jsonb not null,
  estado text not null,
  recomendacao text not null,
  criado_em timestamptz not null default now()
);

create index if not exists idx_massamae_lembretes_data on massamae_lembretes(data);
create index if not exists idx_massamae_diagnosticos_starter on massamae_diagnosticos(starter_id);
