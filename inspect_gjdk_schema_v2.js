
import { createClient } from '@supabase/supabase-js';

const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA3OTEzNjA4N30.KnYyOgTALeRO4RMAQ19B6M3ZEYC8KZrt6BnS31us2Kk';
// Wait, I copied the wrong key in my mind. Let me get it from check_gjdk_leads.js
const realAnon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
const supabase = createClient(url, realAnon);

async function inspectGJDK() {
    console.log('--- INSPECTING GJDK LEADS SCHEMA ---');
    const { data, error } = await supabase.from('leads').select('*').limit(1);

    if (error) {
        console.error('Error:', error.message);
    } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('Sample data:', data[0]);
    } else {
        console.log('No data found in GJDK leads.');
    }
}
inspectGJDK();
