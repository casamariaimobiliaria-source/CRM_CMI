
async function checkLeads() {
    const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co/rest/v1/';
    const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTcwODgsImV4cCI6MjA4NDc3MzA4OH0.IDW7Dja6UAZKTcCR4IeTkLELW__23pwPfRtX9FyQez0';
    const response = await fetch(url, { headers: { apikey } });
    const schema = await response.json();
    if (schema.definitions && schema.definitions.leads) {
        console.log('LEADS_COLUMNS:', Object.keys(schema.definitions.leads.properties).join('|'));
    } else {
        console.log('LEADS_NOT_FOUND');
    }
}
checkLeads();
