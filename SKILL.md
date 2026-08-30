---
name: propagate-env
description: Apply staged changes, working tree changes, or commits across configured long-lived target branches. Use when the user invokes propagate-env, asks to propagate a change to environment/customer/release branches, asks to prepare independent temp branches and PR links, asks to remember target branches or branch-specific notes, or asks to clean up propagation temp branches.
---

# propagate-env

This is a compatibility entrypoint for agent environments that invoke reusable workflows through a `SKILL.md` file.

The portable source of truth is [workflow/AGENT.md](workflow/AGENT.md). Read that file before taking action.

Use this workflow for requests like:

- `propagate-env the current staged changes with prefix temp-TICKET-123-short-description`
- `propagate-env commit abc1234 to the configured target branches`
- `propagate-env remember that this repo targets release/dev, customer/dev, and main`
- `propagate-env clean up the temp branches from the PRs you just prepared`

Core rule: each target branch must start from its own original branch or freshest safe remote-tracking ref. Never base one target branch's temporary branch on another target branch's temporary branch.
