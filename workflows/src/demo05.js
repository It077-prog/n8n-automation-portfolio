// Demo: incoming leads, one of which is bad. The Validate step stops the run loudly instead of passing bad data on.
const leads = [
  { id: 'L1', name: 'Nadia Karim', email: 'nadia@example.com', source: 'Instagram' },
  { id: 'L2', name: 'Peter Shaw', email: 'peter@example.com', source: 'Website form' },
  { id: 'L3', name: 'Rina Das', email: '', source: 'WhatsApp' },
];
const bad = leads.filter((l) => !l.email);
if (bad.length) {
  throw new Error('Validation failed: required field missing (email) for record ' + bad.map((b) => b.id).join(', '));
}
return leads.map((l) => ({ json: l }));
