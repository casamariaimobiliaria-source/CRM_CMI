
import { createClient } from '@supabase/supabase-js';

const url = 'https://gjdkbbiehsyyfpsgnadm.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZGtiYmllaHN5eWZwc2duYWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE5NzA4OCwiZXhwIjoyMDg0NzczMDg4fQ.9NN0lX2NYfxK1HW6azQn__iEnr0_dArNrxp4G8-tprQ';
const supabase = createClient(url, serviceKey);

const ENT_ID = 'f65ea1ea-042f-4b56-b9e6-cc8fb73615b1';

async function checkEnt() {
    console.log(`--- CHECKING ENTERPRISE ${ENT_ID} IN GJDK ---`);
    const { data: ent, error } = await supabase.from('enterprises').select('name').eq('id', ENT_ID).single();

    if (error) {
        console.error('Error:', error.message);
        // Maybe table name is different?
        const { data: ent2 } = await supabase.from('empreendimentos').select('nome').eq('id', ENT_ID).single();
        console.log('Try empreendimentos:', ent2);
    } else {
        console.log('Enterprise found:', ent);
    }
}
checkEnt();
