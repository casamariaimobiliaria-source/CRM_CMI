
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

async function cleanAudit() {
    console.log('--- CLEAN ORG & EXTRA DATA AUDIT ---');

    const { data: orgs } = await supabase.from('organizations').select('id, name');

    for (const org of orgs || []) {
        const { count: eC } = await supabase.from('empreendimentos').select('*', { count: 'exact', head: true }).eq('organization_id', org.id);
        const { count: oC } = await supabase.from('origens_lead').select('*', { count: 'exact', head: true }).eq('organization_id', org.id);
        console.log(`ORG: [${org.name}] ID: ${org.id}`);
        console.log(`  -> Empreendimentos: ${eC}`);
        console.log(`  -> Origens: ${oC}`);
        console.log('-----------------------------------');
    }

    const { data: users } = await supabase.from('users').select('name, email, organization_id');
    console.log('\n--- USERS ---');
    users?.forEach(u => {
        const orgName = orgs?.find(o => o.id === u.organization_id)?.name || 'UNKNOWN';
        console.log(`USER: ${u.name} | ORG: ${orgName} (${u.organization_id})`);
    });
}
cleanAudit();
