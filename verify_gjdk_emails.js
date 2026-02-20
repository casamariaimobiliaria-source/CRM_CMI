
import { createClient } from '@supabase/supabase-js';
const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
const supabase = createClient(url, anonKey);

async function checkUsers() {
    console.log('--- VERIFYING GJDK USERS BY EMAIL ---');
    const emails = ['vivijtelles@hotmail.com', 'graziani.consultoria@gmail.com', 'nubiateles@gmail.com'];
    for (const email of emails) {
        const { data, error } = await supabase.from('users').select('id, name').eq('email', email);
        console.log(`Email ${email}:`, data, error?.message || 'OK');
    }
}
checkUsers();
