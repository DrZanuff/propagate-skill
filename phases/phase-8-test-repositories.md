# Phase 8: Test Repositories

Purpose: prove the workflow works before testing broadly across real public remotes.

## Scope For This Pass

This pass focuses on GitHub only.

GitLab and Gitea fixture testing are intentionally deferred.

Test repository:

```text
https://github.com/DrZanuff/propagate-stress-test
```

The repository is public and was empty before this phase began.

## Fixture Setup

Created a small neutral JavaScript fixture project:

- `package.json`
- `src/config.mjs`
- `src/health.mjs`
- `test/config.test.mjs`
- `README.md`

Verification command:

```bash
npm test
```

Seed commit:

```text
bfc58f7 Seed propagation stress fixture
```

Repo-local workflow memory commit:

```text
cd836d8 Add propagation workflow memory
```

## Target Branches

Created and pushed these long-lived target branches:

- `main`
- `release/dev`
- `customer/dev`

Branch-specific differences:

- `release/dev` sets `config.track` to `release/dev` and includes release branch notes.
- `customer/dev` sets `config.track` to `customer/dev`, keeps a customer-specific greeting, enables `featureFlag`, and includes customer branch notes.

These differences are intentional and should be preserved during propagation.

## Source Scenarios

### Clean Scenario

Source branch:

```text
scenario/clean-add-audit-helper
```

Source commit:

```text
6949f3b Add audit helper scenario
```

Change:

- Adds `src/audit.mjs`.
- Updates `test/config.test.mjs`.

Expected behavior:

- Applies cleanly to `main`, `release/dev`, and `customer/dev`.
- Preserves target branch-specific config.
- Passes `npm test`.
- Pushes one temp branch per target.

Result:

| Target | Base Ref | Temp Branch | Verification | Push |
| --- | --- | --- | --- | --- |
| `main` | `origin/main` | `temp-PHASE8-clean-main-add-audit-helper` | `npm test` passed | pushed |
| `release/dev` | `origin/release/dev` | `temp-PHASE8-clean-release-dev-add-audit-helper` | `npm test` passed | pushed |
| `customer/dev` | `origin/customer/dev` | `temp-PHASE8-clean-customer-dev-add-audit-helper` | `npm test` passed | pushed |

PR links:

- `main`: https://github.com/DrZanuff/propagate-stress-test/compare/main...temp-PHASE8-clean-main-add-audit-helper?expand=1
- `release/dev`: https://github.com/DrZanuff/propagate-stress-test/compare/release%2Fdev...temp-PHASE8-clean-release-dev-add-audit-helper?expand=1
- `customer/dev`: https://github.com/DrZanuff/propagate-stress-test/compare/customer%2Fdev...temp-PHASE8-clean-customer-dev-add-audit-helper?expand=1

### Conflict Scenario

Source branch:

```text
scenario/conflict-update-greeting
```

Source commit:

```text
81a7be9 Update greeting scenario
```

Change:

- Updates `config.greeting` on the source branch.

Expected behavior:

- Starts every temp branch from its own target branch.
- Detects conflicts caused by intentional branch-specific config differences.
- Resolves conflicts by preserving target-specific config and applying the logical greeting change.
- Passes `npm test`.
- Pushes one temp branch per target after verification.

Result:

| Target | Base Ref | Temp Branch | Conflict / Adaptation | Verification | Push |
| --- | --- | --- | --- | --- | --- |
| `main` | `origin/main` | `temp-PHASE8-conflict-main-update-greeting` | applied cleanly | `npm test` passed | pushed |
| `release/dev` | `origin/release/dev` | `temp-PHASE8-conflict-release-dev-update-greeting` | preserved `track: "release/dev"` and changed greeting | `npm test` passed | pushed |
| `customer/dev` | `origin/customer/dev` | `temp-PHASE8-conflict-customer-dev-update-greeting` | preserved customer track/flag and adapted greeting | `npm test` passed | pushed |

PR links:

- `main`: https://github.com/DrZanuff/propagate-stress-test/compare/main...temp-PHASE8-conflict-main-update-greeting?expand=1
- `release/dev`: https://github.com/DrZanuff/propagate-stress-test/compare/release%2Fdev...temp-PHASE8-conflict-release-dev-update-greeting?expand=1
- `customer/dev`: https://github.com/DrZanuff/propagate-stress-test/compare/customer%2Fdev...temp-PHASE8-conflict-customer-dev-update-greeting?expand=1

### Push-Unavailable Scenario

Temp branch:

```text
temp-PHASE8-push-pending-main-add-audit-helper
```

Base ref:

```text
origin/main
```

Source commit:

```text
6949f3b Add audit helper scenario
```

Verification:

```text
npm test passed
```

Push was intentionally attempted against an unavailable local remote:

```text
/tmp/propagate-stress-test.CYisVJ/missing-remote.git
```

Result:

```text
fatal: '/tmp/propagate-stress-test.CYisVJ/missing-remote.git' does not appear to be a git repository
fatal: Could not read from remote repository.
```

Expected workflow behavior:

- Do not label the PR URL as ready.
- Report it as push-pending.

Push-pending URL:

```text
https://github.com/DrZanuff/propagate-stress-test/compare/main...temp-PHASE8-push-pending-main-add-audit-helper?expand=1
```

### Cleanup Scenario

Dedicated cleanup branches:

- `temp-PHASE8-cleanup-local-only`
- `temp-PHASE8-cleanup-remote-too`

Dry-run result:

```json
{
  "prefix": "temp-PHASE8-cleanup-",
  "scope": "both",
  "dryRun": true,
  "localCandidates": [
    "temp-PHASE8-cleanup-local-only",
    "temp-PHASE8-cleanup-remote-too"
  ],
  "remoteCandidates": [
    "temp-PHASE8-cleanup-remote-too"
  ]
}
```

Cleanup execution result:

```json
{
  "dryRun": false,
  "localDeleted": [
    {
      "branch": "temp-PHASE8-cleanup-local-only",
      "deleted": true
    },
    {
      "branch": "temp-PHASE8-cleanup-remote-too",
      "deleted": true
    }
  ],
  "remoteDeleted": [
    {
      "branch": "temp-PHASE8-cleanup-remote-too",
      "deleted": true
    }
  ]
}
```

Final dry-run after cleanup returned no local or remote candidates for `temp-PHASE8-cleanup-`.

## Current Remote Branches

Relevant branches remaining on GitHub after Phase 8:

- `main`
- `release/dev`
- `customer/dev`
- `scenario/clean-add-audit-helper`
- `scenario/conflict-update-greeting`
- `temp-PHASE8-clean-main-add-audit-helper`
- `temp-PHASE8-clean-release-dev-add-audit-helper`
- `temp-PHASE8-clean-customer-dev-add-audit-helper`
- `temp-PHASE8-conflict-main-update-greeting`
- `temp-PHASE8-conflict-release-dev-update-greeting`
- `temp-PHASE8-conflict-customer-dev-update-greeting`

The dedicated cleanup scenario branches were removed.

## Deferred

- GitLab-style remote fixture.
- Gitea-style remote fixture.
- Running the same scenario in a second agent/tool environment.

## Phase 8 Review Checklist

- [x] GitHub fixture repo was created and seeded.
- [ ] GitLab fixture repo was created. Deferred.
- [ ] Gitea fixture repo was created. Deferred.
- [x] Unknown or unavailable remote behavior was simulated.
- [x] Target branches with intentional differences were created.
- [x] Clean cherry-pick scenario was created and propagated.
- [x] Conflict scenario was created and propagated with branch-specific adaptations.
- [x] Push-unavailable scenario was tested.
- [x] Temp cleanup scenario was tested.
- [x] Relevant agent/tool outputs were saved as evidence.
- [x] Tests used workflow-named plain-English scenario framing rather than user-facing CLI commands.
- [ ] Same tests were run in at least two different agent/tool environments. Deferred.
