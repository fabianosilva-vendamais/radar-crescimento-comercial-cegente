-- =====================================================================
-- Radar de Crescimento Comercial — Evento VendaMais + Cegente
-- (São José do Rio Preto)
-- Migração inicial: tabelas, Row Level Security (RLS) e função agregada
-- anônima do telão.
--
-- Banco TOTALMENTE separado do projeto Lopas — use um projeto Supabase novo.
--
-- Como aplicar: Supabase → SQL Editor → cole este arquivo → Run.
-- (Instruções passo a passo estão no README-DEPLOY.md.)
--
-- Modelo de segurança exigido:
--   * participantes só INSEREM (anon pode inserir; não pode ler/alterar);
--   * leitura individual apenas para admin autenticado (Supabase Auth);
--   * o telão lê APENAS a função agregada e anônima telao_stats().
-- As gravações reais da aplicação usam a service_role (bypassa RLS) nas
-- rotas de servidor, garantindo a transação completa + geração de código.
-- =====================================================================

-- Extensão para gen_random_uuid()
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------

-- Cadastro + consentimento do participante.
-- origem: registra a procedência dos dados (Evento VendaMais + Cegente).
create table if not exists public.participantes (
  id           uuid primary key default gen_random_uuid(),
  codigo       text not null unique,
  origem       text not null default 'Evento VendaMais + Cegente',
  nome         text not null,
  empresa      text not null,
  email        text not null,
  whats        text not null default '',
  cidade       text not null,
  uf           text not null,
  cargo        text not null,
  segmento     text not null,
  vend         text not null,   -- tamanho da equipe comercial
  unid         text not null,   -- unidades / filiais
  fat          text not null,   -- faixa de faturamento mensal
  obstaculo    text default '', -- P16 (aberta): maior obstáculo para crescer
  interesse    text,            -- P17: interesse na devolutiva consultiva
  tema         text,            -- P18: tema de interesse
  consent      boolean not null default false,   -- autorização de uso dos dados (obrigatória)
  completed    boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists participantes_created_idx on public.participantes (created_at);
create index if not exists participantes_email_idx on public.participantes (email);

-- As 15 respostas de escala (1..5) de cada participante (P1..P15).
create table if not exists public.respostas (
  id              uuid primary key default gen_random_uuid(),
  participante_id uuid not null references public.participantes (id) on delete cascade,
  valores         int[] not null,                -- length 15
  created_at      timestamptz not null default now()
);
create unique index if not exists respostas_part_idx on public.respostas (participante_id);

-- Resultado calculado (nota total 15..75, classificação, dimensões, gargalo,
-- ponto forte e prioridade comercial interna).
create table if not exists public.resultados (
  id              uuid primary key default gen_random_uuid(),
  participante_id uuid not null references public.participantes (id) on delete cascade,
  overall         int,          -- nota total (15..75)
  classificacao   text,
  dim1            int,  -- Clareza estratégica (3..15)
  dim2            int,  -- Diferenciação e proposta de valor (3..15)
  dim3            int,  -- Máquina comercial (3..15)
  dim4            int,  -- Equipe e liderança (3..15)
  dim5            int,  -- Execução e crescimento (3..15)
  forte           text, -- dimensão mais forte
  gargalo         text, -- principal ponto de atenção
  lead_classe     text, -- Quente | Morno | Nutrição — interno, nunca visível ao participante
  lead_fit        int,  -- interno
  created_at      timestamptz not null default now()
);
create unique index if not exists resultados_part_idx on public.resultados (participante_id);

-- Controle de envio de e-mail (fila / tentativas / status)
create table if not exists public.emails (
  id              uuid primary key default gen_random_uuid(),
  participante_id uuid not null references public.participantes (id) on delete cascade,
  status          text not null default 'fila',  -- fila | enviado | erro
  tries           int not null default 0,
  last_date       text not null default '—',
  last_err        text not null default '',
  updated_at      timestamptz not null default now()
);
create unique index if not exists emails_part_idx on public.emails (participante_id);

-- Acompanhamento comercial (anotações internas da equipe VendaMais)
create table if not exists public.acompanhamento (
  id               uuid primary key default gen_random_uuid(),
  participante_id  uuid not null references public.participantes (id) on delete cascade,
  status_comercial text not null default 'Novo',
  contatado        boolean not null default false,
  observacao       text not null default '',
  updated_at       timestamptz not null default now()
);
create unique index if not exists acompanhamento_part_idx on public.acompanhamento (participante_id);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.participantes   enable row level security;
alter table public.respostas       enable row level security;
alter table public.resultados      enable row level security;
alter table public.emails          enable row level security;
alter table public.acompanhamento  enable row level security;

-- Participantes SÓ INSEREM (anon e authenticated podem inserir; sem SELECT/UPDATE/DELETE p/ anon)
drop policy if exists participantes_insert on public.participantes;
create policy participantes_insert on public.participantes
  for insert to anon, authenticated with check (true);

drop policy if exists respostas_insert on public.respostas;
create policy respostas_insert on public.respostas
  for insert to anon, authenticated with check (true);

drop policy if exists resultados_insert on public.resultados;
create policy resultados_insert on public.resultados
  for insert to anon, authenticated with check (true);

-- Leitura individual APENAS para admin autenticado (Supabase Auth)
drop policy if exists participantes_select_auth on public.participantes;
create policy participantes_select_auth on public.participantes
  for select to authenticated using (true);

drop policy if exists respostas_select_auth on public.respostas;
create policy respostas_select_auth on public.respostas
  for select to authenticated using (true);

drop policy if exists resultados_select_auth on public.resultados;
create policy resultados_select_auth on public.resultados
  for select to authenticated using (true);

drop policy if exists emails_select_auth on public.emails;
create policy emails_select_auth on public.emails
  for select to authenticated using (true);

-- Acompanhamento comercial: admin autenticado lê e escreve
drop policy if exists acompanhamento_select_auth on public.acompanhamento;
create policy acompanhamento_select_auth on public.acompanhamento
  for select to authenticated using (true);

drop policy if exists acompanhamento_upsert_auth on public.acompanhamento;
create policy acompanhamento_upsert_auth on public.acompanhamento
  for insert to authenticated with check (true);

drop policy if exists acompanhamento_update_auth on public.acompanhamento;
create policy acompanhamento_update_auth on public.acompanhamento
  for update to authenticated using (true) with check (true);

-- NENHUMA policy de SELECT para anon em nenhuma tabela: o único caminho de
-- leitura pública é a função agregada telao_stats() abaixo.

-- ---------------------------------------------------------------------
-- Telão: função AGREGADA e ANÔNIMA
-- SECURITY DEFINER lê os resultados já calculados (nenhum dado individual
-- sai da função). Abaixo de 10 respostas devolve apenas a contagem.
-- ---------------------------------------------------------------------
create or replace function public.telao_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
  result jsonb;
  gap_name text;
  temas jsonb;
begin
  select count(*) into n from public.resultados;

  if n < 10 then
    return jsonb_build_object('total', n, 'ready', false);
  end if;

  -- gargalo (ponto de atenção) mais frequente do grupo
  select r.gargalo into gap_name
  from public.resultados r
  where r.gargalo is not null and r.gargalo <> ''
  group by r.gargalo
  order by count(*) desc, r.gargalo asc
  limit 1;

  -- temas mais desejados (top 6; o cliente calcula os percentuais e mostra os 4 primeiros)
  select coalesce(jsonb_agg(jsonb_build_object('label', label, 'n', c)), '[]'::jsonb)
    into temas
  from (
    select p.tema as label, count(*) as c
    from public.participantes p
    join public.resultados r on r.participante_id = p.id
    where p.tema is not null and p.tema <> ''
    group by p.tema
    order by count(*) desc, p.tema asc
    limit 6
  ) t;

  select jsonb_build_object(
    'total', n,
    'ready', true,
    'avg_overall', round(avg(overall))::int,
    'dims', jsonb_build_array(
      round(avg(dim1))::int, round(avg(dim2))::int, round(avg(dim3))::int,
      round(avg(dim4))::int, round(avg(dim5))::int
    ),
    'gap', coalesce(gap_name, '—'),
    'temas', temas
  ) into result
  from public.resultados;

  return result;
end;
$$;

-- Apenas a função agregada é exposta ao público (anon) e ao admin.
revoke all on function public.telao_stats() from public;
grant execute on function public.telao_stats() to anon, authenticated;
