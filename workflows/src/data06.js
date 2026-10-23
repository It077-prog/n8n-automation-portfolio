// Dummy recruitment pipeline (fictional). Each row = [client, role, furthest stage reached, number of candidates].
// "Held" = sitting in the database, never contacted, so it has no client or role.
const rows = [
  [null, null, 'Held', 40],
  ['Northgate Capital', 'Quant Researcher', 'Contacted', 6],
  ['Northgate Capital', 'Quant Researcher', 'Engaged', 4],
  ['Northgate Capital', 'Quant Researcher', 'Submitted', 3],
  ['Northgate Capital', 'Quant Researcher', 'Interview', 2],
  ['Northgate Capital', 'Quant Researcher', 'Offer', 1],
  ['Northgate Capital', 'Quant Researcher', 'Placed', 1],
  ['Helix Trading', 'Low-Latency Developer', 'Contacted', 5],
  ['Helix Trading', 'Low-Latency Developer', 'Engaged', 3],
  ['Helix Trading', 'Low-Latency Developer', 'Submitted', 2],
  ['Helix Trading', 'Low-Latency Developer', 'Interview', 1],
  ['Orbit Systems', 'Infrastructure Engineer', 'Contacted', 4],
  ['Orbit Systems', 'Infrastructure Engineer', 'Engaged', 2],
  ['Orbit Systems', 'Infrastructure Engineer', 'Submitted', 1],
  ['Orbit Systems', 'Infrastructure Engineer', 'Sourced?', 1],
];
const out = [];
let n = 1;
for (const [client, role, stage, count] of rows) {
  for (let i = 0; i < count; i++) out.push({ json: { id: 'P' + String(n++).padStart(3, '0'), client, role, furthest_stage: stage } });
}
return out;
