// Turn a raw n8n error into a clear alert (n8n Code node, "Run once for all items").
// Classifies the failure, says what to check first, and says whether a retry is safe.
const e = $input.first().json;
const message = String((e.execution && e.execution.error && e.execution.error.message) || 'Unknown error');
const lower = message.toLowerCase();

const classes = [
  { test: /401|403|unauthori[sz]ed|forbidden|invalid api key|credential|token (expired|invalid)/, type: 'Authentication', severity: 'High', retry_safe: false, first_check: 'Open the credential used by the failing node and re-save or reconnect it. Check the key has not expired or been revoked.' },
  { test: /429|rate.?limit|too many requests|quota/, type: 'Rate limit', severity: 'Medium', retry_safe: true, first_check: 'Wait a few minutes and retry. If it repeats, reduce run frequency or add a Wait node between calls.' },
  { test: /timeout|timed out|econnreset|econnrefused|enotfound|socket hang up|5\d\d/, type: 'Network or service', severity: 'Medium', retry_safe: true, first_check: 'Check the other service is up. Retry once. Add retry-on-fail to the node if this recurs.' },
  { test: /validation|missing|required|invalid|cannot read|undefined|not found in/, type: 'Data problem', severity: 'Medium', retry_safe: false, first_check: 'Open the failing execution and inspect the input data of the failing node. Fix the source record; retrying will fail again.' },
];
const hit = classes.find((c) => c.test.test(lower)) || { type: 'Unclassified', severity: 'High', retry_safe: false, first_check: 'Open the failing execution and read the error on the failing node.' };

const wf = (e.workflow && e.workflow.name) || 'Unknown workflow';
const node = (e.execution && e.execution.lastNodeExecuted) || 'Unknown node';
const url = (e.execution && e.execution.url) || '';
const when = new Date().toISOString();

const text = [
  '[' + hit.severity.toUpperCase() + '] ' + wf + ' failed at "' + node + '"',
  'Type: ' + hit.type + ' | Retry safe: ' + (hit.retry_safe ? 'yes' : 'no, fix the cause first'),
  'Error: ' + message.slice(0, 300),
  'First check: ' + hit.first_check,
  url ? 'Execution: ' + url : '',
  'Time: ' + when,
].filter(Boolean).join('\n');

return [{ json: { workflow: wf, failed_node: node, error_type: hit.type, severity: hit.severity, retry_safe: hit.retry_safe, message: message.slice(0, 300), first_check: hit.first_check, execution_url: url, timestamp: when, alert_text: text } }];
