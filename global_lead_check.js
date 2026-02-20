
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU2MDg1NywiZXhwIjoyMDc5MTM2ODU3fQ.s2KvN3JjFAJ5K2lNKRDDFaJgLqMdPDDJTXpI_6JrA0A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function globalLeadCheck() {
    const { data: leads, error } = await supabase.from('leads').select('*');
    if (error) {
        console.error('Error leads:', error.message);
        return;
    }

    const orgCounts = {};
    leads.forEach(l => {
        orgCounts[l.organization_id] = (orgCounts[l.organization_id] || 0) + 1;
    });

    const { data: orgs } = await supabase.from('organizations').select('*');
    const { data: users } = await supabase.from('users').select('*');

    const output = {
        totalLeads: leads.length,
        orgCounts,
        orgs: orgs || [],
        users: users || []
    };

    fs.writeFileSync('global_check_result.json', JSON.stringify(output, null, 2));
    console.log(`Saved results: ${leads.length} leads across ${Object.keys(orgCounts).length} organizations.`);
}

globalLeadCheck();
