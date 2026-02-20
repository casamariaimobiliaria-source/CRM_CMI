
import { createClient } from '@supabase/supabase-js';

const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
const supabase = createClient(url, anonKey);

async function listTablesGJDK() {
    console.log('--- LISTING TABLES IN GJDK ---');

    // We can try to query common tables to see if they exist and have data
    const tables = ['leads', 'empreendimentos', 'origens_lead', 'users', 'profiles', 'organizations'];

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`Table ${table}: ERROR (${error.message})`);
        } else {
            console.log(`Table ${table}: ${count} records`);
        }
    }

    // Try to see if there are any others by querying pg_catalog via RPC if possible
    // (Usually not possible with ANON key, but worth a try with common names)
    const extraTables = ['leads_backup', 'leads_old', 'leads_temp', 'temp_leads', 'raw_leads'];
    for (const table of extraTables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
        if (!error) {
            console.log(`Table ${table}: ${count} records (FOUND!)`);
        }
    }
}
listTablesGJDK();
