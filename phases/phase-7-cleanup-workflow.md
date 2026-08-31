# Phase 7: Cleanup Workflow

Purpose: make temporary branch cleanup safe, explicit, and plain-English driven.

## Trigger

Enter cleanup mode when the user accepts the post-PR cleanup prompt or invokes `propagate-env` with cleanup language:

- `propagate-env clean up the temp branches from the PRs you just prepared`
- `propagate-env remove the temp branches for temp-TICKET-123-`
- `propagate-env delete local temp branches only`
- `propagate-env clean up remote temp branches too`

## Safety Gate

Cleanup is a destructive operation. The agent must list candidates first and ask for confirmation before deleting.

Confirmation should include:

- Prefix.
- Scope: local, remote, or both.
- Exact local branches to delete.
- Exact remote branches to delete.

Use a plain-English question:

```text
I found these temp branches matching `temp-TICKET-123-`. Should I delete the listed local branches, remote branches, or both?
```

## Candidate Rules

Only branches whose names start with the configured temporary prefix are eligible.

The prefix must start with `temp-`.

Branches outside the prefix are not cleanup candidates, even if they contain the word `temp` somewhere else.

## Cleanup Flow

1. Resolve the cleanup prefix from the last propagation run, memory, or the user request.
2. Resolve the scope:
   - Local only.
   - Remote only.
   - Both local and remote.
3. List matching local temporary branches.
4. List matching remote temporary branches.
5. Ask for confirmation with the exact candidates.
6. Delete only confirmed candidates matching the prefix.
7. Report what was removed and what could not be removed.
8. Record cleanup evidence in the progress log.

## Helper Script

Agents may use `workflow/scripts/cleanup-temp-branches.mjs`.

The helper defaults to dry-run mode. It lists local and remote candidates without deleting anything. Deletion requires:

- `--execute`
- `--confirm-prefix <same-prefix>`
- a prefix that starts with `temp-`

The helper is an implementation detail; users should ask for cleanup in plain English.

## Phase 7 Review Checklist

- [x] Cleanup triggers are documented.
- [x] Local temp branch listing is supported.
- [x] Remote temp branch listing is supported.
- [x] Confirmation is required before deletion.
- [x] Local-only cleanup is supported.
- [x] Remote cleanup is supported.
- [x] Branches outside the configured temp prefix are refused.
- [x] Cleanup evidence is recorded in the progress log.
- [x] User interaction stays plain-English driven.
