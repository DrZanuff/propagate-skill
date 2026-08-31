# propagate-env

`propagate-env` is an agent-agnostic workflow for applying the same logical Git change across multiple long-lived target branches.

It is designed for developers and maintainers who need to propagate a staged diff, working tree diff, commit, or ordered set of commits into environment, release, customer, regional, or deployment-track branches without accidentally stacking branches or leaking branch-specific differences.

The repository is private during development, but the content is structured so it can become public after review.

## How To Use

Give your agent or automation tool access to this repository, then invoke the workflow by name in the style supported by that environment.

Example requests:

```text
propagate-env set up this repo for branch propagation.
propagate-env remember that this repo targets release/dev, customer/dev, and main.
propagate-env this repo is GitLab and targets release/dev and main.
propagate-env for customer/dev, remember to preserve customer-specific config.
propagate-env the current staged changes with prefix temp-TICKET-123-short-description.
propagate-env commit abc1234 to the configured target branches.
propagate-env clean up the temp branches from the PRs you just prepared.
```

Some environments may use `@propagate-env`, slash commands, workflow pickers, or skill files. The exact invocation mechanism is not important. The workflow name plus task details are the portable interface.

## Repository Layout

```text
workflow/AGENT.md                 Portable workflow instructions.
workflow/references/providers.md  Provider detection, normalized remote identity, and PR URL rules.
workflow/references/memory.md     Memory conventions.
workflow/references/evaluation.md Baseline and evaluation guidance.
workflow/memory/schema.json       Memory schema with repo identity fields.
workflow/scripts/                 Deterministic helper scripts.
test/run-tests.mjs                Helper script tests.
phases/                           Planning notes by phase.
IMPLEMENTATION_PLAN.md            Checklist tracker.
IMPROVEMENT_CHANGELOG.md          Evidence and iteration log.
SKILL.md                          Compatibility entrypoint for skill-based harnesses.
```

## Reproduction Guide

Requirements:

- Git.
- Node.js 18 or newer for helper script tests.

Run the current deterministic tests:

```bash
node test/run-tests.mjs
```

Expected output:

```text
All tests passed.
```

These tests cover SSH/HTTPS provider detection, normalized remote identity fields, provider-specific PR URL generation, slash branch encoding, nested GitLab groups, setup memory writing, memory reading, stale memory removal, repo inspection, source inspection, non-destructive propagation planning, and temp branch cleanup safety. End-to-end Git fixture tests are planned for a later phase.

## Setup Memory

During setup, the agent should inspect the current Git repository, detect or ask for the provider, ask for target branches if missing, optionally gather branch notes, and then write memory.

The default repo-local memory file is:

```text
.propagate-env.json
```

Private or personal memory can instead live at:

```text
~/.config/propagate-env/memory.json
```

The user should not need to run memory commands directly. The workflow tells the agent how to collect and store the facts.

Memory stores a stable repo key plus useful identity fields such as host, repo path, namespace, owner, repo name, remote URL, and local root. Repo-local memory overrides user-global memory for the same repository.

## Safety Rule

Each target branch must start from its own original branch or freshest safe remote-tracking ref. A temporary branch for one target must not become the base for another target.

This is the main behavior the workflow protects.

## Current Status

- Phase 0 complete: scope and baseline documented.
- Phase 1 complete: generic workflow instructions created.
- Phase 2 complete except publication: repository structure, references, schema, scripts, tests, README, and changelog.
- Phase 3 complete: plain-English setup flow documented and backed by setup helper scripts.
- Phase 4 complete: provider detection and URL generation documented and tested.
- Phase 5 complete: memory model, schema, and read/write/remove helpers documented and tested.
- Phase 6 complete: propagation workflow documented with source inspection and non-destructive planning helpers.
- Phase 7 complete: cleanup workflow documented with dry-run-first local and remote branch cleanup helper.
