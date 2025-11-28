# Sistema de Gestão de Eventos

Aplicação web para coordenar todas as etapas do ciclo de vida de eventos corporativos da CNC. O objetivo inicial é centralizar, em uma única interface, os processos de cadastro, acompanhamento, orçamentos, tarefas e aprovações de eventos, garantindo transparência para todas as áreas envolvidas.

## Objetivos Iniciais
- **Organizar eventos**: registrar informações completas (briefing, responsáveis, local, datas, participantes e status).
- **Controlar fluxo operacional**: visualizar cronogramas, tarefas pendentes e progresso por etapa.
- **Gerenciar orçamento**: listar itens orçamentários, acompanhar solicitações e histórico de aprovações.
- **Disponibilizar insights**: dashboards e relatórios com indicadores-chave (status, prioridades, custos e produtividade).

## Futuro Próximo
- Disponibilizar um backend completo no Supabase, com tabelas para eventos, tarefas, itens de orçamento, aprovações e usuários.
- Expor APIs e policies para automatizar mudanças de status e notificações.
- Persistir as operações hoje simuladas com `mockData`.

## Stack Atual
- **Frontend**: React 18 + Vite + Tailwind
- **Componentes**: Radix UI, Lucide Icons e biblioteca de componentes próprios em `src/components/ui`

## Como Executar Localmente
```bash
npm install
npm run dev
```

O servidor roda em `http://localhost:5173`.
