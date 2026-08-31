# Phase 5: Memory Model

Purpose: preserve repo-specific knowledge without baking it into the public workflow.

## Memory Location Decision

Use two supported memory locations:

- Repo-local: `.propagate-env.json`
- User-global: `~/.config/propagate-env/memory.json`

Repo-local memory is the default when the facts are safe to keep beside the repository. User-global memory is preferred for personal, private, experimental, or non-committable facts.

When both exist, repo-local memory overrides user-global memory for the same repository.

## Repo Identity

Use a stable remote identity as the repo key when possible:

```text
https://github.com/example-org/example-repo
```

If no remote exists, use the local repository root path.

Each memory entry may also store normalized identity fields:

- `remoteUrl`
- `repoRoot`
- `host`
- `repoPath`
- `namespace`
- `owner`
- `repoName`

## Required Memory Fields

Each repo entry must include:

- `provider`
- `remote`
- `targetBranches`
- `tempPrefix`

Optional fields:

- `remoteUrl`
- `repoRoot`
- `host`
- `repoPath`
- `namespace`
- `owner`
- `repoName`
- `branchNotes`
- `verificationHints`

## Plain-English Inspection Flow

When the user asks what is remembered:

1. Resolve the current repo identity.
2. Read repo-local memory.
3. Read user-global memory.
4. Apply repo-local override when both exist.
5. Summarize provider, remote, target branches, temp prefix, branch notes, and verification hints.
6. Say clearly when no memory exists.

## Plain-English Update Flow

When the user asks to remember or change a fact:

1. Resolve the current repo identity.
2. Read existing memory.
3. Preserve facts that the user did not ask to change.
4. Update only the requested facts.
5. Ask before writing private facts to repo-local memory.
6. Summarize the change.

## Plain-English Stale Removal Flow

When the user asks to forget stale memory:

1. Read the matching memory entry.
2. Show the remembered facts.
3. Ask for confirmation before deletion.
4. Remove only the selected repo entry.
5. Summarize what was removed.

## Helper Scripts

Helper scripts are included because manual JSON editing is error-prone:

- `workflow/scripts/read-memory.mjs`
- `workflow/scripts/write-memory.mjs`
- `workflow/scripts/remove-memory.mjs`

They are agent-executed implementation details.

## Phase 5 Review Checklist

- [x] Memory location is decided.
- [x] JSON schema is defined.
- [x] Repo path or remote identity can be stored.
- [x] Provider can be stored.
- [x] Remote name can be stored.
- [x] Target branches can be stored.
- [x] Temp branch prefix can be stored.
- [x] Branch-specific notes can be stored.
- [x] Plain-English memory inspection flow is defined.
- [x] Plain-English memory update flow is defined.
- [x] Plain-English stale memory removal flow is defined.
- [x] Helper scripts exist only for JSON-safe memory operations.
