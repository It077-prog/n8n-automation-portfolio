// Pipeline report (n8n Code node, "Run once for all items").
// Keeps "held in database" separate from the contacted -> placed funnel. Unknown stages are reported, never silently counted.
const ORDER = ['Held', 'Contacted', 'Engaged', 'Submitted', 'Interview', 'Offer', 'Placed'];
const rank = Object.fromEntries(ORDER.map((s, i) => [s, i]));
const rows = $input.all().map((i) => i.json);

const known = rows.filter((r) => r.furthest_stage in rank);
const unknown = rows.filter((r) => !(r.furthest_stage in rank));
const held = known.filter((r) => r.furthest_stage === 'Held').length;
const active = known.filter((r) => r.furthest_stage !== 'Held');

// "Reached" = furthest stage is this one or later (cumulative funnel).
const reached = (list, stage) => list.filter((r) => rank[r.furthest_stage] >= rank[stage]).length;
const pct = (a, b) => (b === 0 ? null : Math.round((a / b) * 1000) / 10);

const funnelFor = (list) => {
  const steps = ORDER.slice(1).map((s) => ({ stage: s, reached: reached(list, s) }));
  steps.forEach((s, i) => { s.conversion_from_previous_pct = i === 0 ? null : pct(s.reached, steps[i - 1].reached); });
  return steps;
};

const byRole = {};
active.forEach((r) => {
  const key = r.client + ' | ' + r.role;
  (byRole[key] = byRole[key] || []).push(r);
});

return [{
  json: {
    held_in_database: held,
    contacted_and_beyond: reached(active, 'Contacted'),
    funnel: funnelFor(active),
    by_role: Object.entries(byRole).map(([k, list]) => {
      const [client, role] = k.split(' | ');
      return { client, role, funnel: funnelFor(list) };
    }),
    data_quality: {
      unrecognised_stage_records: unknown.map((r) => ({ id: r.id, stage: r.furthest_stage })),
      note: unknown.length ? 'These records are NOT counted in any funnel step. Fix their stage in the source system.' : 'All stages recognised.',
    },
  },
}];
