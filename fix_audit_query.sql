-- SQL para corrigir o erro de exclusão de leads (Trigger de Auditoria)
-- 
-- Problema: Quando você exclui um lead, o banco de dados tenta salvar no histórico (lead_audit_logs) que ele foi excluído. 
-- Porém, a "Foreign Key" (chave estrangeira) bloqueia esse salvamento porque o lead não existe mais.
--
-- Solução: Remover a chave estrangeira da tabela de logs. Isso permite que o log de exclusão seja salvo e o lead apagado com sucesso.

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'lead_audit_logs_lead_id_fkey'
  ) THEN
    ALTER TABLE lead_audit_logs DROP CONSTRAINT lead_audit_logs_lead_id_fkey;
  END IF;
END $$;
