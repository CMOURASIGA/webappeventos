-- Functions used throughout the schema

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfis (id, email, nome, papel, permissoes)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    'admin',
    jsonb_build_object('aprovacoes', true)
  )
  on conflict (id) do update
    set email = excluded.email,
        nome = excluded.nome,
        papel = coalesce(public.perfis.papel, excluded.papel),
        permissoes = coalesce(public.perfis.permissoes, excluded.permissoes),
        updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.ensure_admin_exists()
returns trigger as $$
declare
  admin_count integer;
begin
  if (tg_op = 'DELETE') then
    if old.papel = 'admin' then
      select count(*) into admin_count from public.perfis where id <> old.id and papel = 'admin';
      if admin_count = 0 then
        raise exception 'Deve existir pelo menos um administrador ativo.';
      end if;
    end if;
    return old;
  else
    if old.papel = 'admin' and new.papel <> 'admin' then
      select count(*) into admin_count from public.perfis where id <> old.id and papel = 'admin';
      if admin_count = 0 then
        raise exception 'Deve existir pelo menos um administrador ativo.';
      end if;
    end if;
    return new;
  end if;
end;
$$ language plpgsql security definer;

create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
stable
as $$
declare
  result boolean := false;
begin
  select coalesce(papel, 'admin') = 'admin'
  into result
  from public.perfis
  where id = auth.uid();

  return coalesce(result, false);
end;
$$;
