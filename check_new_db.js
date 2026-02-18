
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const orgId = '60246bae-58d7-4294-987d-184600b7342e';
    console.log('--- CHECKING SYNC ID:', orgId);

    const { data: org } = await supabase.from('organizations').select('*').eq('id', orgId).single();
    console.log('Organization found:', org);

    const { data: user } = await supabase.from('users').select('*').eq('organization_id', orgId).limit(1);
    console.log('User with this Org ID:', user);

    const { data: ents } = await supabase.from('empreendimentos').select('id, nome').eq('organization_id', orgId).limit(5);
    console.log('Enterprises sample:', ents);
}

checkData();
