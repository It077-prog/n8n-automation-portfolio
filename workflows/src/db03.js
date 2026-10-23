// Dummy candidate database (fictional people). Mix of good matches, stale, recently contacted and do-not-contact cases.
const db = [
  { id: 'D01', name: 'Aisha Rahman', specialism: 'Quant Research', skills: ['python', 'statistics', 'time series', 'c++'], location: 'Dubai', stage: 'Held', last_contacted: '2026-03-10', consent: true, do_not_contact: false },
  { id: 'D02', name: 'Sara Lindqvist', specialism: 'Quant Research', skills: ['python', 'statistics', 'machine learning'], location: 'Stockholm', stage: 'Held', last_contacted: '2026-01-22', consent: true, do_not_contact: false },
  { id: 'D03', name: 'Tom Becker', specialism: 'Trading Tech', skills: ['c++', 'low latency', 'python'], location: 'London', stage: 'Held', last_contacted: '2025-11-05', consent: true, do_not_contact: false },
  { id: 'D04', name: 'Li Wei', specialism: 'Quant Research', skills: ['python', 'time series', 'statistics', 'machine learning'], location: 'Singapore', stage: 'Submitted', last_contacted: '2026-10-12', consent: true, do_not_contact: false },
  { id: 'D05', name: 'Maria Costa', specialism: 'Software Engineering', skills: ['java', 'kubernetes'], location: 'Lisbon', stage: 'Held', last_contacted: '2026-06-30', consent: true, do_not_contact: false },
  { id: 'D06', name: 'Omar Haddad', specialism: 'Quant Research', skills: ['r', 'statistics'], location: 'Dubai', stage: 'Held', last_contacted: '2026-02-14', consent: true, do_not_contact: false },
  { id: 'D07', name: 'Daniel Okafor', specialism: 'Infrastructure', skills: ['linux', 'networking'], location: 'London', stage: 'Placed', last_contacted: '2026-09-01', consent: true, do_not_contact: false },
  { id: 'D08', name: 'Yuki Tanaka', specialism: 'Quant Research', skills: ['python', 'statistics', 'time series', 'c++', 'machine learning'], location: 'Tokyo', stage: 'Held', last_contacted: '2025-05-20', consent: true, do_not_contact: true },
  { id: 'D09', name: 'Hannah Meyer', specialism: 'Quant Research', skills: ['python', 'time series'], location: 'London', stage: 'Held', last_contacted: '2026-04-02', consent: false, do_not_contact: false },
  { id: 'D10', name: 'Rohan Iyer', specialism: 'Quant Research', skills: ['python', 'statistics', 'time series'], location: 'Remote', stage: 'Held', last_contacted: '2025-12-15', consent: true, do_not_contact: false }
];
return db.map((c) => ({ json: c }));
