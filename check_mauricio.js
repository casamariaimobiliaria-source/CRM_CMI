
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

async function checkMauricio() {
    console.log('--- CHECKING MAURICIO PROFILE ---');
    const { data: users, error } = await supabase.from('users').select('id, name, email, organization_id').ilike('name', '%Mauricio%');

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    for (const u of users) {
        console.log(`User: ${u.name} (${u.email}) | ID: ${u.id} | Org: ${u.organization_id}`);
        const { data: members } = await supabase.from('organization_members').select('*').eq('user_id', u.id);
        console.log(`- Memberships:`, members);
    }
}
checkMauricio();
