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

COMMIT;
