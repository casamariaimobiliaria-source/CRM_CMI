import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERRO CRÍTICO: Variáveis de ambiente do Supabase não configuradas!');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Instance Lock Protection
export const EXPECTED_INSTANCE_ID = import.meta.env.VITE_DB_INSTANCE_ID || 'cmi_crm_prod';

export async function validateDatabaseInstance() {
    try {
        if (!supabaseUrl || !supabaseAnonKey) return false;

        const { data, error } = await supabase
            .from('system_settings')
            .select('db_instance_id')
            .eq('id', 'global')
            .maybeSingle();

        if (error) {
            console.error('Erro ao verificar instância:', error.message);
            return false; // Bloqueia se houver erro (tabela não existe, etc)
        }

        if (!data || !data.db_instance_id) {
            console.error('ID da instância não encontrado no banco de dados.');
            return false; // Bloqueia se não estiver tagueado
        }

        if (data.db_instance_id !== EXPECTED_INSTANCE_ID) {
            console.error(`CONFLITO DE BANCO DE DADOS! Esperado: ${EXPECTED_INSTANCE_ID} | Recebido: ${data.db_instance_id}`);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Falha catastrófica ao verificar instância:', err);
        return false;
    }
}
