# Representative Agent Trajectories

This file records representative trajectories from the workflow implementation and GitHub stress test. Add the final recording transcript after the live run.

## Trajectory 1: Setup And Memory

User request:

```text
propagate-env set up this repo for branch propagation.
```

Agent instruction source:

- `workflow/AGENT.md`
- `workflow/references/memory.md`
- `workflow/references/providers.md`

Agent actions:

1. Verified the current directory was inside a Git repository.
2. Read `git remote -v`.
3. Detected GitHub from the remote URL.
4. Asked for or used target branches.
5. Wrote repo-local memory to `.propagate-env.json`.
6. Summarized provider, remote, target branches, temp prefix, and branch notes in plain English.

Tool evidence:

```text
node workflow/scripts/inspect-repo.mjs /path/to/repo
node workflow/scripts/write-memory.mjs --memory-file .propagate-env.json ...
```

Feedback / checkpoint:

```text
Human reviews the setup summary before propagation begins.
```

Learning:

```text
Memory needs to be structured JSON because free-form repeated instructions are easy to omit or distort across runs.
```

## Trajectory 2: Clean Propagation

User request:

```text
propagate-env commit 6949f3b with prefix temp-PHASE8-clean.
```

Source:

```text
scenario/clean-add-audit-helper
6949f3b Add audit helper scenario
```

Agent actions:

1. Inspected Git status.
2. Read configured target branches from memory.
3. Fetched refs.
4. Created one temp branch per target branch.
5. Applied the source commit independently to each temp branch.
6. Ran `npm test` on each temp branch.
7. Pushed only verified branches.
8. Generated GitHub compare URLs after push success.
9. Asked whether to remove temporary branches.

Tool evidence:

```text
npm test passed for main.
npm test passed for release/dev.
npm test passed for customer/dev.
```

Result:

| Target | Temp Branch | Result |
| --- | --- | --- |
| `main` | `temp-PHASE8-clean-main-add-audit-helper` | pushed |
| `release/dev` | `temp-PHASE8-clean-release-dev-add-audit-helper` | pushed |
| `customer/dev` | `temp-PHASE8-clean-customer-dev-add-audit-helper` | pushed |

Learning:

```text
The deterministic URL helper prevents subtle mistakes with slash-containing branch names.
```

## Trajectory 3: Conflict Propagation

User request:

```text
propagate-env commit 81a7be9 with prefix temp-PHASE8-conflict.
```

Source:

```text
scenario/conflict-update-greeting
81a7be9 Update greeting scenario
```

Agent actions:

1. Created each temp branch from its matching target branch.
2. Applied the source change.
3. Encountered or anticipated branch-specific config conflicts.
4. Preserved target-specific `track` and feature settings.
5. Applied the logical greeting change.
6. Ran `npm test`.
7. Pushed verified branches.
8. Generated compare URLs.

Result:

| Target | Temp Branch | Adaptation |
| --- | --- | --- |
| `main` | `temp-PHASE8-conflict-main-update-greeting` | applied cleanly |
| `release/dev` | `temp-PHASE8-conflict-release-dev-update-greeting` | preserved release track |
| `customer/dev` | `temp-PHASE8-conflict-customer-dev-update-greeting` | preserved customer track and flag |

Learning:

```text
The workflow's strongest safety value is preserving branch-specific behavior while applying the same logical change.
```

## Trajectory 4: Push-Unavailable Handling

User request:

```text
propagate-env propagate the clean scenario, but remote push is unavailable.
```

Agent actions:

1. Created `temp-PHASE8-push-pending-main-add-audit-helper`.
2. Applied the source commit.
3. Ran `npm test` successfully.
4. Attempted to push to an intentionally missing remote.
5. Captured the push failure.
6. Reported the generated URL as push-pending, not ready.

Tool response:

```text
fatal: '/tmp/propagate-stress-test.CYisVJ/missing-remote.git' does not appear to be a git repository
fatal: Could not read from remote repository.
```

Learning:

```text
Agents should not claim a PR URL is ready until the branch push succeeds.
```

## Trajectory 5: Cleanup

User request:

```text
propagate-env remove only temp branches with prefix temp-PHASE8-cleanup-.
```

Agent actions:

1. Listed matching local temp branches.
2. Listed matching remote temp branches.
3. Asked for confirmation.
4. Deleted only branches matching the confirmed prefix.
5. Recorded the cleanup result.

Dry-run evidence:

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

Learning:

```text
Cleanup must remain explicit because branch deletion is destructive.
```

## Trajectory 6: Recording Run

Status: pending live recording.

Use this prompt:

```text
propagate-env commit 421f9fb with prefix temp-RECORDING-build-label.
```

Fill after recording:

| Step | Evidence |
| --- | --- |
| Source inspection | TBD |
| Target plan | TBD |
| Verification results | TBD |
| Push results | TBD |
| Generated URLs | TBD |
| Cleanup checkpoint | TBD |
