
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdhqzubnffuqblvhhypz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHF6dWJuZmZ1cWJsdmhoeXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NjA4NTcsImV4cCI6MjA3OTEzNjg1N30.KnYyOgTALeRO4RMAQ19B6M3ZEYC8KZrt6BnS31us2Kk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkResults() {
    const { data, error } = await supabase
        .from('leads')
        .select('id, nome, empreendimento, empreendimento_id')
        .not('empreendimento', 'is', null)
        .limit(10);

    if (error) {
        console.error(error);
        return;
    }

    console.table(data);
}

checkResults();
