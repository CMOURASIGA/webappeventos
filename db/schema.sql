-- Master schema orchestrator for Sistema de Gestão de Eventos
-- Execute the files below in order. When running via psql the \i commands
-- will include each section automatically. If your SQL runner does not
-- support \i, execute the referenced files manualmente na ordem indicada.

-- 1) Tables
\i schema-tables.sql

-- 2) Functions
\i schema-functions.sql

-- 3) Triggers
\i schema-triggers.sql

-- 4) Policies (enables RLS)
\i schema-policies.sql
