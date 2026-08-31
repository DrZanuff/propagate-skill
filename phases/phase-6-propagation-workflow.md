# Phase 6: Propagation Workflow

Purpose: generalize the current instructions into a safe branch propagation procedure.

## Trigger

Enter propagation mode when the user invokes `propagate-env` with a source change and propagation intent:

- `propagate-env this commit`
- `propagate-env commit abc1234 to the configured target branches`
- `propagate-env the current staged changes with prefix temp-TICKET-123-short-description`
- `propagate-env these commits abc1234 def5678 in order`

If the user asks only to configure, inspect, update, or forget memory, use the setup/memory flow instead.

## Source Change Resolution

Classify the source before touching branches:

- Staged changes: inspect `git diff --staged`.
- Working tree changes: inspect `git diff`.
- One commit: inspect `git show --stat <sha>` and `git show --patch <sha>`.
- Multiple commits: preserve the user-provided order and inspect each commit.

Agents may use `workflow/scripts/inspect-source.mjs` as a non-destructive helper.

Completion criterion: the agent can name the source mode, commits if any, and changed files.

## Pre-Mutation Git Inspection

Before creating or changing branches, inspect:

- `git status --short`
- `git remote -v`
- `git branch --show-current`
- `git branch -vv`

Read memory before selecting target branches. If target branches are missing, ask the user before continuing.

Completion criterion: provider, remote, target branches, temp prefix, source change, and current dirty state are known.

## Fetch And Base Selection

Fetch remote refs when credentials and network access allow it.

For each target branch, choose the freshest safe base in this order:

1. `origin/<target>` or the configured remote-tracking ref after a successful fetch.
2. Existing local remote-tracking ref when fetch is unavailable.
3. Local target branch only when no remote-tracking ref exists.

Record the actual base ref used for each branch.

## Independent Per-Target Loop

For each target branch independently:

1. Create a temp branch from that target's selected base ref.
2. Apply the complete source change to that temp branch.
3. Resolve conflicts while preserving intentional differences in the target branch.
4. Commit the adapted change.
5. Run verification appropriate to the changed files.
6. Push only if verification succeeds.
7. Generate a ready PR/compare URL only after push succeeds.
8. If push is unavailable, report a push-pending URL and the push command separately.

The branch for one target must not be used as the base for another target.

## Applying Changes

Prefer cherry-pick when commits are provided and apply cleanly:

```bash
git cherry-pick <sha>
git cherry-pick <sha1> <sha2>
```

Use a patch or manual adaptation when:

- The source is staged or working tree changes.
- Cherry-pick conflicts in a way that would leak branch-specific differences.
- The target branch intentionally differs and needs an adapted implementation.

If cherry-pick goes wrong, abort before trying another application strategy:

```bash
git cherry-pick --abort
```

## Verification

Choose verification from local evidence:

- Changed paths.
- Package scripts.
- Build files.
- Test files.
- Existing repo documentation.
- Memory verification hints.

If verification fails, do not push unless the user explicitly approves pushing a known-failing branch. Report the failure per branch.

## Planning Helper

Agents may use `workflow/scripts/plan-propagation.mjs` to generate deterministic temp branch names, base refs, pending URLs, and push commands. This helper is non-destructive. It does not create branches, commit, or push.

## Final Report

Report each target branch separately:

- Target branch.
- Temp branch.
- Base ref used.
- Verification result.
- Push result.
- Ready PR URL or push-pending URL.
- Any branch-specific notes, conflicts, or adaptations.

End by asking whether the user wants temporary branches removed after PRs are raised or prepared.

## Phase 6 Review Checklist

- [x] Workflow-named propagation triggers are documented.
- [x] Source changes can be identified from commit, commit range/list, staged changes, or working tree.
- [x] Git status inspection is required before mutation.
- [x] Configured target branches are read from memory.
- [x] Fetching refs is part of the workflow when possible.
- [x] The per-target loop creates one temp branch from each target branch.
- [x] Source changes are applied independently to each temp branch.
- [x] Conflict handling preserves target-branch differences.
- [x] Adapted changes are committed per temp branch.
- [x] Verification is selected from touched files and local evidence.
- [x] Passing verification gates push.
- [x] Ready PR/compare URLs require successful push.
- [x] Push-pending URLs are reported separately.
- [x] Post-PR cleanup prompting is required.
- [x] Per-branch evidence is recorded in the progress log.
