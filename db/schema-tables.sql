-- Tables for Sistema de Gestão de Eventos

-- Reference tables
create table if not exists public.equipes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  created_at timestamptz default now()
);

create table if not exists public.departamentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  sigla text
);

-- Profiles synchronized with auth.users
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text unique,
  papel text default 'admin',
  permissoes jsonb default '{}'::jsonb,
  equipe_id uuid references public.equipes(id),
  departamento_id uuid references public.departamentos(id),
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.equipes_membros (
  equipe_id uuid references public.equipes(id) on delete cascade,
  perfil_id uuid references public.perfis(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (equipe_id, perfil_id)
);

-- Core tables
create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  tipo text,
  status text default 'input',
  prioridade text default 'media',
  data_inicio date,
  data_fim date,
  local text,
  departamento_id uuid references public.departamentos(id),
  equipe_id uuid references public.equipes(id),
  responsavel_id uuid references public.perfis(id),
  solicitante_id uuid references public.perfis(id),
  orcamento_previsto numeric,
  orcamento_aprovado numeric,
  participantes_esperados integer,
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.eventos_historico (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid references public.eventos(id) on delete cascade,
  tipo text,
  descricao text,
  autor_id uuid references public.perfis(id),
  created_at timestamptz default now()
);

create table if not exists public.tarefas (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid references public.eventos(id) on delete cascade,
  titulo text not null,
  descricao text,
  responsavel_id uuid references public.perfis(id),
  prazo date,
  status text default 'pendente',
  prioridade text default 'media',
  equipe_id uuid references public.equipes(id),
  data_conclusao date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.orcamentos_itens (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid references public.eventos(id) on delete cascade,
  categoria text,
  descricao text,
  quantidade integer,
  valor_unitario numeric,
  valor_total numeric generated always as (
    (coalesce(quantidade, 0)::numeric) * coalesce(valor_unitario, 0)
  ) stored,
  fornecedor text,
  aprovado boolean default false,
  equipe_id uuid references public.equipes(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orcamentos_itens
  add column if not exists valor_total numeric generated always as (
    (coalesce(quantidade, 0)::numeric) * coalesce(valor_unitario, 0)
  ) stored;

create table if not exists public.aprovacoes (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid references public.eventos(id) on delete cascade,
  tipo text,
  status text default 'pendente',
  solicitante_id uuid references public.perfis(id),
  aprovador_id uuid references public.perfis(id),
  observacoes text,
  equipe_id uuid references public.equipes(id),
  data_solicitacao timestamptz default now(),
  data_resposta timestamptz
);
