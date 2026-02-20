
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_ORG_ID = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16'; // Casa Maria Imóveis

async function verify() {
    console.log(`--- FINAL VERIFICATION FOR ORG ${TARGET_ORG_ID} ---`);

    const { count: leadCount } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('organization_id', TARGET_ORG_ID);
    const { count: memberCount } = await supabase.from('organization_members').select('*', { count: 'exact', head: true }).eq('organization_id', TARGET_ORG_ID);

    console.log(`Leads in Org: ${leadCount}`);
    console.log(`Members in Org: ${memberCount}`);

    const { data: members } = await supabase.from('users').select('name, email').eq('organization_id', TARGET_ORG_ID);
    console.log('Members list:');
    members.forEach(m => console.log(`- ${m.name} (${m.email})`));
}

verify();
