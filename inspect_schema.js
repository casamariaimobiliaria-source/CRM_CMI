
async function inspectSchema() {
    const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co/rest/v1/';
    const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';

    try {
        const response = await fetch(url, { headers: { apikey } });
        const data = await response.json();
        const tables = Object.keys(data.definitions || {});
        console.log('--- TABLES VISIBLE TO API ---');
        console.log(tables.sort().join(', '));

        if (tables.includes('empreendimentos')) {
            console.log('Column Schema for empreendimentos:', JSON.stringify(data.definitions.empreendimentos.properties, null, 2));
        }
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}
inspectSchema();
