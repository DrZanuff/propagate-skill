# propagate-env

`propagate-env` is an agent-agnostic workflow for applying the same logical Git change across multiple long-lived target branches.

It is designed for developers and maintainers who need to propagate a staged diff, working tree diff, commit, or ordered set of commits into environment, release, customer, regional, or deployment-track branches without accidentally stacking branches or leaking branch-specific differences.

## Install

Install the workflow into any Git repository with `npx`, or give your agent direct access to this repository.

After npm publication:

```bash
npx propagate-env install
```

Before npm publication, install from GitHub:

```bash
npx github:DrZanuff/propagate-skill install
```

The installer writes `.propagate-env/workflow/`, `.propagate-env.json`, `PROPAGATE_ENV.md`, and `AGENTS.md` when no `AGENTS.md` already exists.

Check the local repository setup:

```bash
npx propagate-env doctor
```

The `npx` command is for installation and diagnostics, not for normal propagation actions.

## Plain-English Use

Daily use happens in your agent. Invoke the workflow by name in the style supported by your environment.

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

Some environments may use `@propagate-env`, slash commands, workflow pickers, agent rule files, or plain text. The exact invocation mechanism is not important. The workflow name plus task details are the portable interface.

## What Gets Installed

```text
.propagate-env/workflow/AGENT.md                 Portable workflow instructions.
.propagate-env/workflow/references/providers.md  Provider detection and PR URL rules.
.propagate-env/workflow/references/memory.md     Memory conventions.
.propagate-env/workflow/memory/schema.json       Memory schema.
.propagate-env/workflow/scripts/                 Deterministic helper scripts.
.propagate-env.json                              Repo-local memory file.
PROPAGATE_ENV.md                                 Pointer for agents.
AGENTS.md                                       Pointer for agents, when no AGENTS.md exists.
```

## Repository Layout

```text
workflow/AGENT.md                 Portable workflow instructions.
workflow/references/providers.md  Provider detection, normalized remote identity, and PR URL rules.
workflow/references/memory.md     Memory conventions.
workflow/memory/schema.json       Memory schema with repo identity fields.
workflow/scripts/                 Deterministic helper scripts.
test/run-tests.mjs                Helper script tests.
bin/propagate-env.mjs             npx installer and diagnostics entrypoint.
package.json                      npm package metadata.
```

## Memory

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

## Development

Requirements:

- Git.
- Node.js 18 or newer.

Run tests:

```bash
npm test
```

Expected output:

```text
All tests passed.
```

These tests cover SSH/HTTPS provider detection, normalized remote identity fields, provider-specific PR URL generation, slash branch encoding, nested GitLab groups, setup memory writing, memory reading, stale memory removal, repo inspection, source inspection, non-destructive propagation planning, temp branch cleanup safety, and the `npx` installer.

Check the package contents before publishing:

```bash
npm run pack:check
```
