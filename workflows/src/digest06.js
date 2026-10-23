// Weekly digest text (n8n Code node). Turns the report into a short message a person can read in 30 seconds.
const r = $input.first().json;
const line = (s) => s.stage.padEnd(10) + String(s.reached).padStart(3) + (s.conversion_from_previous_pct === null ? '' : '   (' + s.conversion_from_previous_pct + '% of previous step)');
const parts = [];
parts.push('PIPELINE DIGEST');
parts.push('Held in database (not contacted): ' + r.held_in_database);
parts.push('Contacted or further: ' + r.contacted_and_beyond);
parts.push('');
parts.push('Overall funnel (candidates who reached each stage)');
r.funnel.forEach((s) => parts.push('  ' + line(s)));
parts.push('');
parts.push('By client and role');
r.by_role.forEach((b) => {
  const get = (st) => b.funnel.find((x) => x.stage === st).reached;
  parts.push('  ' + b.client + ' / ' + b.role + ': contacted ' + get('Contacted') + ', engaged ' + get('Engaged') + ', submitted ' + get('Submitted') + ', interview ' + get('Interview') + ', offer ' + get('Offer') + ', placed ' + get('Placed'));
});
if (r.data_quality.unrecognised_stage_records.length) {
  parts.push('');
  parts.push('DATA CHECK: ' + r.data_quality.unrecognised_stage_records.length + ' record(s) have an unrecognised stage and are not counted: ' + r.data_quality.unrecognised_stage_records.map((x) => x.id + ' ("' + x.stage + '")').join(', '));
}
return [{ json: { digest_text: parts.join('\n'), report: r } }];
