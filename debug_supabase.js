
async function checkSupabase() {
    const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co/rest/v1/';
    const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
    const response = await fetch(url, { headers: { apikey } });
    const schema = await response.json();
    const tables = Object.keys(schema.definitions || {});
    console.log('API TABLES:', tables.join('|'));
    ['empreendimentos', 'origens_lead', 'enterprises', 'lead_sources'].forEach(t => {
        if (schema.definitions[t]) {
            console.log(`${t}:YES:${Object.keys(schema.definitions[t].properties).join(',')}`);
        } else {
            console.log(`${t}:NO`);
        }
    });
}
checkSupabase();
