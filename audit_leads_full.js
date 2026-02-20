
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

const ORG_ID = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16';

async function auditLeads() {
    console.log(`--- AUDITING LEADS FOR ORG ${ORG_ID} ---`);
    const { data: leads, error } = await supabase
        .from('leads')
        .select('id, nome, corretor, empreendimento_id, origem_id, empreendimento, midia')
        .eq('organization_id', ORG_ID)
        .limit(20);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    leads.forEach(l => {
        console.log(`Lead: ${l.nome}`);
        console.log(`  - Corretor: ${l.corretor}`);
        console.log(`  - Emp ID: ${l.empreendimento_id} | Name: ${l.empreendimento}`);
        console.log(`  - Org ID: ${l.origem_id} | Media: ${l.midia}`);
        console.log('-------------------');
    });
}
auditLeads();
