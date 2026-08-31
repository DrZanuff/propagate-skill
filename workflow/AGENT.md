# propagate-env

Use this workflow when the user invokes `propagate-env` or otherwise asks to apply the same logical Git change across configured long-lived target branches.

Example invocations:

- `propagate-env the current staged changes with prefix temp-TICKET-123-short-description`
- `propagate-env commit abc1234 to the configured target branches`
- `propagate-env set up this repo for branch propagation`
- `propagate-env remember that this repo targets release/dev, customer/dev, and main`
- `propagate-env clean up the temp branches from the PRs you just prepared`

The exact invocation syntax depends on the host environment. It may be a mention, slash command, workflow picker, skill name, or plain text. Treat the workflow name and task details as the important signal.

## Workflow Root

Resolve helper script paths relative to this `AGENT.md` file.

Common locations:

- Source repository: `workflow/`
- Installed by `npx propagate-env install`: `.propagate-env/workflow/`

Examples below use `<workflow-root>` for that directory.

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

Read [workflow/references/memory.md](references/memory.md) when the user asks to inspect, update, create, or remove repo memory.

Memory interaction examples:

- `propagate-env what do you remember for this repo?`
- `propagate-env update this repo to target release/dev and main`
- `propagate-env remember customer/dev needs customer-specific config checks`
- `propagate-env forget the memory for this repo`

## Setup Flow

Enter setup mode when the user invokes `propagate-env` with configure, set up, remember, target branch, provider, branch-note, or repo memory language.

Setup examples:

- `propagate-env set up this repo for branch propagation`
- `propagate-env configure this repository`
- `propagate-env remember that this repo targets release/dev, customer/dev, and main`
- `propagate-env this repo is GitLab and targets release/dev and main`
- `propagate-env for customer/dev, remember to preserve customer-specific config`

When setup is triggered:

1. Confirm the current directory is inside a Git repository.
   - You may run `node <workflow-root>/scripts/inspect-repo.mjs` when this workflow is available.
   - Completion criterion: you know the repository root or have reported that the current directory is not a Git repository.
2. Inspect `git remote -v`.
   - Completion criterion: you have the remote list or have reported that the repo has no remotes.
3. Detect the provider from the selected remote URL when possible.
   - Prefer exact detection over heuristics.
   - Completion criterion: provider is `github`, `gitlab`, `gitea`, or unresolved.
4. Ask the user for the provider if detection is uncertain.
   - Use: `I cannot confidently identify this Git host. Is this repository hosted on GitHub, GitLab, or Gitea?`
   - Completion criterion: the user answered, or setup is paused waiting for that answer.
5. Ask for target branches when they are not already known from memory or the user request.
   - Use: `Which target branches should propagate-env remember for this repo?`
   - Completion criterion: at least one target branch is known.
6. Ask for branch-specific notes when useful.
   - Use: `Any branch-specific notes I should remember, such as config, release, customer, or verification differences? You can say "none."`
   - Completion criterion: notes were recorded or the user said there are none.
7. Use `temp-` as the default temporary branch prefix.
   - Ask about prefix only when the user requests a custom prefix or existing memory conflicts with the default.
   - Completion criterion: the prefix starts with `temp-`.
8. Store the resulting memory.
   - Prefer repo-local `.propagate-env.json` when the facts are safe to keep with the repo.
   - Prefer user-global `~/.config/propagate-env/memory.json` for private or personal facts.
   - You may run `node <workflow-root>/scripts/write-memory.mjs` after the required facts are known.
   - Completion criterion: memory contains provider, remote, target branches, and temp prefix.
9. Summarize what was remembered in plain English.
   - Include provider, remote, target branches, temp prefix, memory location, and branch notes.
10. Record setup evidence in the project progress log when this repository is being improved.

## Propagation Flow

Enter propagation mode when the user invokes `propagate-env` with a source change and propagation intent, such as:

- `propagate-env this commit`
- `propagate-env commit abc1234 to the configured target branches`
- `propagate-env the current staged changes with prefix temp-TICKET-123-short-description`
- `propagate-env these commits abc1234 def5678 in order`

When propagation is triggered:

1. Identify the source change.
   - For staged changes, inspect `git diff --staged`.
   - For working tree changes, inspect `git diff`.
   - For one commit, inspect `git show --stat <sha>` and `git show --patch <sha>`.
   - For multiple commits, preserve the user-provided order and inspect each commit.
   - You may run `node <workflow-root>/scripts/inspect-source.mjs` as a non-destructive helper.
   - Completion criterion: source mode, commits if any, changed files, and diff summary are known.
2. Inspect Git state before mutating branches:
   - `git status --short`
   - `git remote -v`
   - `git branch --show-current`
   - `git branch -vv`
   - Completion criterion: current branch, dirty state, remotes, and local branch tracking state are known.
3. Resolve provider, remote, target branches, temp prefix, branch notes, and verification hints from memory or user input.
   - Ask for target branches when memory does not provide them.
   - Ask for provider when detection is uncertain.
   - Completion criterion: every required input is known before branches are created.
4. Fetch remote refs when credentials and network access allow it.
   - If fetch fails, continue only with existing local refs and record that limitation.
5. Plan the per-target work.
   - You may run `node <workflow-root>/scripts/plan-propagation.mjs` to generate deterministic temp branch names, base refs, pending URLs, and push commands.
   - Treat generated URLs as pending until the matching source branch is pushed.
6. For each target branch independently:
   - Choose the freshest safe base ref for that target.
   - Create a temporary source branch from that base.
   - Apply the complete source change to that temp branch only.
   - Resolve conflicts while preserving intentional differences in the target branch.
   - Commit the adapted change.
   - Run verification appropriate to the changed files.
   - Push only if verification succeeds.
   - Generate or mark ready the correct provider-specific PR or compare URL after push succeeds.
   - Record base ref, temp branch, verification, push, URL state, conflicts, and adaptations.
7. Report every branch separately, including push-pending URLs when push is unavailable.
8. Ask whether the user wants temporary branches removed after PRs are raised or prepared.

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

## Evidence To Record

For each target branch, record:

- Target branch.
- Base ref used.
- Temporary branch.
- Source application method.
- Conflict/adaptation notes.
- Verification command and result.
- Push result.
- Ready or pending PR URL.

## Cleanup Flow

When the user asks to clean up temp branches, or accepts the post-PR cleanup prompt:

1. Resolve the cleanup prefix from the last propagation run, memory, or the user request.
   - Completion criterion: the prefix is known and starts with `temp-`.
2. Resolve cleanup scope: local, remote, or both.
   - If unclear, ask which scope the user wants.
3. List matching local temporary branches.
4. List matching remote temporary branches when possible.
   - You may run `node <workflow-root>/scripts/cleanup-temp-branches.mjs --prefix <prefix>` for a dry-run candidate list.
5. Confirm exactly what will be deleted.
   - Use: `I found these temp branches matching <prefix>. Should I delete the listed local branches, remote branches, or both?`
6. Delete only confirmed branches matching the configured temporary prefix.
   - You may run `node <workflow-root>/scripts/cleanup-temp-branches.mjs --prefix <prefix> --scope <scope> --execute --confirm-prefix <prefix>` after confirmation.
7. Report what was removed and what could not be removed.
8. Record cleanup evidence in the progress log when this repository is being improved.

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
