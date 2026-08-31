# propagate-env

`propagate-env` is an agent-agnostic workflow for applying the same logical Git change across multiple long-lived target branches.

It is designed for developers and maintainers who need to propagate a staged diff, working tree diff, commit, or ordered set of commits into environment, release, customer, regional, or deployment-track branches without accidentally stacking branches or leaking branch-specific differences.

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
REPRODUCTION_GUIDE.md             Clean-environment reproduction guide.
IMPLEMENTATION_PLAN.md            Checklist tracker.
IMPROVEMENT_CHANGELOG.md          Evidence and iteration log.
SKILL.md                          Compatibility entrypoint for skill-based harnesses.
```

## Reproduction Guide

Requirements:

- Git.
- Node.js 18 or newer for helper script tests.

Observed versions during the current evaluation pass:

- Git `2.43.0`
- Node.js `v22.18.0`
- npm `10.9.3`

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

## GitHub Stress-Test Repository

The current public GitHub fixture is:

```text
https://github.com/DrZanuff/propagate-stress-test
```
