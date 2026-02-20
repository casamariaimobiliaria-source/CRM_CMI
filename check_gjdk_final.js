
import { createClient } from '@supabase/supabase-js';
const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
const supabase = createClient(url, anonKey);

async function check() {
    console.log('--- CHECKING GJDK (CMI) ---');
    const { data: leads, error: lErr } = await supabase.from('leads').select('id, nome').limit(5);
    console.log('Leads:', leads, lErr?.message);

    const { data: users, error: uErr } = await supabase.from('users').select('id, name').limit(5);
    console.log('Users:', users, uErr?.message);

    const { data: orgs, error: oErr } = await supabase.from('organizations').select('id, name').limit(5);
    console.log('Orgs:', orgs, oErr?.message);
}
check();
