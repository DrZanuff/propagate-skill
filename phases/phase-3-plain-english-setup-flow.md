# Phase 3: Plain-English Setup Flow

Purpose: let any repo configure the workflow through normal agent conversation, without making the user run setup commands manually.

## Setup Trigger Phrases

The workflow should enter setup mode when the user invokes the workflow with requests like:

- `propagate-env set up this repo for branch propagation`
- `propagate-env configure this repository`
- `propagate-env remember this repo targets release/dev, customer/dev, and main`
- `propagate-env this repo is GitLab and targets release/dev and main`
- `propagate-env for customer/dev, remember to preserve customer-specific config`

The exact invocation syntax depends on the agent environment. The important signal is the workflow name plus a request to configure, remember, set up, or update repository-specific propagation facts.

## Setup Flow

When setup is triggered:

1. Verify the current directory is inside a Git repository.
2. Read `git remote -v`.
3. Detect the provider from the remote URL when possible.
4. Ask the user for the provider when detection is uncertain.
5. Ask for target branches when they are not already known from memory or the user request.
6. Ask for branch-specific notes when the setup conversation makes them useful. Accept "none" as a complete answer.
7. Use `temp-` as the default temporary branch prefix. Only ask about the prefix when the user requests a custom prefix or the repo memory already has a conflicting value.
8. Write memory/config after the required facts are known.
9. Summarize the setup in plain English.
10. Record setup evidence in the progress log.

## Required Facts

Setup is complete when memory contains:

- Provider: `github`, `gitlab`, `gitea`, or `unknown` when the user intentionally keeps it unresolved.
- Remote name.
- Remote URL when available.
- Target branches.
- Temporary branch prefix.

Branch notes and verification hints are optional.

## User Questions

Ask only for missing or risky facts.

Provider question:

```text
I cannot confidently identify this Git host. Is this repository hosted on GitHub, GitLab, or Gitea?
```

Target branches question:

```text
Which target branches should propagate-env remember for this repo?
```

Branch notes question:

```text
Any branch-specific notes I should remember, such as config, release, customer, or verification differences? You can say "none."
```

## Helper Scripts

Agents may use helper scripts as implementation details:

- `workflow/scripts/inspect-repo.mjs`: verify Git repo state, read remotes, and detect the provider.
- `workflow/scripts/write-memory.mjs`: create or update a memory file after required facts are known.

These scripts are not user-facing commands. They exist to reduce mistakes in setup.

## Phase 3 Review Checklist

- [x] Setup trigger phrases are defined.
- [x] Setup flow verifies the current directory is a Git repository.
- [x] Setup flow reads `git remote -v`.
- [x] Setup flow detects provider from remotes.
- [x] Setup flow asks when provider is uncertain.
- [x] Setup flow asks for target branches when missing.
- [x] Setup flow asks for branch-specific notes when useful.
- [x] Setup flow defaults to `temp-` without asking unless a custom prefix is needed.
- [x] Setup flow writes memory/config.
- [x] Setup flow summarizes remembered facts.
- [x] Setup evidence is recorded in the progress log.
