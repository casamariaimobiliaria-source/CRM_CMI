
const fs = require('fs');
async function inspectCols() {
    const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co/rest/v1/';
    const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';

    try {
        const response = await fetch(url, { headers: { apikey } });
        const data = await response.json();
        const result = {
            enterprises: data.definitions.enterprises.properties,
            lead_sources: data.definitions.lead_sources.properties,
            leads: data.definitions.leads.properties
        };
        fs.writeFileSync('full_schema.json', JSON.stringify(result, null, 2));
        console.log('Schema saved to full_schema.json');
    } catch (e) {
        console.error('Error:', e.message);
    }
}
inspectCols();
