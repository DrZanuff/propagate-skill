# Memory Reference

Use this reference when storing or reading repo-specific `propagate-env` memory.

## Purpose

Memory keeps organization-specific and repository-specific details out of the public workflow instructions. It lets the workflow stay generic while still remembering what matters inside a real repo.

## Recommended Locations

Default to repo-local memory when the information is safe to keep beside the repo:

```text
.propagate-env.json
```

Use user-global memory when the information is personal, private, experimental, or should not be committed:

```text
~/.config/propagate-env/memory.json
```

If both exist, repo-local memory should override user-global memory for the current repository.

Ask before writing repo-local memory if the target branches, branch notes, or verification hints might reveal private operational details.

## Memory Fields

- `version`: memory schema version.
- `repos`: map of repository keys to repo memory.
- `provider`: `github`, `gitlab`, `gitea`, or `unknown`.
- `remote`: Git remote name, usually `origin`.
- `remoteUrl`: optional remote URL used when memory was created.
- `repoRoot`: optional local repository root.
- `host`: normalized Git host.
- `repoPath`: normalized repository path, such as `example-org/example-repo`.
- `namespace`: full namespace before the repository name.
- `owner`: first namespace segment.
- `repoName`: repository name.
- `targetBranches`: configured long-lived target branches.
- `tempPrefix`: default temporary branch prefix.
- `branchNotes`: branch-specific warnings or operational notes.
- `verificationHints`: optional commands or paths that help select verification.

## Repo Key

Use a stable remote identity as the repo key when possible:

```text
https://github.com/example-org/example-repo
```

If no remote exists, use the local repo root as the repo key:

```text
/path/to/repo
```

Do not use a temporary branch name or task-specific ticket as the repo key.

## Update Rules

Ask before storing sensitive or private information in repo-local memory.

Record facts the user explicitly gives, such as target branches and branch notes. Do not invent branch notes.

When provider detection is uncertain and the user selects a provider, store that provider so future runs do not ask again.

When a run discovers a repeatable branch-specific warning, ask the user whether to remember it.

## Inspection Flow

When the user asks what the workflow remembers:

1. Read repo-local memory if it exists.
2. Read user-global memory if it exists.
3. Resolve the current repo key from the remote identity or repo root.
4. Summarize provider, remote, target branches, temp prefix, branch notes, and verification hints in plain English.
5. Say clearly when no memory exists for the current repo.

## Update Flow

When the user asks to remember or change repo-specific facts:

1. Resolve the current repo key.
2. Read existing memory.
3. Preserve existing facts that the user did not ask to change.
4. Update only the requested facts.
5. Ask before storing private facts in repo-local memory.
6. Summarize what changed.

Examples:

- `propagate-env remember this repo targets release/dev and main`
- `propagate-env change the temp prefix to temp-TICKET-456-`
- `propagate-env remember that customer/dev needs customer-specific config checks`

## Stale Memory Removal Flow

When the user asks to forget a repo or remove stale memory:

1. Read the memory file.
2. Show the matching repo key and remembered facts.
3. Ask for confirmation before deleting.
4. Remove only the selected repo entry.
5. Summarize what was removed.

## Setup Completion

Setup memory is complete when the selected repo entry contains:

- `provider`
- `remote`
- `targetBranches`
- `tempPrefix`

`remoteUrl`, `branchNotes`, and `verificationHints` are useful but optional.

## Agent Helper

When the workflow repository is available, an agent may use these helpers after collecting the needed facts from Git and the user:

- `workflow/scripts/read-memory.mjs`: inspect memory or one repo entry.
- `workflow/scripts/write-memory.mjs`: create or update one repo entry.
- `workflow/scripts/remove-memory.mjs`: remove one stale repo entry.

These helpers are not user-facing commands; they prevent JSON formatting mistakes.
