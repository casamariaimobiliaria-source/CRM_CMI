
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

async function fullAudit() {
    console.log('--- FULL ORG & USER AUDIT (KDHQ) ---');

    const { data: orgs } = await supabase.from('organizations').select('id, name');
    console.log('\nOrganizations:');
    orgs?.forEach(o => console.log(`- ${o.name} | ID: ${o.id}`));

    const { data: users } = await supabase.from('users').select('id, name, email, organization_id');
    console.log('\nUsers:');
    users?.forEach(u => console.log(`- ${u.name} | Email: ${u.email} | Org: ${u.organization_id}`));

    console.log('\n--- EXTRA DATA COUNT PER ORG ---');
    for (const org of orgs || []) {
        const { count: eC } = await supabase.from('empreendimentos').select('*', { count: 'exact', head: true }).eq('organization_id', org.id);
        const { count: oC } = await supabase.from('origens_lead').select('*', { count: 'exact', head: true }).eq('organization_id', org.id);
        console.log(`Org: ${org.name} (${org.id}) | Empreendimentos: ${eC} | Origens: ${oC}`);
    }
}
fullAudit();
