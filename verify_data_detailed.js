
import { createClient } from '@supabase/supabase-js';

const kdhqUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const kdhqKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const kdhq = createClient(kdhqUrl, kdhqKey);

const TARGET_ORG = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16';

async function verifyDetailed() {
    console.log('--- DETAILED VERIFICATION FOR CMI (4760...) ---');

    const { data: eK } = await kdhq.from('empreendimentos').select('*');
    console.log('\n[empreendimentos] Total found:', eK?.length);
    eK?.forEach(e => {
        console.log(`- ${e.nome} | ID: ${e.id} | Org: ${e.organization_id} | Match: ${e.organization_id === TARGET_ORG}`);
    });

    const { data: oK } = await kdhq.from('origens_lead').select('*');
    console.log('\n[origens_lead] Total found:', oK?.length);
    oK?.forEach(o => {
        console.log(`- ${o.nome} | ID: ${o.id} | Org: ${o.organization_id} | Match: ${o.organization_id === TARGET_ORG}`);
    });
}

verifyDetailed();
