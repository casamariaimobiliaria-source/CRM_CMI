-- SQL para limpar os dados de "Próximo Contato" que foram lançados por engano.
-- ATENÇÃO: Este comando apagará APENAS a data e o tipo de contato da agenda de TODOS os leads.
-- Nenhum outro dado do lead (nome, telefone, histórico) será afetado.

UPDATE leads 
SET 
  proximo_contato = NULL,
  tipo_proximo_contato = NULL;
