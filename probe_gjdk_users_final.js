
import { createClient } from '@supabase/supabase-js';

const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
const supabase = createClient(url, anonKey);

async function probe() {
    console.log('--- PROBING GJDK (CMI_Finan) ---');

    const { data: orgs, error: orgError } = await supabase.from('organizations').select('*');
    console.log('Organizations:', orgs, orgError?.message || 'OK');

    const { data: users, error: userError } = await supabase.from('users').select('id, name, email, organization_id');
    console.log('Users found:', users?.length);
    if (users) {
        users.forEach(u => console.log(`- ${u.name} | ${u.email} | Org: ${u.organization_id}`));
    } else {
        console.log('User error:', userError?.message);
    }
}
probe();
