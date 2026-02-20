
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(url, serviceKey);

async function inspectSchema() {
    console.log('--- TABLE SCHEMA INSPECTION ---');

    // Check one record from each to see all columns
    const { data: eRow } = await supabase.from('empreendimentos').select('*').limit(1);
    console.log('Empreendimentos columns:', eRow && eRow[0] ? Object.keys(eRow[0]) : 'No records');

    const { data: oRow } = await supabase.from('origens_lead').select('*').limit(1);
    console.log('Origens columns:', oRow && oRow[0] ? Object.keys(oRow[0]) : 'No records');
}
inspectSchema();
