
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpAll() {
    console.log('--- DUMPING ALL DATA ---');

    const tables = ['users', 'organizations', 'organization_members', 'organization_invites', 'leads'];
    const results = {};

    for (const t of tables) {
        console.log(`Fetching ${t}...`);
        const { data, error } = await supabase.from(t).select('*');
        if (error) {
            console.error(`Error ${t}:`, error.message);
        } else {
            results[t] = data;
        }
    }

    fs.writeFileSync('DUMP_ALL.json', JSON.stringify(results, null, 2));
    console.log('--- DUMP COMPLETED ---');
}

dumpAll();
