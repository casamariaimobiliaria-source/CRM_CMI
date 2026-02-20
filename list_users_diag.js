
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listUsers() {
    const { data: users } = await supabase.from('users').select('*');
    const { data: members } = await supabase.from('organization_members').select('*');
    const { data: orgs } = await supabase.from('organizations').select('*');

    const output = {
        users: users || [],
        members: members || [],
        orgs: orgs || []
    };
    fs.writeFileSync('diag_output.json', JSON.stringify(output, null, 2));
    console.log(`Saved ${output.users.length} users, ${output.members.length} members, and ${output.orgs.length} orgs to diag_output.json`);
}

listUsers();
