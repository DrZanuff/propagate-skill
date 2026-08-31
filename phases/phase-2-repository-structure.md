# Phase 2: Repository Structure

Purpose: make the workflow public, portable, agent-friendly, and reproducible.

## Current Decision

The repository began private during development. It is now structured for public use and npm installation.

## Repository Shape

The project should expose the workflow in a way any capable coding agent or automation tool can read:

```text
propagate-skill/
├── workflow/
│   ├── AGENT.md
│   ├── scripts/
│   ├── references/
│   └── memory/
├── test/
├── phases/
├── README.md
├── IMPROVEMENT_CHANGELOG.md
├── IMPLEMENTATION_PLAN.md
└── package.json
```

`workflow/AGENT.md` is the portable source of truth. Installed repositories get a `PROPAGATE_ENV.md` pointer so agents can find the workflow without relying on a tool-specific skill format.

## Helper Scripts

Only add helper scripts for deterministic work that agents often get subtly wrong:

- Detecting the provider from a Git remote.
- Generating provider-specific PR or compare URLs.

Avoid making the user memorize script commands. The scripts exist so an agent can call them when useful.

## References

References should hold details that are useful but too verbose for the main workflow:

- Provider URL rules and detection behavior.
- Memory conventions and schema expectations.
- Evaluation guidance for baseline and workflow comparison.

## Tests

Tests should validate the deterministic helper scripts first:

- GitHub, GitLab, Gitea, and unknown provider detection.
- URL generation for GitHub, GitLab, and Gitea.
- Branch names containing `/`.
- Nested GitLab groups.

End-to-end fixture repos belong to later phases.

## Public-Readiness Notes

Before publication, verify:

- No private hostnames, repo names, branch names, or credentials are present.
- The README explains usage without assuming a specific agent product.
- Example prompts use neutral branch names.
- The improvement changelog separates planned work from measured results.

## Phase 2 Review Checklist

- [x] Portable workflow instructions exist under `workflow/`.
- [x] Deterministic helper scripts exist for provider detection and URL generation.
- [x] References exist under `workflow/references/`.
- [x] Memory schema and example template exist under `workflow/memory/`.
- [x] Script tests exist under `test/`.
- [x] README documents usage and reproduction.
- [x] Improvement changelog exists.
- [x] Example workflow invocations are documented.
- [x] Repository has been made public.
