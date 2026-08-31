# Baseline Script

Purpose: create a fair comparison point against the workflow-assisted run.

## Baseline Definition

The baseline is one general-purpose prompt without `propagate-env` instructions, repo memory, or helper scripts.

Baseline prompt:

```text
Please apply commit 421f9fb to main, release/dev, and customer/dev, then prepare pull request links.
```

Do not mention:

- `propagate-env`
- `workflow/AGENT.md`
- `.propagate-env.json`
- helper scripts
- branch-specific notes unless the agent asks

## What To Record

Record whether the agent:

- Checks Git status before modifying branches.
- Reads remotes and identifies GitHub.
- Starts each temp branch from its own target branch.
- Handles slash branch names in URLs correctly.
- Runs verification before pushing.
- Separates pushed PR links from push-pending links.
- Asks about cleanup after PR links are prepared.
- Preserves `release/dev` and `customer/dev` branch-specific differences.

## Baseline Scorecard

Fill this immediately after recording.

| Metric | Result | Evidence |
| --- | --- | --- |
| Successful target propagations | TBD | TBD |
| Base-branch mistakes | TBD | TBD |
| Correct PR URLs | TBD | TBD |
| Verification before push | TBD | TBD |
| Push-unavailable handling | TBD | TBD |
| Cleanup prompt | TBD | TBD |
| Human corrections required | TBD | TBD |
| Approximate runtime | TBD | TBD |

## Suggested Baseline Branch Prefix

Use a unique prefix so baseline branches do not collide with workflow branches:

```text
temp-BASELINE-build-label
```

Expected branches if the baseline succeeds:

- `temp-BASELINE-build-label-main`
- `temp-BASELINE-build-label-release-dev`
- `temp-BASELINE-build-label-customer-dev`

## What To Say In The Video

Say:

```text
For the baseline, I gave the agent one general prompt and did not provide the workflow instructions. I measured the same things: whether it used the right base branches, preserved branch differences, verified before push, generated correct URLs, and asked about cleanup.
```
