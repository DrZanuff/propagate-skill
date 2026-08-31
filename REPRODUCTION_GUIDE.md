# Reproduction Guide

This guide is written for someone starting from a clean environment.

## Requirements

- Git `2.43.0` observed during evaluation.
- Node.js `18+`; `v22.18.0` observed during evaluation.
- npm `10.9.3` observed during evaluation.
- A GitHub account with permission to push branches to the stress-test repository, if you want to reproduce the live propagation push.

Local helper tests do not require network access after the repository is cloned.

## Install Into A Target Repository

After npm publication:

```bash
npx propagate-env install
```

Before npm publication, install from GitHub:

```bash
npx github:DrZanuff/propagate-skill install
```

Expected installed files:

- `.propagate-env/workflow/`
- `.propagate-env.json`
- `PROPAGATE_ENV.md`
- `AGENTS.md`, only when one does not already exist

Daily propagation remains a plain-English agent request, not a user-facing CLI command.

## Clone The Solution

```bash
git clone https://github.com/DrZanuff/propagate-skill.git propagate-env
cd propagate-env
```

## Run Deterministic Evaluation Tests

```bash
npm test
```

Expected output:

```text
All tests passed.
```

Approximate runtime:

```text
1-3 seconds locally.
```

Approximate cost:

```text
$0 for local helper tests.
```

## Check Package Contents

```bash
npm run pack:check
```

Expected output includes `bin/propagate-env.mjs`, `workflow/`, `README.md`, `REPRODUCTION_GUIDE.md`, `IMPROVEMENT_CHANGELOG.md`, and `LICENSE`.

## Reproduce The GitHub Fixture

Clone the public stress-test repository:

```bash
git clone https://github.com/DrZanuff/propagate-stress-test.git
cd propagate-stress-test
git fetch origin
```

Expected target branches:

```bash
git branch -r | grep -E 'origin/(main|release/dev|customer/dev)'
```

Expected source branch for the video:

```bash
git branch -r | grep 'origin/scenario/recording-add-build-label'
```

Prepared source commit:

```text
421f9fb Add recording build label scenario
```

## Baseline Run

Run this in an agent environment without showing the agent the `propagate-env` workflow instructions:

```text
Please apply commit 421f9fb to main, release/dev, and customer/dev, then prepare pull request links.
```

Measure:

- Successful target propagations.
- Base-branch mistakes.
- Correct provider URLs.
- Verification before push.
- Cleanup prompt.
- Human corrections required.
- Approximate runtime and cost.

Record results in:

```text
recording/baseline-script.md
IMPROVEMENT_CHANGELOG.md
```

## Solution Run

Give the agent access to this repository's workflow instructions, then run:

```text
propagate-env commit 421f9fb with prefix temp-RECORDING-build-label.
```

Expected behavior:

- Inspect Git status first.
- Read `.propagate-env.json` if present.
- Fetch refs.
- Create one temp branch from each target branch.
- Apply the source commit independently to each temp branch.
- Run `npm test` before pushing.
- Push only branches that pass.
- Generate GitHub compare links only after push succeeds.
- Ask whether to remove recording temp branches after PR links are prepared.

Expected temp branches:

- `temp-RECORDING-build-label-main`
- `temp-RECORDING-build-label-release-dev`
- `temp-RECORDING-build-label-customer-dev`

Expected compare links after push:

- `https://github.com/DrZanuff/propagate-stress-test/compare/main...temp-RECORDING-build-label-main?expand=1`
- `https://github.com/DrZanuff/propagate-stress-test/compare/release%2Fdev...temp-RECORDING-build-label-release-dev?expand=1`
- `https://github.com/DrZanuff/propagate-stress-test/compare/customer%2Fdev...temp-RECORDING-build-label-customer-dev?expand=1`

## Cleanup Run

Only after reviewing the generated compare links, ask:

```text
propagate-env remove only the temp branches created for the recording demo.
```

Expected behavior:

- List matching local temp branches.
- List matching remote temp branches.
- Ask for confirmation before deletion.
- Refuse to delete branches outside the configured prefix.
- Record cleanup evidence.

## Evidence Files

- [IMPROVEMENT_CHANGELOG.md](IMPROVEMENT_CHANGELOG.md)
- [recording/agent-trajectories.md](recording/agent-trajectories.md)
- [phases/phase-8-test-repositories.md](phases/phase-8-test-repositories.md)
- [phases/phase-9-evaluation-and-evidence.md](phases/phase-9-evaluation-and-evidence.md)
