
import { createClient } from '@supabase/supabase-js';

const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE5NzA4OCwiZXhwIjoyMDg0NzczMDg4fQ.9NN0lX2NYfxK1HW6azQn__iEnr0_dArNrxp4G8-tprQ';
const supabase = createClient(url, serviceKey);

async function searchJulia() {
    console.log('--- SEARCHING JULIA IN GJDK (SERVICE ROLE) ---');

    // First, let's see which columns exist in leads so we don't guess
    const { data: colsData, error: colsError } = await supabase.from('leads').select('*').limit(1);
    if (colsError) {
        console.error('Error fetching columns:', colsError.message);
        return;
    }

    const columns = colsData && colsData.length > 0 ? Object.keys(colsData[0]) : [];
    console.log('Leads Columns:', columns);

    const nameCol = columns.find(c => c === 'nome' || c === 'name' || c === 'full_name');
    if (!nameCol) {
        console.error('Could not find name column');
        return;
    }

    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .ilike(nameCol, '%Julia Martins%');

    if (error) {
        console.error('Error during search:', error.message);
        return;
    }

    if (leads && leads.length > 0) {
        console.log('Found results in GJDK:');
        leads.forEach(l => {
            console.log(JSON.stringify(l, null, 2));
            console.log('-------------------');
        });
    } else {
        console.log('Julia Martins NOT found in GJDK (even with Service Role).');

        // Try searching by phone number 95483-5555
        const phoneCol = columns.find(c => c === 'telefone' || c === 'phone');
        if (phoneCol) {
            const { data: byPhone } = await supabase
                .from('leads')
                .select('*')
                .ilike(phoneCol, '%95483%');
            console.log('Results by phone:', byPhone);
        }
    }
}
searchJulia();
