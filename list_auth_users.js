
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listAuthUsers() {
    console.log('--- LISTING AUTH USERS ---');
    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        if (error) {
            console.error('Error listing auth users:', error.message);
            return;
        }

        console.log(`Auth users found: ${users.length}`);
        users.forEach(u => {
            console.log(` - ${u.email} (${u.id}) | Created At: ${u.created_at}`);
        });

        fs.writeFileSync('diag_auth_users.json', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error('Failed to list auth users:', e.message);
    }
}

listAuthUsers();
