# Phase 1: Generic Workflow Design

Purpose: remove hardcoded organization-specific assumptions while keeping the useful workflow discipline.

## Decisions For This Phase

- Workflow name: `propagate-env`.
- Primary portable instruction entrypoint: `workflow/AGENT.md`.
- Compatibility entrypoint: `SKILL.md`, for harnesses that invoke reusable workflows through a skill file.
- User invocation style: workflow name plus task details, such as `propagate-env the current staged changes with prefix temp-TICKET-123-short-description`.

## Design Principles

The workflow should be portable across agents and tools. It should not depend on one agent product, one Git hosting provider, one repository, or one fixed branch list.

The workflow should preserve the core safety rule from the starting point: each target branch must be handled independently from its own base branch. Prepared branches must not be chained together.

The workflow should ask when a fact is unknown and risky to infer. Provider identity, target branches, and branch-specific notes can be discovered from memory when available; otherwise the agent should ask concise questions before mutating Git state.

## Required Behavior

- Read repo-specific memory before acting when memory exists.
- Detect the Git provider from local remote information when possible.
- Ask the user to choose the provider when detection is uncertain.
- Use configured target branches rather than hardcoded branch names.
- Create one temporary source branch per target branch.
- Start each temporary source branch from the matching target branch or its freshest safe remote-tracking ref.
- Apply the same logical source change independently to each temporary source branch.
- Generate provider-specific PR or compare URLs.
- URL-encode branch names that contain `/`.
- Use a `temp-` branch prefix by default, unless the user provides a more specific prefix.
- Record branch-specific notes and warnings when the user provides them or when the run discovers them.
- After PRs are raised or prepared, ask whether the user wants temporary branches removed.

## Out Of Scope For This Phase

- Full memory schema.
- Provider URL implementation details.
- Fixture repositories and automated tests.
- Public release packaging.

Those are handled in later phases.

## Phase 1 Review Checklist

- [x] `workflow/AGENT.md` is the portable source of truth.
- [x] `SKILL.md` no longer contains private provider, repo, or branch assumptions.
- [x] Invocation examples use `propagate-env`.
- [x] The workflow uses configured targets instead of fixed targets.
- [x] The workflow keeps independent branch bases as a hard safety rule.
- [x] The workflow includes memory-reading guidance.
- [x] The workflow includes branch-note guidance.
- [x] The workflow includes post-PR cleanup prompting.
