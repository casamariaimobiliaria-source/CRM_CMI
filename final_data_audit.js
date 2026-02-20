
import { createClient } from '@supabase/supabase-js';

const kdhqUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const kdhqKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const kdhq = createClient(kdhqUrl, kdhqKey);

const gjdkUrl = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const gjdkKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE5NzA4OCwiZXhwIjoyMDg0NzczMDg4fQ.9NN0lX2NYfxK1HW6azQn__iEnr0_dArNrxp4G8-tprQ';
const gjdk = createClient(gjdkUrl, gjdkKey);

const TARGET_ORG = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16';

async function runAudit() {
    try {
        console.log('--- STARTING AUDIT ---');

        console.log('\n[KDHQ - Empreendimentos]');
        const { data: eK } = await kdhq.from('empreendimentos').select('nome, organization_id');
        if (eK && eK.length > 0) {
            eK.forEach(e => console.log(`- ${e.nome} (${e.organization_id}) | Match: ${e.organization_id === TARGET_ORG}`));
        } else {
            console.log('No records found.');
        }

        console.log('\n[KDHQ - Origens]');
        const { data: oK } = await kdhq.from('origens_lead').select('nome, organization_id');
        if (oK && oK.length > 0) {
            oK.forEach(o => console.log(`- ${o.nome} (${o.organization_id}) | Match: ${o.organization_id === TARGET_ORG}`));
        } else {
            console.log('No records found.');
        }

        console.log('\n[GJDK - Projects]');
        const { data: eG } = await gjdk.from('projects').select('name, organization_id');
        if (eG && eG.length > 0) {
            eG.forEach(e => console.log(`- ${e.name} (${e.organization_id})`));
        } else {
            console.log('No records found.');
        }

        console.log('\n[GJDK - Lead Sources]');
        const { data: oG } = await gjdk.from('lead_sources').select('name, organization_id');
        if (oG && oG.length > 0) {
            oG.forEach(o => console.log(`- ${o.name} (${o.organization_id})`));
        } else {
            console.log('No records found.');
        }

        console.log('\n--- AUDIT COMPLETE ---');
    } catch (err) {
        console.error('Audit failed:', err.message);
    }
}

runAudit();
