
import fs from 'fs';
const dump = JSON.parse(fs.readFileSync('DUMP_ALL.json', 'utf8'));
const leads = dump.leads || [];

const orgIds = new Set();
leads.forEach(l => orgIds.add(l.organization_id));

console.log('--- ALL ORG IDs IN LEADS ---');
console.log(Array.from(orgIds));

orgIds.forEach(id => {
    const count = leads.filter(l => l.organization_id === id).length;
    console.log(`Org ${id}: ${count} leads`);
});

const orgs = dump.organizations || [];
orgs.forEach(o => {
    console.log(`Known Org: ${o.id} - ${o.name}`);
});
