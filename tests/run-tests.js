// Runs every workflow's logic against its dummy data and checks the results.
// No dependencies. Usage: node tests/run-tests.js   (Node 18 or newer)
// The "as of" date is fixed so results do not change over time.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

global.ASOF = '2026-10-23';
const SRC = path.join(__dirname, '..', 'workflows', 'src');
const WF = path.join(__dirname, '..', 'workflows');

// Runs a Code-node script the way n8n does: with $input (and $ for node references).
const run = (file, items = [], refs = {}) => {
  const code = fs.readFileSync(path.join(SRC, file), 'utf8');
  const $ = (name) => ({ first: () => refs[name][0], all: () => refs[name] });
  const input = { all: () => items, first: () => items[0] };
  return new Function('$input', '$', code)(input, $);
};

let passed = 0;
const test = (name, fn) => {
  try { fn(); passed++; console.log('  pass  ' + name); }
  catch (e) { console.log('  FAIL  ' + name + '\n        ' + e.message); process.exitCode = 1; }
};

console.log('\n02 CRM data hygiene');
{
  const sample = run('sample.js');
  const out = run('hygiene.js', sample);
  const by = (id) => out.find((x) => x.json.id === id).json;
  const sum = run('summary.js', out)[0].json;
  test('10 records checked', () => assert.strictEqual(sum.records_checked, 10));
  test('C001 is kept as the master record', () => assert.strictEqual(by('C001').action, 'Master record (keep)'));
  test('C002 flagged as duplicate of C001 (different case, spacing, phone format)', () => assert.match(by('C002').action, /^Merge into C001/));
  test('C008 flagged as duplicate of C007 (shared email)', () => assert.match(by('C008').action, /^Merge into C007/));
  test('C004 invalid email caught', () => assert.ok(by('C004').issues.some((i) => i.includes('invalid email'))));
  test('C003 stale and missing fields caught', () => assert.ok(by('C003').issues.some((i) => i.startsWith('stale')) && by('C003').issues.some((i) => i.startsWith('missing'))));
  test('C006 off-taxonomy specialism sent to review', () => assert.strictEqual(by('C006').action, 'Review'));
  test('C009 complete record is OK', () => assert.strictEqual(by('C009').action, 'OK'));
  test('summary counts: 1 clean, 2 merges, 4 fixes, 1 review, 2 stale', () => {
    assert.deepStrictEqual([sum.clean_records, sum.duplicates_to_merge, sum.records_needing_field_fixes, sum.records_to_review, sum.stale_records], [1, 2, 4, 1, 2]);
  });
}

console.log('\n03 Candidate rediscovery');
{
  const role = run('role03.js');
  const db = run('db03.js');
  const out = run('rank03.js', [], { 'Role requirements': role, 'Candidate database': db })[0].json;
  test('10 candidates searched', () => assert.strictEqual(out.searched, 10));
  test('shortlist order and scores: D01 95, D10 90, D02 75, D06 60', () => {
    assert.deepStrictEqual(out.shortlist.map((s) => [s.id, s.score]), [['D01', 95], ['D10', 90], ['D02', 75], ['D06', 60]]);
  });
  test('do-not-contact (D08), no-consent (D09), recently contacted (D04) excluded before scoring', () => {
    assert.deepStrictEqual(out.excluded.map((e) => e.id).sort(), ['D04', 'D08', 'D09']);
  });
  test('every shortlisted candidate has reasons', () => assert.ok(out.shortlist.every((s) => s.reasons.length > 0)));
}

console.log('\n05 Error handling');
{
  const classify = (msg) => run('format05.js', [{ json: { workflow: { name: 'Demo' }, execution: { id: '1', url: 'http://localhost:5678/x', lastNodeExecuted: 'HTTP Request', error: { message: msg } } } }])[0].json;
  const cases = [
    ['Request failed with status code 401', 'Authentication', false],
    ['The service is receiving too many requests (429)', 'Rate limit', true],
    ['connect ECONNREFUSED 127.0.0.1:9', 'Network or service', true],
    ['Validation failed: required field missing (email) for record L3', 'Data problem', false],
    ['Something odd happened', 'Unclassified', false],
  ];
  cases.forEach(([msg, type, retry]) => test(type + ': "' + msg.slice(0, 40) + '"', () => {
    const r = classify(msg);
    assert.strictEqual(r.error_type, type);
    assert.strictEqual(r.retry_safe, retry);
  }));
  test('unclassified errors are rated High, never played down', () => assert.strictEqual(classify('Something odd happened').severity, 'High'));
  test('demo workflow fails on purpose', () => assert.throws(() => run('demo05.js'), /Validation failed/));
}

console.log('\n06 Pipeline reporting digest');
{
  const data = run('data06.js');
  const rep = run('report06.js', data)[0].json;
  test('76 records generated', () => assert.strictEqual(data.length, 76));
  test('held candidates reported separately (40)', () => assert.strictEqual(rep.held_in_database, 40));
  test('funnel contacted > placed: 35, 20, 11, 5, 2, 1', () => assert.deepStrictEqual(rep.funnel.map((s) => s.reached), [35, 20, 11, 5, 2, 1]));
  test('conversion rates: 57.1, 55, 45.5, 40, 50', () => assert.deepStrictEqual(rep.funnel.slice(1).map((s) => s.conversion_from_previous_pct), [57.1, 55, 45.5, 40, 50]));
  test('unrecognised stage flagged, not counted', () => assert.deepStrictEqual(rep.data_quality.unrecognised_stage_records.map((r) => r.id), ['P076']));
  test('three client/role breakdowns', () => assert.strictEqual(rep.by_role.length, 3));
}

console.log('\nWorkflow JSON files');
for (const f of fs.readdirSync(WF).filter((n) => n.endsWith('.json'))) {
  test(f + ' is valid and every connection points to a real node', () => {
    const wf = JSON.parse(fs.readFileSync(path.join(WF, f), 'utf8'));
    const names = new Set(wf.nodes.map((n) => n.name));
    for (const [src, v] of Object.entries(wf.connections)) {
      assert.ok(names.has(src), 'unknown source ' + src);
      Object.values(v).forEach((t) => t.flat().forEach((c) => assert.ok(names.has(c.node), 'unknown target ' + c.node)));
    }
  });
}

console.log('\n' + passed + ' checks passed' + (process.exitCode ? ', some FAILED' : '') + '\n');
