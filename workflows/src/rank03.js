// Rank existing candidates against the role (n8n Code node, "Run once for all items").
// Searches the EXISTING database before any new sourcing. Excludes people who must not be contacted.
// Reads: the "Role requirements" node and the "Candidate database" node.
const role = $('Role requirements').first().json;
const cands = $('Candidate database').all().map((i) => i.json);
const asOf = (typeof ASOF !== 'undefined') ? new Date(ASOF) : new Date();
const days = (d) => (d ? Math.floor((asOf - new Date(d)) / 86400000) : null);

const ranked = [];
const excluded = [];

for (const c of cands) {
  // Hard exclusions first: consent and contact rules beat any score.
  if (c.do_not_contact) { excluded.push({ id: c.id, name: c.name, reason: 'do not contact' }); continue; }
  if (!c.consent) { excluded.push({ id: c.id, name: c.name, reason: 'no consent to be contacted' }); continue; }
  const since = days(c.last_contacted);
  if (since !== null && since < role.min_days_since_contact) {
    excluded.push({ id: c.id, name: c.name, reason: 'contacted ' + since + ' days ago (minimum ' + role.min_days_since_contact + ')' });
    continue;
  }

  const reasons = [];
  let score = 0;
  if (c.specialism === role.specialism) { score += 40; reasons.push('specialism match (+40)'); }

  const hasAll = (list) => list.filter((s) => c.skills.includes(s));
  const must = hasAll(role.must_have);
  const mustPts = Math.round((must.length / role.must_have.length) * 45);
  if (must.length) { score += mustPts; reasons.push(must.length + '/' + role.must_have.length + ' must-have skills: ' + must.join(', ') + ' (+' + mustPts + ')'); }
  const missing = role.must_have.filter((s) => !c.skills.includes(s));
  if (missing.length) reasons.push('missing: ' + missing.join(', '));

  const nice = hasAll(role.nice_to_have);
  const nicePts = Math.min(10, nice.length * 5);
  if (nice.length) { score += nicePts; reasons.push('nice-to-have: ' + nice.join(', ') + ' (+' + nicePts + ')'); }

  if (role.locations.includes(c.location)) { score += 5; reasons.push('location fits: ' + c.location + ' (+5)'); }
  else reasons.push('location outside target: ' + c.location);

  ranked.push({ id: c.id, name: c.name, specialism: c.specialism, location: c.location, stage: c.stage, days_since_contact: since, score, reasons });
}

ranked.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
const shortlist = ranked.filter((r) => r.score >= 40).slice(0, role.top_n);

return [{
  json: {
    role: role.role_title,
    searched: cands.length,
    shortlisted: shortlist.length,
    excluded_count: excluded.length,
    shortlist,
    not_shortlisted: ranked.filter((r) => !shortlist.includes(r)).map((r) => ({ id: r.id, name: r.name, score: r.score })),
    excluded,
    human_review_note: 'Shortlist is a proposal. A recruiter must review before anyone is contacted.',
  },
}];
