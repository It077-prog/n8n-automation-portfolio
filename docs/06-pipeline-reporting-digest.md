# Workflow 06: Pipeline Reporting Digest

**Problem.** Pipeline reporting is usually rebuilt by hand each week, and two common mistakes make the numbers misleading: counting people who were never contacted as part of the funnel, and quietly dropping records with a bad stage so the totals look cleaner than they are.

**What it does.** Reads pipeline records and produces a short digest: candidates **held in the database** (reported separately), then the funnel **contacted → engaged → submitted → interview → offer → placed**, overall and by client and role, with step-to-step conversion. Records with an unrecognised stage are listed in a data-check line and are not counted anywhere.

**Flow:** Run manually → Pipeline data → Build report → Build digest

All data in this demo is fictional.

## Operating guide

| | |
|---|---|
| **Input** | One item per candidate: id, client, role, furthest_stage. "Held" records need no client or role. |
| **Recognised stages** | Held, Contacted, Engaged, Submitted, Interview, Offer, Placed |
| **How counting works** | Cumulative: a candidate whose furthest stage is Interview counts as having reached Contacted, Engaged, Submitted and Interview. |
| **Output (Build report)** | `held_in_database`, `contacted_and_beyond`, `funnel`, `by_role`, `data_quality` |
| **Output (Build digest)** | `digest_text`: a plain-text message, plus the full report |
| **Conversion** | Each step as a percentage of the previous step. Shown as empty when the previous step is zero (no divide-by-zero). |
| **Safe to run?** | Yes. Read-only, sends nothing. |

### Exceptions and known limits
- It uses **furthest stage reached**, so it cannot show candidates who dropped out and why. A real pipeline needs a status field (withdrawn, rejected) to report drop-off.
- Stage names must match exactly. A spelling variant is reported as unrecognised, not guessed.
- It reports a snapshot. Week-on-week change needs stored history, for example one report saved per week.
- Percentages on small numbers (for example 1 of 2) swing a lot. Read them alongside the counts.

## Tested-output log (dummy data)

| Test case | Expected | Result |
|---|---|---|
| 76 records generated (40 held, 35 active, 1 odd stage) | 76 rows | Pass |
| Held kept out of the funnel | Held 40 reported separately; funnel starts at Contacted 35 | Pass |
| Cumulative funnel, checked by hand | 35, 20, 11, 5, 2, 1 | Pass |
| Conversion rates, checked by hand | 57.1%, 55%, 45.5%, 40%, 50% | Pass |
| By-role breakdown, checked by hand | Northgate 17/11/7/4/2/1; Helix 11/6/3/1/0/0; Orbit 7/3/1/0/0/0 | Pass |
| Record with stage "Sourced?" | Listed in DATA CHECK, not counted | Pass (P076) |

**How it was tested:** the logic is checked by `tests/run-tests.js` and the output matched hand-calculated figures. The workflow was also run in a local n8n instance (confirmed by the author, 23 Oct 2026).

## Baseline vs automated (replace with your own timing)
Building this summary by hand from a CRM export means filtering, counting by stage, and calculating conversion for each client and role, then checking nothing was double-counted. Time one manual run on a realistic export and record it here. The workflow produces the same output in about a second.

## Make it production-ready
1. Replace "Pipeline data" with a read from your CRM or a Google Sheet.
2. Add a Schedule Trigger (weekly) and a Slack or Email node to send `digest_text`.
3. Store each week's report so you can show trends.
4. Attach the error handler (workflow 05).
