
import { createClient } from '@supabase/supabase-js';

const kdhqUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const kdhqKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const kdhq = createClient(kdhqUrl, kdhqKey);

const gjdkUrl = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const gjdkKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE5NzA4OCwiZXhwIjoyMDg0NzczMDg4fQ.9NN0lX2NYfxK1HW6azQn__iEnr0_dArNrxp4G8-tprQ';
const gjdk = createClient(gjdkUrl, gjdkKey);

const TARGET_ORG = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16';

async function checkData() {
    console.log('--- KDHQ (CMI) AUDIT ---');
    const { data: eK } = await kdhq.from('empreendimentos').select('nome, organization_id');
    console.log('Empreendimentos in KDHQ:');
    eK?.forEach(e => console.log(`- ${e.nome} | Org: ${e.organization_id} | Match: ${e.organization_id === TARGET_ORG}`));

    const { data: oK } = await kdhq.from('origens_lead').select('nome, organization_id');
    console.log('Origens in KDHQ:');
    oK?.forEach(o => console.log(`- ${o.nome} | Org: ${o.organization_id} | Match: ${o.organization_id === TARGET_ORG}`));

    console.log('\n--- GJDK (CMI_Finan) AUDIT ---');
    const { data: eG } = await gjdk.from('projects').select('name, organization_id');
    console.log('Projects in GJDK:');
    eG?.forEach(e => console.log(`- ${e.name} | Org: ${e.organization_id}`));

    const { data: oG } = await gjdk.from('lead_sources').select('name, organization_id');
    console.log('Sources in GJDK:');
    oG?.forEach(o => console.log(`- ${o.name} | Org: ${o.organization_id}`));
}

checkData();
