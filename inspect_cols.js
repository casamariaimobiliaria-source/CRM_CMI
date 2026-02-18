
async function inspectCols() {
    const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co/rest/v1/';
    const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';

    try {
        const response = await fetch(url, { headers: { apikey } });
        const data = await response.json();
        console.log('--- ENTERPRISES COLUMNS ---');
        console.log(JSON.stringify(data.definitions.enterprises.properties, null, 2));
        console.log('--- LEAD_SOURCES COLUMNS ---');
        console.log(JSON.stringify(data.definitions.lead_sources.properties, null, 2));
        console.log('--- LEADS COLUMNS ---');
        console.log(JSON.stringify(data.definitions.leads.properties, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}
inspectCols();
