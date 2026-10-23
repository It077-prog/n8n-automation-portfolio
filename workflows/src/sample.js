// Dummy candidate records (fictional). Deliberately contains duplicates, gaps and stale rows.
const records = [
  { id: 'C001', full_name: 'Aisha Rahman', email: 'aisha.rahman@example.com', phone: '+971 50 111 2233', company: 'Northgate Capital', specialism: 'Quant Research', owner: 'Sam', stage: 'Engaged', last_contacted: '2026-09-18' },
  { id: 'C002', full_name: 'Aisha  Rahman', email: 'AISHA.RAHMAN@example.com', phone: '0097150 111 2233', company: 'Northgate Capital', specialism: 'quant', owner: 'Sam', stage: 'Contacted', last_contacted: '2026-08-02' },
  { id: 'C003', full_name: 'Tom Becker', email: 'tom.becker@example.com', phone: '', company: 'Helix Trading', specialism: 'Trading Tech', owner: '', stage: 'Held', last_contacted: '2025-01-10' },
  { id: 'C004', full_name: 'Li Wei', email: 'li.wei@example', phone: '+971 55 222 3344', company: 'Orbit Systems', specialism: 'Infra', owner: 'Priya', stage: 'Submitted', last_contacted: '2026-10-01' },
  { id: 'C005', full_name: 'Maria Costa', email: 'maria.costa@example.com', phone: '+44 7700 900123', company: '', specialism: 'Software Engineering', owner: 'Priya', stage: 'Held', last_contacted: '2026-07-15' },
  { id: 'C006', full_name: 'Omar Haddad', email: 'omar.haddad@example.com', phone: '+971 52 333 4455', company: 'Delta Markets', specialism: 'Crypto Ops', owner: 'Sam', stage: 'Engaged', last_contacted: '2026-10-12' },
  { id: 'C007', full_name: 'Sara Lindqvist', email: 'sara.l@example.com', phone: '+46 70 123 4567', company: 'Fjord Quant', specialism: 'Quant Research', owner: 'Sam', stage: 'Interview', last_contacted: '2026-10-15' },
  { id: 'C008', full_name: 'S. Lindqvist', email: 'sara.l@example.com', phone: '', company: 'Fjord Quant', specialism: 'Quant Research', owner: 'Priya', stage: 'Held', last_contacted: '' },
  { id: 'C009', full_name: 'Daniel Okafor', email: 'daniel.okafor@example.com', phone: '+971 56 444 5566', company: 'Apex Infra', specialism: 'Infrastructure', owner: 'Sam', stage: 'Offer', last_contacted: '2026-10-20' },
  { id: 'C010', full_name: 'Yuki Tanaka', email: '', phone: '+81 90 1234 5678', company: 'Kite Securities', specialism: 'Trading', owner: 'Priya', stage: 'Contacted', last_contacted: '2025-03-04' }
];
return records.map(r => ({ json: r }));
