
import fetch from 'node-fetch';
const url = 'https://kdhqzubnffuqblvhhypz.supabase.co/rest/v1/';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjA4NTcsImV4cCI6MjA3OTEzNjg1N30.KnYyOgTALeRO4RMAQ19B6M3ZEYC8KZrt6BnS31us2Kk';

async function check() {
    console.log('--- COMPREHENSIVE SCHEMA FOR kdhq... ---');
    try {
        const res = await fetch(url, { headers: { apikey } });
        const schema = await res.json();
        const tables = Object.keys(schema.definitions || {}).sort();
        console.log(`Total tables: ${tables.length}`);
        tables.forEach(t => {
            console.log(`Table: ${t}`);
        });

        if (tables.includes('origens_lead')) {
            console.log('FOUND origens_lead!');
        } else {
            console.log('NOT FOUND origens_lead');
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
