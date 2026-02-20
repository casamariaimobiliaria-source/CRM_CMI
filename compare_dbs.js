
import { createClient } from '@supabase/supabase-js';

const projects = [
    { name: 'kdhq...', url: 'https://kdhqzubnffuqblvhhypz.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjA4NTcsImV4cCI6MjA3OTEzNjg1N30.KnYyOgTALeRO4RMAQ19B6M3ZEYC8KZrt6BnS31us2Kk' },
    { name: 'gjdk...', url: 'https://gjdkbbiehsyyfpsgnadm.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0' }
];

async function checkLeads() {
    for (const p of projects) {
        console.log(`--- Checking ${p.name} ---`);
        const supabase = createClient(p.url, p.key);

        try {
            const { count, error } = await supabase.from('leads').select('*', { count: 'exact', head: true });
            if (error) {
                console.log(`Error in 'leads': ${error.message}`);
            } else {
                console.log(`'leads' count: ${count}`);
            }

            const { count: usersCount, error: usersError } = await supabase.from('users').select('*', { count: 'exact', head: true });
            if (usersError) {
                console.log(`Error in 'users': ${usersError.message}`);
            } else {
                console.log(`'users' count: ${usersCount}`);
            }
        } catch (e) {
            console.log(`Fatal error checking ${p.name}: ${e.message}`);
        }
    }
}

checkLeads();
