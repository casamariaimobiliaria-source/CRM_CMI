
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_ORG_ID = '60246bae-58d7-4294-987d-184600b7342e'; // Imobiliária Principal

async function checkOrgMembers() {
    console.log(`--- MEMBERS OF ORG ${TARGET_ORG_ID} ---`);
    const { data: members, error: mError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', TARGET_ORG_ID);

    if (mError) {
        console.error('Error fetching members:', mError.message);
        return;
    }

    const userIds = members.map(m => m.user_id);
    const { data: users, error: uError } = await supabase
        .from('users')
        .select('*')
        .in('id', userIds);

    if (uError) {
        console.error('Error fetching users:', uError.message);
        return;
    }

    console.log(`Members found: ${members.length}`);
    members.forEach(m => {
        const user = users.find(u => u.id === m.user_id);
        console.log(` - ${user?.name || 'Unknown'} (${user?.email || 'N/A'}) | Role: ${m.role}`);
    });
}

checkOrgMembers();
