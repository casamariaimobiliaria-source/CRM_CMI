
import { createClient } from '@supabase/supabase-js';

const kdhqUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const kdhqKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const kdhq = createClient(kdhqUrl, kdhqKey);

const TARGET_ORG = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16';

async function verify() {
    console.log('--- FINAL VERIFICATION for TARGET_ORG ---');
    const { count: eC } = await kdhq.from('empreendimentos').select('*', { count: 'exact', head: true }).eq('organization_id', TARGET_ORG);
    const { count: oC } = await kdhq.from('origens_lead').select('*', { count: 'exact', head: true }).eq('organization_id', TARGET_ORG);

    console.log(`Empreendimentos: ${eC}`);
    console.log(`Origens: ${oC}`);

    const { data: eList } = await kdhq.from('empreendimentos').select('nome').eq('organization_id', TARGET_ORG);
    console.log('Empreendimentos List:', eList?.map(e => e.nome).join(', '));

    const { data: oList } = await kdhq.from('origens_lead').select('nome').eq('organization_id', TARGET_ORG);
    console.log('Origens List:', oList?.map(o => o.nome).join(', '));
}

verify();
