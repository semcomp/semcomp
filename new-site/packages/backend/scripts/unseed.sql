BEGIN;

-- sales tem FK RESTRICT em users, então limpa vendas antes dos usuários
DELETE FROM consumed_items
    WHERE user_number IN (
        SELECT user_number FROM users WHERE email LIKE 'seed.%@teste.semcomp.com'
    );

DELETE FROM sales
    WHERE sale_user_number IN (
        SELECT user_number FROM users WHERE email LIKE 'seed.%@teste.semcomp.com'
    );
-- sale_items é limpado em CASCADE pela deleção de sales acima

-- sem FK constraint no banco → delete explícito
DELETE FROM signin_events  WHERE event_name LIKE '[SEED]%';
DELETE FROM presences      WHERE event_name LIKE '[SEED]%';

DELETE FROM absence_justifications
    WHERE user_email LIKE 'seed.%@teste.semcomp.com';

-- team_members tem CASCADE de users, mas deletamos primeiro para librar as equipes
DELETE FROM team_members
    WHERE user_number IN (
        SELECT user_number FROM users WHERE email LIKE 'seed.%@teste.semcomp.com'
    );

DELETE FROM teams WHERE name LIKE '[SEED]%';
-- team_members restantes (se houver) são limpados em CASCADE pela deleção de teams

-- papfe_documents tem CASCADE de users; deleta usuários por último neste grupo
DELETE FROM users WHERE email LIKE 'seed.%@teste.semcomp.com';

DELETE FROM events WHERE name LIKE '[SEED]%';

-- combo_items tem RESTRICT em produtos-item, então deleta COMBOs primeiro (CASCADE → combo_items)
DELETE FROM products WHERE name LIKE '[SEED]%' AND type = 'COMBO';
-- kits e coffees agora sem referência; CASCADE limpa as tabelas de especialização
DELETE FROM products WHERE name LIKE '[SEED]%' AND type IN ('KIT', 'COFFEE');

-- sponsor_packages tem CASCADE de sponsors
DELETE FROM sponsors WHERE name LIKE '[SEED]%';

DELETE FROM notices WHERE title   LIKE '[SEED]%';
DELETE FROM riddles WHERE hint1  LIKE '[SEED]%';

-- Ressincroniza as sequences das tabelas populadas pelo seed para que o
-- próximo valor seja MAX+1. Sem isso, IDs inseridos explicitamente (dados
-- reais/importados) deixam a sequence atrás do MAX e o re-seed colide com
-- "duplicate key value violates unique constraint" (ex.: sale_items_pkey).
-- Ignora usuários "sentinela" de teste (user_number >= 100000) para não empurrar
-- a numeração normal (formato de crachá tem 5 dígitos, %05d).
SELECT setval(pg_get_serial_sequence('users', 'user_number'), COALESCE((SELECT MAX(user_number) FROM users WHERE user_number < 100000), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE((SELECT MAX(id) FROM products), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('sales', 'id'), COALESCE((SELECT MAX(id) FROM sales), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('sale_items', 'id'), COALESCE((SELECT MAX(id) FROM sale_items), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('riddles', 'id'), COALESCE((SELECT MAX(id) FROM riddles), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('teams', 'id'), COALESCE((SELECT MAX(id) FROM teams), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('notices', 'id'), COALESCE((SELECT MAX(id) FROM notices), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('papfe_documents', 'id'), COALESCE((SELECT MAX(id) FROM papfe_documents), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('absence_justifications', 'id'), COALESCE((SELECT MAX(id) FROM absence_justifications), 0) + 1, false);
SELECT setval(pg_get_serial_sequence('presence_type_weights', 'id'), COALESCE((SELECT MAX(id) FROM presence_type_weights), 0) + 1, false);

COMMIT;
