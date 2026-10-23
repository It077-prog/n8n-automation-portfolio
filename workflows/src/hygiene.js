// CRM data hygiene check (n8n Code node, "Run once for all items").
// Input: candidate records. Output: one item per record with cleaned fields, issues and a suggested action.
// Nothing is changed or deleted in the source system: this only flags and proposes.
const STALE_DAYS = 180;
const REQUIRED = ['email', 'phone', 'company', 'specialism', 'owner', 'last_contacted'];
const asOf = (typeof ASOF !== 'undefined') ? new Date(ASOF) : new Date();

const normEmail = (v) => String(v || '').trim().toLowerCase();
const validEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v);
const normPhone = (v) => {
  let d = String(v || '').replace(/[^\d+]/g, '');
  if (d.startsWith('00')) d = '+' + d.slice(2);
  return d.replace(/(?!^)\+/g, '');
};
const normName = (v) => String(v || '').replace(/\s+/g, ' ').trim();
const normSpecialism = (v) => {
  const s = String(v || '').toLowerCase();
  if (!s.trim()) return '';
  if (s.includes('quant')) return 'Quant Research';
  if (s.includes('trading')) return 'Trading Tech';
  if (s.includes('software')) return 'Software Engineering';
  if (s.includes('infra')) return 'Infrastructure';
  return 'Other';
};
const daysSince = (v) => {
  if (!v) return null;
  const t = new Date(v);
  return isNaN(t) ? null : Math.floor((asOf - t) / 86400000);
};

const rows = $input.all().map((i) => i.json);

// Clean each record
const recs = rows.map((r) => {
  const email = normEmail(r.email);
  return {
    id: r.id,
    full_name: normName(r.full_name),
    email,
    email_valid: email ? validEmail(email) : false,
    phone: normPhone(r.phone),
    company: normName(r.company),
    specialism_raw: r.specialism || '',
    specialism: normSpecialism(r.specialism),
    owner: normName(r.owner),
    stage: r.stage || '',
    last_contacted: r.last_contacted || '',
    days_since_contact: daysSince(r.last_contacted),
  };
});

// Group duplicates (union-find on shared valid email or shared phone)
const parent = recs.map((_, i) => i);
const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
const union = (a, b) => { parent[find(a)] = find(b); };
const seen = {};
recs.forEach((r, i) => {
  const keys = [];
  if (r.email && r.email_valid) keys.push('e:' + r.email);
  if (r.phone) keys.push('p:' + r.phone);
  keys.forEach((k) => (k in seen ? union(i, seen[k]) : (seen[k] = i)));
});
const groups = {};
recs.forEach((r, i) => (groups[find(i)] = groups[find(i)] || []).push(i));

// Master = most recently contacted record in each group
const masterOf = {};
Object.values(groups).forEach((idxs) => {
  if (idxs.length < 2) return;
  const best = idxs.slice().sort((a, b) => (recs[a].last_contacted < recs[b].last_contacted ? 1 : -1))[0];
  idxs.forEach((i) => (masterOf[i] = recs[best].id));
});

const out = recs.map((r, i) => {
  const issues = [];
  const missing = REQUIRED.filter((f) => !r[f]);
  if (missing.length) issues.push('missing: ' + missing.join(', '));
  if (r.email && !r.email_valid) issues.push('invalid email format');
  if (r.days_since_contact !== null && r.days_since_contact > STALE_DAYS) issues.push('stale: no contact in ' + r.days_since_contact + ' days');
  if (r.specialism === 'Other') issues.push('specialism not in taxonomy ("' + r.specialism_raw + '")');
  if (r.specialism_raw && r.specialism && r.specialism_raw !== r.specialism && r.specialism !== 'Other') issues.push('specialism standardised: "' + r.specialism_raw + '" -> "' + r.specialism + '"');
  const dup = masterOf[i] && masterOf[i] !== r.id;
  const inDupGroup = masterOf[i] !== undefined;
  if (dup) issues.push('duplicate of ' + masterOf[i]);

  let action = 'OK';
  if (dup) action = 'Merge into ' + masterOf[i] + ' (human review)';
  else if (inDupGroup) action = 'Master record (keep)';
  else if (issues.some((x) => x.startsWith('missing') || x.startsWith('invalid'))) action = 'Fix fields';
  else if (issues.some((x) => x.startsWith('stale') || x.startsWith('specialism not'))) action = 'Review';

  return { json: { ...r, issues, issue_count: issues.length, duplicate_master: masterOf[i] || null, action } };
});
return out;
