# Workflow 05: Error Handling and Alerts

**Problem.** An automation that fails silently is worse than no automation. People keep trusting it while it has stopped working. And when it does alert, "Request failed" tells nobody what to do.

**What it does.** Two workflows. **05a** is a shared error handler: any workflow can point to it, and when that workflow fails, 05a turns the raw error into a short alert saying what failed, what type of problem it is, whether retrying is safe, and what to check first. **05b** is a demo workflow that fails on purpose (a lead with no email) so the handler can be seen working.

**Flow 05a:** Error Trigger → Classify and format alert → Send alert (placeholder)
**Flow 05b:** Webhook → Validate incoming leads → Process leads

## Operating guide

| | |
|---|---|
| **Attach the handler** | In any workflow: ⋯ menu → Settings → **Error workflow** → choose 05a |
| **Alert fields** | workflow, failed_node, error_type, severity, retry_safe, message, first_check, execution_url, timestamp, alert_text |
| **Error types** | Authentication, Rate limit, Network or service, Data problem, Unclassified |
| **Retry guidance** | Rate limit and network problems: retry is safe. Authentication and data problems: fix the cause first. Unclassified: treated as High severity, retry not assumed safe. |
| **Sending the alert** | The last node is a placeholder. Replace it with a Slack or Email node and send the `alert_text` field. |
| **Important n8n behaviour** | Error workflows fire only for **published (production) runs**, not for manual test clicks. |

### Exceptions and known limits
- Classification matches keywords in the error message. An unusual message falls into "Unclassified" and is flagged High on purpose, so unknown problems are never played down.
- Keyword matching can misclassify. For example a message containing both "timeout" and "invalid" is matched by the first rule that hits. The first-check text is guidance, not a diagnosis.
- This handler reports failures. It does not catch a workflow that runs successfully but produces wrong output. That needs output checks inside each workflow (as in workflows 02 and 03).
- Alerts contain error messages. Do not route them to a public channel if workflows handle confidential data.

## Tested-output log

**Classifier (run in Node.js with sample error payloads):**

| Error message | Expected type | Result |
|---|---|---|
| Request failed with status code 401 | Authentication, High, no retry | Pass |
| Too many requests (429) | Rate limit, Medium, retry safe | Pass |
| connect ECONNREFUSED 127.0.0.1:9 | Network or service, Medium, retry safe | Pass |
| Validation failed: required field missing (email) for record L3 | Data problem, Medium, no retry | Pass |
| Something odd happened | Unclassified, High, no retry | Pass |

**Failing demo (05b):** the validation step throws "Validation failed: required field missing (email) for record L3" as designed. Pass (logic only).

**In n8n:** both workflows were imported and run in a local n8n instance (confirmed by the author, 23 Oct 2026). Add a screenshot of 05a's Executions and the alert text here when you have one.

## Baseline vs automated
Without this, a failed run is found when someone notices missing results, which could be hours or days later, then someone has to find the execution and work out the cause. With it, the alert arrives at the time of failure and already says where to look. Record your own example (time to notice, time to diagnose) here once you have run a real failure.

## Make it production-ready
1. Replace the placeholder node with Slack or Email, and route severity High to a person on call.
2. Add retry-on-fail with a delay to nodes that call external services.
3. Log each failure to a sheet or database to spot recurring problems.
4. Attach the handler to every workflow, including 02 and 03.
