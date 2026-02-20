
import { createClient } from '@supabase/supabase-js';

const kdhqUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const kdhqKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const kdhq = createClient(kdhqUrl, kdhqKey);

const gjdkUrl = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const gjdkKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE5NzA4OCwiZXhwIjoyMDg0NzczMDg4fQ.9NN0lX2NYfxK1HW6azQn__iEnr0_dArNrxp4G8-tprQ';
const gjdk = createClient(gjdkUrl, gjdkKey);

async function checkData() {
    console.log('--- CHECKING KDHQ (CMI) ---');
    const { data: eK, error: errEK } = await kdhq.from('empreendimentos').select('id, nome, organization_id');
    console.log('Empreendimentos:', eK || errEK?.message);
    const { data: oK, error: errOK } = await kdhq.from('origens_lead').select('id, nome, organization_id');
    console.log('Origens:', oK || errOK?.message);

    console.log('\n--- CHECKING GJDK (CMI_Finan) ---');
    // Note: GJDK uses English table names or might not have these tables
    const { data: eG, error: errEG } = await gjdk.from('projects').select('id, name, organization_id');
    console.log('Projects (Enterprises):', eG || errEG?.message);
    const { data: oG, error: errOG } = await gjdk.from('lead_sources').select('id, name, organization_id');
    console.log('Lead Sources:', oG || errOG?.message);
}

checkData();
