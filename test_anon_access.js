
import { createClient } from '@supabase/supabase-js';

const url = 'https://kdhqzubnffuqblvhhypz.supabase.co';
// Using the ANON key from supabase.ts
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjA4NTcsImV4cCI6MjA3OTEzNjg1N30.KnYyOgTALeRO4RMAQ19B6M3ZEYC8KZrt6BnS31us2Kk';
const supabase = createClient(url, anonKey);

const ORG_ID = '47603a8e-557d-4ca3-9c9d-4f00e5e99d16';

async function testAnonAccess() {
    console.log('--- TESTING ANON ACCESS ---');

    const { data: eK, error: eErr } = await supabase.from('empreendimentos').select('id, nome').eq('organization_id', ORG_ID);
    console.log('Empreendimentos:', eK ? eK.length : 0, eErr ? eErr.message : 'No error');

    const { data: oK, error: oErr } = await supabase.from('origens_lead').select('id, nome').eq('organization_id', ORG_ID);
    console.log('Origens:', oK ? oK.length : 0, oErr ? oErr.message : 'No error');
}
testAnonAccess();
