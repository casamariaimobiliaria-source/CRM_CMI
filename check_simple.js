
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: orgs } = await supabase.from('organizations').select('*');
    console.log('Orgs:', orgs);

    const { data: leadsCount } = await supabase.from('leads').select('id', { count: 'exact', head: true });
    console.log('Total Leads:', leadsCount);

    const { data: leadsSample } = await supabase.from('leads').select('nome, organization_id').limit(3);
    console.log('Leads Sample:', leadsSample);

    const { data: users } = await supabase.from('users').select('id, name, organization_id');
    console.log('Users:', users);
}

checkData();
