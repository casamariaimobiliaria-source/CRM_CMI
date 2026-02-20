
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const supabaseUrl = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOtherDb() {
    console.log('--- CHECKING OTHER DB (gjdk...) ---');

    try {
        const { data: users, error } = await supabase.from('users').select('*');
        if (error) {
            console.error('Error fetching users from other DB:', error.message);
            return;
        }

        console.log(`Users found in other DB: ${users?.length || 0}`);
        users?.forEach(u => console.log(` - ${u.name} (${u.email})`));

        fs.writeFileSync('diag_other_db.json', JSON.stringify(users || [], null, 2));
    } catch (e) {
        console.error('Failed to connect or fetch from other DB:', e.message);
    }
}

checkOtherDb();
