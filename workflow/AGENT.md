# propagate-env

Use this workflow when the user invokes `propagate-env` or otherwise asks to apply the same logical Git change across configured long-lived target branches.

Example invocations:

- `propagate-env the current staged changes with prefix temp-TICKET-123-short-description`
- `propagate-env commit abc1234 to the configured target branches`
- `propagate-env remember that this repo targets release/dev, customer/dev, and main`
- `propagate-env clean up the temp branches from the PRs you just prepared`

The exact invocation syntax depends on the host environment. It may be a mention, slash command, workflow picker, skill name, or plain text. Treat the workflow name and task details as the important signal.

## Core Safety Rule

Each target branch must start from its own original branch or freshest safe remote-tracking ref. Prepare every target branch independently.

Good:

- Create `temp-release-dev-ticket-123` from `origin/release/dev`.
- Create `temp-customer-dev-ticket-123` from `origin/customer/dev`.
- Create `temp-main-ticket-123` from `origin/main`.

Unsafe:

- Create the second temporary branch from the first temporary branch.
- Use a prepared branch as the source base for another target branch.
- Carry branch-specific files from one target branch into another target branch.

## Inputs To Resolve

Resolve these before mutating Git state:

- Source change: staged changes, working tree changes, one commit, or an ordered list of commits.
- Target branches: read from repo memory when available; ask the user when missing.
- Temporary branch prefix: use the user-provided prefix when present; otherwise use `temp-`.
- Provider: detect from `git remote -v` when possible; ask the user when uncertain.
- Verification: infer from changed files and project scripts; avoid hardcoded project commands.

## Repo Memory

Before propagating changes, look for repo-specific memory in this order:

1. Repo-local workflow memory, if present.
2. User-global workflow memory, if present.
3. Conversation context supplied by the user.

Memory may include:

- Target branches.
- Git provider override.
- Remote name.
- Temporary branch prefix preference.
- Branch-specific notes.
- Verification hints.

If memory is missing, ask only for the facts needed to continue. If the user provides target branches, provider selection, or branch notes, record them in the chosen memory location when the environment allows file edits.

## Setup Flow

When the user asks to set up the workflow for a repo:

1. Confirm the current directory is inside a Git repository.
2. Inspect `git remote -v`.
3. Detect the provider if possible.
4. Ask the user for the provider if detection is uncertain.
5. Ask for target branches.
6. Ask for branch-specific notes only when useful.
7. Store the resulting memory.
8. Summarize what was remembered.

## Propagation Flow

1. Inspect Git state with:
   - `git status --short`
   - `git remote -v`
   - `git branch --show-current`
   - `git branch -vv`
2. Identify the source change.
   - For staged changes, inspect `git diff --staged`.
   - For working tree changes, inspect `git diff`.
   - For one commit, inspect `git show --stat <sha>` and `git show --patch <sha>`.
   - For multiple commits, preserve the user-provided order.
3. Resolve provider and target branches from memory or user input.
4. Fetch remote refs when credentials and network access allow it.
5. For each target branch independently:
   - Choose the freshest safe base ref for that target.
   - Create a temporary source branch from that base.
   - Apply the complete source change.
   - Preserve intentional differences in the target branch.
   - Commit the adapted change.
   - Run verification appropriate to the changed files.
   - Push only if verification succeeds.
   - Generate the correct provider-specific PR or compare URL after push succeeds.
6. Report every branch separately.
7. Ask whether the user wants temporary branches removed after PRs are raised or prepared.

## Provider Handling

Detect common providers from local remotes:

- GitHub: hosts like `github.com` or GitHub Enterprise hosts known from memory.
- GitLab: hosts like `gitlab.com` or GitLab self-managed hosts known from memory.
- Gitea: hosts known from memory or user confirmation.

When uncertain, ask the user which provider the repo uses. Do not guess, because compare URL formats differ.

Always URL-encode branch names when constructing PR or compare URLs. Branch names containing `/` are especially important.

## Branch Naming

Temporary branches must start with `temp-` unless the user provides a more specific prefix that also starts with `temp-`.

Preferred pattern:

```text
<prefix><target-sanitized>-<short-change-name>
```

Examples:

```text
temp-TICKET-123-release-dev-fix-auth-timeout
temp-TICKET-123-customer-dev-fix-auth-timeout
temp-TICKET-123-main-fix-auth-timeout
```

Avoid `/` in temporary source branch names unless the provider URL rules have been verified for encoded source branches.

## Verification

Choose verification from local project evidence:

- Package scripts.
- Build files.
- Test files.
- Changed paths.
- Existing repository documentation.
- User-provided branch notes.

If there is no clear verification command, say so in the result and report the lighter checks that were run.

Do not push a branch that fails verification unless the user explicitly approves pushing a known-failing branch.

## Cleanup Flow

When the user asks to clean up temp branches, or accepts the post-PR cleanup prompt:

1. List matching local temporary branches.
2. List matching remote temporary branches when possible.
3. Confirm exactly what will be deleted.
4. Delete only branches matching the configured temporary prefix.
5. Report what was removed and what could not be removed.

## Final Response

Return a concise per-branch summary:

```markdown
Prepared branches and PR links:

- `<target>`: `<temp-branch>` - verification <passed/failed/skipped> - <PR URL, pending URL, or reason not pushed>
- `<target>`: `<temp-branch>` - verification <passed/failed/skipped> - <PR URL, pending URL, or reason not pushed>

Notes: <only include important branch-specific notes, failures, or cleanup prompt>
```

Before finishing, confirm internally:

- Every temporary branch starts from its matching target branch.
- No temporary branch is based on another temporary branch.
- Intended files are committed.
- Unrelated dirty files were not committed.
- PR URLs match the detected or selected provider.
- Branch names with `/` are encoded in URLs.
- The user was asked whether to remove temporary branches after PRs were raised or prepared.
