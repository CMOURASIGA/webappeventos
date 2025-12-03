-- Script de limpeza completa das tabelas de negócio
-- Execute no Supabase SQL Editor antes de validar novas etapas.
-- Atenção: este script REMOVE TODOS os registros das tabelas listadas.

begin;

truncate table
  public.aprovacoes,
  public.orcamentos_itens,
  public.tarefas,
  public.eventos_historico,
  public.eventos,
  public.equipes_membros,
  public.equipes,
  public.departamentos,
  public.perfis
restart identity cascade;

commit;
