-- Row level security configuration

alter table public.perfis enable row level security;
alter table public.equipes enable row level security;
alter table public.equipes_membros enable row level security;
alter table public.eventos enable row level security;
alter table public.tarefas enable row level security;
alter table public.orcamentos_itens enable row level security;
alter table public.aprovacoes enable row level security;

create policy if not exists "perfis: self access"
  on public.perfis using (id = auth.uid());

create policy if not exists "perfis: self insert"
  on public.perfis for insert with check (id = auth.uid());

drop policy if exists "perfis: admin read" on public.perfis;
create policy "perfis: admin read"
  on public.perfis
  for select using (public.is_admin());

create policy if not exists "perfis: manage teams"
  on public.perfis
  for update using (auth.role() = 'authenticated')
  with check (true);

create policy if not exists "equipes: read all"
  on public.equipes
  for select using (auth.role() = 'authenticated');

create policy if not exists "equipes: manage"
  on public.equipes
  for insert with check (auth.role() = 'authenticated');

create policy if not exists "equipes_membros: read own"
  on public.equipes_membros
  for select using (perfil_id = auth.uid());

create policy if not exists "equipes_membros: link self"
  on public.equipes_membros
  for insert with check (perfil_id = auth.uid());

create policy if not exists "equipes_membros: unlink self"
  on public.equipes_membros
  for delete using (perfil_id = auth.uid());

drop policy if exists "equipes_membros: admin insert" on public.equipes_membros;
create policy "equipes_membros: admin insert"
  on public.equipes_membros
  for insert
  with check (public.is_admin());

drop policy if exists "equipes_membros: admin delete" on public.equipes_membros;
create policy "equipes_membros: admin delete"
  on public.equipes_membros
  for delete
  using (public.is_admin());

drop policy if exists "equipes: own team" on public.equipes;
create policy "equipes: own team"
  on public.equipes
  for select using (
    exists (
      select 1 from public.equipes_membros em
      where em.equipe_id = public.equipes.id and em.perfil_id = auth.uid()
    )
  );

create policy if not exists "eventos: same team"
  on public.eventos
  using (
    exists (
      select 1 from public.equipes_membros em
      where em.equipe_id = public.eventos.equipe_id and em.perfil_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.equipes_membros em
      where em.equipe_id = public.eventos.equipe_id and em.perfil_id = auth.uid()
    )
  );

create policy if not exists "tarefas: same team"
  on public.tarefas
  using (
    exists (
      select 1 from public.equipes_membros em
      where em.equipe_id = public.tarefas.equipe_id and em.perfil_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.equipes_membros em
      where em.equipe_id = public.tarefas.equipe_id and em.perfil_id = auth.uid()
    )
  );

create policy if not exists "orcamentos: same team"
  on public.orcamentos_itens
  using (
    exists (
      select 1 from public.equipes_membros em
      where em.equipe_id = public.orcamentos_itens.equipe_id and em.perfil_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.equipes_membros em
      where em.equipe_id = public.orcamentos_itens.equipe_id and em.perfil_id = auth.uid()
    )
  );

create policy if not exists "aprovacoes: same team"
  on public.aprovacoes
  using (
    exists (
      select 1 from public.equipes_membros em
      where em.equipe_id = public.aprovacoes.equipe_id and em.perfil_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.equipes_membros em
      where em.equipe_id = public.aprovacoes.equipe_id and em.perfil_id = auth.uid()
    )
  );
