
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

async function listOrgs() {
    console.log('--- ALL ORGANIZATIONS IN KDHQ (CMI) ---');
    const { data: orgs, error } = await supabase.from('organizations').select('*');
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Total organizations: ${orgs.length}`);
        orgs.forEach(o => {
            console.log(`- ${o.name} | ID: ${o.id} | Slug: ${o.slug}`);
        });
    }
}
listOrgs();
