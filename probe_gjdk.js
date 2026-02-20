
import { createClient } from '@supabase/supabase-js';
const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
const supabase = createClient(url, anonKey);

async function probe() {
    console.log('--- PROBING GJDK MEMBERS ---');
    const { data: members, error } = await supabase.from('organization_members').select('*').limit(1);
    if (error) {
        console.log('Error probing:', error.message);
    } else {
        console.log('Probe results:', members);
    }
}
probe();
