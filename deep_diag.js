
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function deepDiag() {
    console.log('--- DEEP DIAG START ---');

    // 1. All Users
    const { data: users } = await supabase.from('users').select('*');

    // 2. All Memberships
    const { data: members } = await supabase.from('organization_members').select('*');

    // 3. All Organizations
    const { data: orgs } = await supabase.from('organizations').select('*');

    // 4. All Invites
    const { data: invites } = await supabase.from('organization_invites').select('*');

    const output = {
        users: users || [],
        members: members || [],
        orgs: orgs || [],
        invites: invites || []
    };

    fs.writeFileSync('diag_deep.json', JSON.stringify(output, null, 2));

    console.log(`Users found: ${output.users.length}`);
    output.users.forEach(u => console.log(` - ${u.name} (${u.email}) | Org: ${u.organization_id}`));

    console.log(`\nMemberships found: ${output.members.length}`);
    output.members.forEach(m => console.log(` - User: ${m.user_id} | Org: ${m.organization_id} | Role: ${m.role}`));

    console.log(`\nInvites found: ${output.invites.length}`);
    output.invites.forEach(i => console.log(` - Email: ${i.email} | Status: ${i.status} | Org: ${i.organization_id}`));
}

deepDiag();
