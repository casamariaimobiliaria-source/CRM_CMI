
import { createClient } from '@supabase/supabase-js';

// KDHQ (Target)
const kUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const kKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const kdhq = createClient(kUrl, kKey);

// GJDK (Source)
const gUrl = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const gKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE5NzA4OCwiZXhwIjoyMDg0NzczMDg4fQ.9NN0lX2NYfxK1HW6azQn__iEnr0_dArNrxp4G8-tprQ';
const gjdk = createClient(gUrl, gKey);

async function checkDiego() {
    console.log('--- DIEGO SOUSA AUDIT ---');

    console.log('\nChecking GJDK (Source):');
    const { data: gLeads } = await gjdk.from('leads').select('*').ilike('name', '%Diego Sousa%');
    if (gLeads && gLeads.length > 0) {
        for (const l of gLeads) {
            console.log(JSON.stringify(l, null, 2));
            // Get source name
            if (l.source_id) {
                const { data: s } = await gjdk.from('lead_sources').select('name').eq('id', l.source_id).single();
                console.log(`Source Name in GJDK: ${s?.name || 'NOT FOUND'}`);
            }
        }
    } else {
        console.log('Diego Sousa NOT found in GJDK.');
    }

    console.log('\nChecking KDHQ (Target):');
    const { data: kLeads } = await kdhq.from('leads').select('*').ilike('nome', '%Diego Sousa%');
    if (kLeads && kLeads.length > 0) {
        for (const l of kLeads) {
            console.log(JSON.stringify(l, null, 2));
            if (l.origem_id) {
                const { data: s } = await kdhq.from('origens_lead').select('nome').eq('id', l.origem_id).single();
                console.log(`Origin Name in KDHQ: ${s?.nome || 'NOT FOUND'}`);
            }
        }
    } else {
        console.log('Diego Sousa NOT found in KDHQ.');
    }
}
checkDiego();
