
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listAll() {
    console.log('--- LISTING ALL AUTH USERS ---');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) { console.error(error); return; }
    console.log(`Total Auth Users: ${users.length}`);
    users.forEach(u => {
        console.log(` - ${u.email} | ${u.id} | ${u.created_at}`);
    });
}
listAll();
