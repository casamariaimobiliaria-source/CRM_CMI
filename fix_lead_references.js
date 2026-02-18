
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (obtida de src/lib/supabase.ts)
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjA4NTcsImV4cCI6MjA3OTEzNjg1N30.KnYyOgTALeRO4RMAQ19B6M3ZEYC8KZrt6BnS31us2Kk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixReferences() {
    console.log('--- Iniciando Correção de Vínculos de Empreendimentos ---');

    try {
        // 1. Buscar todos os empreendimentos para mapeamento
        const { data: enterprises, error: entError } = await supabase
            .from('empreendimentos')
            .select('id, nome, organization_id');

        if (entError) throw entError;
        console.log(`Encontrados ${enterprises.length} empreendimentos.`);

        // 2. Buscar leads que estão sem ID de empreendimento mas tem o nome
        const { data: leads, error: leadError } = await supabase
            .from('leads')
            .select('id, nome, empreendimento, organization_id')
            .is('empreendimento_id', null)
            .not('empreendimento', 'is', null);

        if (leadError) throw leadError;
        console.log(`Encontrados ${leads.length} leads para processar.`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const lead of leads) {
            const leadEmpName = lead.empreendimento.trim().toLowerCase();

            // Tentar achar o empreendimento correspondente (mesmo nome e mesma organização)
            const match = enterprises.find(e =>
                e.nome.trim().toLowerCase() === leadEmpName &&
                e.organization_id === lead.organization_id
            );

            if (match) {
                console.log(`[MATCH] Lead: ${lead.nome} -> Emp: ${match.nome} (Org: ${match.organization_id})`);

                const { error: updateError } = await supabase
                    .from('leads')
                    .update({ empreendimento_id: match.id })
                    .eq('id', lead.id);

                if (updateError) {
                    console.error(`Erro ao atualizar lead ${lead.id}:`, updateError.message);
                } else {
                    updatedCount++;
                }
            } else {
                console.log(`[AVISO] Sem correspondência exata para o lead: ${lead.nome} (Emp: ${lead.empreendimento})`);
                skippedCount++;
            }
        }

        console.log('\n--- Resumo Final ---');
        console.log(`Total processado: ${leads.length}`);
        console.log(`Atualizados com sucesso: ${updatedCount}`);
        console.log(`Mantidos sem ID (não encontrado): ${skippedCount}`);
        console.log('----------------------------------------------------');

    } catch (err) {
        console.error('Erro Crítico no Script:', err.message);
    }
}

fixReferences();
