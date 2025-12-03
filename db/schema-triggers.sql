-- Triggers for automatic synchronization and validations

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists perfis_ensure_admin on public.perfis;
create trigger perfis_ensure_admin
before update or delete on public.perfis
for each row execute function public.ensure_admin_exists();
