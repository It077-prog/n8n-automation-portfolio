# n8n Automation Portfolio

Four n8n workflows for operations, CRM and reporting work, built on **dummy data**. Each one comes with a plain-English operating guide, its known limits, and a tested-output log.

By Anil Kumar Gunda, operations and project coordinator, Dubai.

## What is in here

| # | Workflow | What it does | Guide |
|---|---|---|---|
| 02 | CRM data hygiene | Finds duplicate records, missing fields, invalid emails, stale contacts and off-list specialisms. Proposes fixes and never edits the source. | [docs](docs/02-crm-data-hygiene.md) |
| 03 | Candidate rediscovery | Ranks existing database candidates against a role with a reason for every score. Removes do-not-contact, no-consent and recently contacted people before scoring. Optional AI summary. | [docs](docs/03-candidate-rediscovery.md) |
| 05 | Error handling and alerts | A shared handler (05a) that classifies failures and tells you whether a retry is safe and what to check first, plus a demo (05b) that fails on purpose. | [docs](docs/05-error-handling-and-alerts.md) |
| 06 | Pipeline reporting digest | Reports held candidates separately from the contacted-to-placed funnel, by client and role. Records with an unrecognised stage are named, not counted. | [docs](docs/06-pipeline-reporting-digest.md) |

Planned next: a lead-qualification flow over WhatsApp (needs a public webhook) and a Make.com version of a content pipeline.

## Design rules used in every workflow

- **Propose, don't change.** Workflows flag and suggest. Anything consequential, such as a merge or outreach, waits for a person.
- **Exclusions before scoring.** Consent and contact rules are applied first, so a high score never overrides them.
- **Bad data is reported, never hidden.** Unknown values are listed and not counted.
- **Every workflow documents its limits** and has a tested-output log.

## Run it

You need n8n. Two ways to get it:

**Quick (Node 20 or newer):**
```bash
npx n8n
```
Open http://localhost:5678 and create your local owner account.

**Docker (n8n + Postgres, Dubai time zone):**
```bash
cp .env.example .env
openssl rand -hex 24        # paste the output as N8N_ENCRYPTION_KEY in .env, and set a database password
docker compose up -d
```

Then in n8n choose **Import from file** and pick a file from `workflows/`. Click **Execute workflow**.

Workflows 02, 03 and 06 need no keys. Workflow 03's AI summary nodes are optional: add a Google Gemini credential (API key from Google AI Studio) and enable both nodes. Workflow 05 needs two steps to see it work, written in its guide.

## Check the results without n8n

```bash
node tests/run-tests.js
```

This runs each workflow's logic against its dummy data with a fixed date and checks 31 expected results, such as the duplicate pairs found, the shortlist order, the funnel counts and the error classifications. It needs Node 18 or newer and no packages.

## Repository layout

```
workflows/        importable n8n workflow files (.json)
workflows/src/    the same Code-node scripts as plain JavaScript, so they can be read and tested
docs/             one guide per workflow: operating guide, limits, tested-output log
tests/            run-tests.js
docker-compose.yml, .env.example    optional local n8n + Postgres setup
```

If you change code inside a Code node in n8n, update the matching file in `workflows/src/` so the tests keep checking the same logic.

## Honest notes

- All records are fictional.
- Test figures come from the dummy data above. They show the logic works, not how it performs on a real CRM.
- Matching rules are deliberately simple. For example, duplicates are found by shared email or phone and not by name, because name matching creates false merges. Each guide lists such limits.
- Before using any of this with real personal data, check what you are allowed to store, apply access controls, and keep a human approval step before any write-back or outreach.

## Licence

MIT, see [LICENSE](LICENSE).
