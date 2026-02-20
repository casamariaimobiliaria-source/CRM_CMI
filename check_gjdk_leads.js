
import { createClient } from '@supabase/supabase-js';
const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIwMDc2MiwiZXhwIjoyMDg0NzYwNzYyfQ.4Xv-_X-G-G-X_G_X_G_X_G_X_G_X_G_X_G_X_G_X_G';
// Wait, I don't have the real service key for gjdk.
// I'll use the ANON key I have from debug_supabase.js
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
const supabase = createClient(url, anonKey);

async function checkOther() {
    console.log('--- CHECKING GJDK (ANON) ---');
    const { data: leads, error: lError } = await supabase.from('leads').select('*').limit(5);
    console.log('Leads found:', leads ? leads.length : 'Error or 0');
    if (lError) console.log('Error leads:', lError.message);

    const { data: users, error: uError } = await supabase.from('users').select('*').limit(5);
    console.log('Users found:', users ? users.length : 'Error or 0');
    if (uError) console.log('Error users:', uError.message);
}
checkOther();
