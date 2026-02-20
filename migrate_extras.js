
import { createClient } from '@supabase/supabase-js';

const kdhqUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const kdhqKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const kdhq = createClient(kdhqUrl, kdhqKey);

const gjdkUrl = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const gjdkKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE5NzA4OCwiZXhwIjoyMDg0NzczMDg4fQ.9NN0lX2NYfxK1HW6azQn__iEnr0_dArNrxp4G8-tprQ';
const gjdk = createClient(gjdkUrl, gjdkKey);

const TARGET_ORG = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16';

async function migrateExtras() {
    console.log('--- STARTING EXTRA DATA MIGRATION ---');

    // 1. Update existing records in KDHQ
    console.log('Updating existing KDHQ records to TARGET_ORG...');
    await kdhq.from('empreendimentos').update({ organization_id: TARGET_ORG }).not('organization_id', 'eq', TARGET_ORG);
    await kdhq.from('origens_lead').update({ organization_id: TARGET_ORG }).not('organization_id', 'eq', TARGET_ORG);
    console.log('KDHQ records updated.');

    // 2. Fetch Lead Sources from GJDK
    console.log('Fetching Lead Sources from GJDK...');
    const { data: oG } = await gjdk.from('lead_sources').select('name');

    if (oG && oG.length > 0) {
        console.log(`Found ${oG.length} sources in GJDK. Syncing to KDHQ...`);
        for (const source of oG) {
            // Check if exists in KDHQ by name
            const { data: existing } = await kdhq.from('origens_lead').select('id').eq('nome', source.name).eq('organization_id', TARGET_ORG);

            if (!existing || existing.length === 0) {
                console.log(`- Adding ${source.name} to KDHQ`);
                await kdhq.from('origens_lead').insert({
                    nome: source.name,
                    organization_id: TARGET_ORG
                });
            } else {
                console.log(`- ${source.name} already exists in KDHQ. Skipping.`);
            }
        }
    }

    console.log('--- MIGRATION COMPLETE ---');
}

migrateExtras();
