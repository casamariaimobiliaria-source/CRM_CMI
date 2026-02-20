
import fetch from 'node-fetch';

async function compare() {
    const projects = [
        { name: 'kdhq...', url: 'https://kdhqzubnffuqblvhhypz.supabase.co/rest/v1/', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjA4NTcsImV4cCI6MjA3OTEzNjg1N30.KnYyOgTALeRO4RMAQ19B6M3ZEYC8KZrt6BnS31us2Kk' },
        { name: 'gjdk...', url: 'https://gjdkbbiehsyyfpsgnadm.supabase.co/rest/v1/', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0' }
    ];

    for (const p of projects) {
        console.log(`--- SCHEMA FOR ${p.name} ---`);
        try {
            const res = await fetch(p.url, { headers: { apikey: p.key } });
            const schema = await res.json();
            const tables = Object.keys(schema.definitions || {});
            console.log('Tables:', tables.sort().join('|'));
            console.log('Has empreendimentos:', tables.includes('empreendimentos'));
            console.log('Has enterprises:', tables.includes('enterprises'));
        } catch (e) {
            console.log('Error:', e.message);
        }
    }
}
compare();
