// Summary report (n8n Code node, "Run once for all items").
const rows = $input.all().map((i) => i.json);
const count = (pred) => rows.filter(pred).length;
const summary = {
  records_checked: rows.length,
  clean_records: count((r) => r.action === 'OK'),
  duplicates_to_merge: count((r) => String(r.action).startsWith('Merge')),
  records_needing_field_fixes: count((r) => r.action === 'Fix fields'),
  records_to_review: count((r) => r.action === 'Review'),
  stale_records: count((r) => r.issues.some((x) => x.startsWith('stale'))),
  missing_email: count((r) => !r.email),
  invalid_email: count((r) => r.email && !r.email_valid),
  missing_owner: count((r) => !r.owner),
  note: 'Flags only. No source record was changed or deleted. Merges need human approval.',
};
return [{ json: summary }];
