# Workflow 03: Candidate Rediscovery

**Problem.** Recruiters often source new profiles for a role while the right person is already in the database, contacted months ago and forgotten. Searching the existing database first is faster and cheaper, but only if the rules about who can be contacted are followed every time.

**What it does.** Takes a role specification, ranks everyone in the existing database against it, and returns a shortlist where every score comes with its reasons. People who must not be contacted are removed before scoring. The output is a proposal for a recruiter to review. Nothing is sent.

**Flow:** Run manually → Role requirements → Candidate database → Rank candidates → *(optional, off by default)* AI shortlist summary

All data in this demo is fictional.

## Operating guide

| | |
|---|---|
| **Input** | Role: title, specialism, must-have skills, nice-to-have skills, target locations, minimum days since last contact, shortlist size. Candidates: id, name, specialism, skills, location, stage, last_contacted, consent, do_not_contact. |
| **Output** | `shortlist` (score and reasons per person), `not_shortlisted`, `excluded` (with reason), counts, and a human-review note |
| **Hard exclusions (applied first)** | do not contact; no consent; contacted fewer than 30 days ago |
| **Scoring** | Specialism match 40. Must-have skills up to 45, proportional. Nice-to-have up to 10. Location fit 5. Shortlist needs a score of at least 40. |
| **Change the role** | Edit the "Role requirements" node. Nothing else needs changing. |
| **Safe to run?** | Yes. Read-only, sends nothing. |

### Optional AI summary
The last two nodes (Basic LLM Chain + Google Gemini Chat Model) are **disabled**. To use them, add a Google Gemini credential, select it in the model node, then enable both. The prompt tells the model to use only the facts in the shortlist, not to invent details, and not to recommend contacting anyone. **No recorded test output exists for these two nodes yet.** Always check AI-written summaries against the score reasons before using them.

### Exceptions and known limits
- Skills are matched by exact lowercase text. "ML" will not match "machine learning". In a real database, standardise skills first (workflow 02 does this for specialisms).
- The score is a transparent ranking aid, not a judgement of quality. Two candidates with the same score may differ in ways the data does not capture.
- Location is a simple match against a list. It does not know about relocation or visas.
- The consent and do-not-contact fields must be accurate in the source system. The workflow can only respect what the data says.
- Before connecting a real database, store only what you are permitted to hold, and keep a recruiter approval step before any outreach.

## Tested-output log (dummy data, as-of date 2026-10-23)

| Candidate | Test case | Expected | Result |
|---|---|---|---|
| D08 Yuki Tanaka | Perfect skills, marked do-not-contact | Excluded, never scored | Pass |
| D09 Hannah Meyer | Good skills, no consent | Excluded | Pass |
| D04 Li Wei | Strong match, contacted 11 days ago | Excluded (minimum 30 days) | Pass |
| D01 Aisha Rahman | All 3 must-haves, one nice-to-have, Dubai | Top of shortlist, 95 | Pass |
| D10 Rohan Iyer | All 3 must-haves, Remote | Second, 90 | Pass |
| D02 Sara Lindqvist | 2 of 3 must-haves, location outside target | Shortlisted at 75 with "missing: time series" shown | Pass |
| D06 Omar Haddad | 1 of 3 must-haves, specialism match | Shortlisted at 60, missing skills shown | Pass |
| D03 / D05 / D07 | Wrong specialism or skills | Not shortlisted | Pass |

**Result:** 10 searched, 4 shortlisted, 3 excluded, 3 not shortlisted.

**How it was tested:** the ranking logic is checked by `tests/run-tests.js` against the sample data. The workflow's core steps were also run in a local n8n instance (confirmed by the author, 23 Oct 2026). No output of the optional AI summary has been recorded here yet.

## Baseline vs automated (replace with your own timing)
Manually checking 10 candidates against a role, including consent and contact history, takes several minutes and depends on who does it. The workflow applies the same rules in about a second. Time one manual search on a real or realistic list and record the figure here.

## Make it production-ready
1. Replace "Candidate database" with a read from your CRM or database.
2. Standardise skills before matching.
3. Add a recruiter approval step before any outreach is drafted or sent.
4. Attach the error handler from workflow 05.
