
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrgs() {
    console.log('--- ORGANIZATION MEMBER COUNTS ---');
    const { data: members, error: mError } = await supabase.from('organization_members').select('*');
    if (mError) { console.error(mError); return; }

    const orgCounts = {};
    members.forEach(m => {
        orgCounts[m.organization_id] = (orgCounts[m.organization_id] || 0) + 1;
    });

    const { data: orgs } = await supabase.from('organizations').select('*');
    orgs.forEach(o => {
        console.log(`Org: ${o.id} | Name: ${o.name} | Members: ${orgCounts[o.id] || 0}`);
    });
}
checkOrgs();
