
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: users } = await supabase.from('users').select('id, name, organization_id');
    console.log('--- USERS ---');
    console.log(JSON.stringify(users, null, 2));

    const { data: orgs } = await supabase.from('organizations').select('id, name');
    console.log('--- ORGANIZATIONS ---');
    console.log(JSON.stringify(orgs, null, 2));

    const { data: leads } = await supabase.from('leads').select('id, nome, organization_id').limit(5);
    console.log('--- LEADS ---');
    console.log(JSON.stringify(leads, null, 2));

    const { data: ents } = await supabase.from('empreendimentos').select('id, nome, organization_id').limit(5);
    console.log('--- EMPREENDIMENTOS ---');
    console.log(JSON.stringify(ents, null, 2));
}

checkData();
