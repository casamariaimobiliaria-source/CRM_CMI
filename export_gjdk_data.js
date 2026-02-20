
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';


const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE5NzA4OCwiZXhwIjoyMDg0NzczMDg4fQ.9NN0lX2NYfxK1HW6azQn__iEnr0_dArNrxp4G8-tprQ';
const supabase = createClient(url, serviceKey);

async function exportData() {
    console.log('--- EXPORTING FROM GJDK (CMI_Finan) ---');

    // 1. Get Public Profiles
    const { data: users, error: userError } = await supabase.from('users').select('*');
    if (userError) console.error('User Error:', userError);

    // 2. Get Organization Members
    const { data: members, error: memberError } = await supabase.from('organization_members').select('*');
    if (memberError) console.error('Member Error:', memberError);

    // 3. Get Auth Users (Admin API)
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) console.error('Auth Error:', authError);

    const result = {
        profiles: users || [],
        members: members || [],
        auth: authUsers || []
    };

    fs.writeFileSync('GJDK_EXPORT.json', JSON.stringify(result, null, 2));
    console.log('Export saved to GJDK_EXPORT.json');
}

exportData();
