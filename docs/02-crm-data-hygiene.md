# Workflow 02: CRM Data Hygiene

**Problem.** Recruitment and sales CRMs fill up with duplicate people, half-empty records, bad emails and contacts nobody has touched for months. Cleaning this by hand is slow and inconsistent.

**What it does.** Reads candidate records, cleans formats, and flags problems with a suggested action per record. It never edits or deletes the source data. Merges are proposals for a human to approve.

**Flow:** Run manually → Sample candidates → Hygiene check → Summary report

All data in this demo is fictional.

## Operating guide

| | |
|---|---|
| **Input** | One item per record: id, full_name, email, phone, company, specialism, owner, stage, last_contacted |
| **Output (Hygiene check)** | Cleaned fields, `issues[]`, `duplicate_master`, and `action` |
| **Output (Summary report)** | One item with counts per issue type |
| **Actions** | `OK`, `Master record (keep)`, `Merge into <id> (human review)`, `Fix fields`, `Review` |
| **Duplicate rule** | Records sharing a valid email or the same normalised phone number are grouped. The most recently contacted record is the master. |
| **Stale rule** | No contact for more than 180 days (change `STALE_DAYS` at the top of the Hygiene check node) |
| **Required fields** | email, phone, company, specialism, owner, last_contacted |
| **Specialism taxonomy** | Quant Research, Trading Tech, Software Engineering, Infrastructure. Anything else is flagged for review. |
| **Safe to run?** | Yes. It is read-only. |

### Exceptions and known limits
- Duplicates that share **no** email or phone (for example the same person with two different emails and no phone) are not detected. Name matching is deliberately not used because it creates false merges.
- Phone normalisation strips spaces and converts a leading `00` to `+`. It does not validate country-specific lengths.
- The date check assumes ISO dates (`YYYY-MM-DD`). Unparseable dates are treated as missing history, not as stale.
- Before connecting a real CRM, add a human-approval step before any write-back.

## Tested-output log (dummy data, as-of date 2026-10-23)

| Record | Test case | Expected | Result |
|---|---|---|---|
| C001 / C002 | Same person: different capitalisation, spacing, phone format | Duplicate pair, C001 master (more recent contact) | Pass |
| C002 | Specialism "quant" | Standardised to Quant Research | Pass |
| C003 | Missing phone and owner, last contact 651 days ago | Fix fields + stale flag | Pass |
| C004 | Email `li.wei@example` (no domain suffix) | Invalid email flag; "Infra" standardised | Pass |
| C005 | Missing company | Fix fields | Pass |
| C006 | Specialism "Crypto Ops" (outside taxonomy) | Review | Pass |
| C007 / C008 | Same email, different name format ("S. Lindqvist"), C008 missing phone and date | Duplicate pair, C007 master | Pass |
| C009 | Fully complete, recent record | OK | Pass |
| C010 | Missing email, stale, specialism "Trading" | Fix fields + stale; standardised | Pass |

**Summary result:** 10 records checked: 1 clean, 2 duplicates to merge, 4 needing field fixes, 1 to review, 2 stale.

**How it was tested:** the logic is checked by `tests/run-tests.js` against the sample data. The workflow was also imported and run in a local n8n instance (confirmed by the author, 23 Oct 2026).

## Baseline vs automated (estimate to replace with your own timing)
Manually checking 10 records for these issues takes a few minutes and varies by person. The workflow runs in about a second and applies the same rules every time. For a real CRM of thousands of records, time one manual pass on 20 records and extrapolate. Record the real figure here.

## Make it production-ready
1. Replace "Sample candidates" with a read node for your CRM (HubSpot, Google Sheets, Postgres).
2. Attach the error handler from workflow 05.
3. Add a human-approval step, then a write-back node for approved merges only.
4. Schedule weekly and send the summary by email or Slack.
