
import fetch from 'node-fetch';
const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co/rest/v1/';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';

async function check() {
    console.log('--- SCHEMA FOR gjdk... ---');
    try {
        const res = await fetch(url, { headers: { apikey } });
        const schema = await res.json();
        const tables = Object.keys(schema.definitions || {});
        console.log('Tables:', tables.sort().join('|'));
        console.log('Has empreendimentos:', tables.includes('empreendimentos'));
        console.log('Has enterprises:', tables.includes('enterprises'));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
