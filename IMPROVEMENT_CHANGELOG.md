# Improvement Changelog

This changelog records the evolution of `propagate-env` from an organization-specific workflow into a reusable agent-agnostic workflow.

## Evaluation Summary

| Metric | Baseline | Agent Workflow | Change |
| --- | ---: | ---: | ---: |
| Successful propagations | TBD | TBD | TBD |
| Base-branch mistakes | TBD | TBD | TBD |
| Correct PR URLs | TBD | TBD | TBD |
| Human time per task | TBD | TBD | TBD |
| User-facing manual operations | TBD | TBD | TBD |

## Entries

| Stage | What Changed | Evidence | Decision / Learning |
| --- | --- | --- | --- |
| Baseline | Documented the problem, intended user, bottleneck, baseline, metrics, and 2-3 scenarios. | `phases/phase-0-scope-and-baseline.md` | Use one general-purpose prompt without the workflow as the primary baseline. |
| Iteration 1 | Created portable workflow instructions and removed organization-specific assumptions. | `workflow/AGENT.md`, `SKILL.md`, `phases/phase-1-generic-workflow-design.md` | Keep `workflow/AGENT.md` as the source of truth and `SKILL.md` as compatibility only. |
| Iteration 2 | Added repository structure, references, memory schema, deterministic helper scripts, tests, README, and changelog. | `workflow/references/`, `workflow/memory/`, `workflow/scripts/`, `test/run-tests.mjs`, `README.md` | Keep scripts focused on deterministic tasks agents often get subtly wrong. |
| Iteration 3 | Added the plain-English setup flow with repo inspection and memory writing helpers. | `phases/phase-3-plain-english-setup-flow.md`, `workflow/AGENT.md`, `workflow/scripts/inspect-repo.mjs`, `workflow/scripts/write-memory.mjs` | Agents should ask only for missing setup facts, default to `temp-`, and store provider/branch memory after setup. |
| Iteration 4 | Strengthened provider detection and URL generation with normalized remote identity fields and broader tests. | `phases/phase-4-provider-detection-and-url-generation.md`, `workflow/references/providers.md`, `workflow/scripts/detect-provider.mjs`, `workflow/scripts/generate-pr-url.mjs`, `test/run-tests.mjs` | Agents can rely on helper output for host, namespace, repo name, provider confidence, and encoded provider URLs. |
| Iteration 5 | Defined memory location precedence, repo identity fields, inspection/update/removal flows, and JSON-safe memory helpers. | `phases/phase-5-memory-model.md`, `workflow/references/memory.md`, `workflow/memory/schema.json`, `workflow/scripts/read-memory.mjs`, `workflow/scripts/write-memory.mjs`, `workflow/scripts/remove-memory.mjs` | Keep memory generic and explicit: repo-local for shareable facts, user-global for private facts, with confirmation before stale entries are removed. |
| Iteration 6 | Added the full propagation workflow with pre-mutation checks, independent target loops, verification-gated push rules, evidence capture, source inspection, and non-destructive propagation planning. | `phases/phase-6-propagation-workflow.md`, `workflow/AGENT.md`, `workflow/scripts/inspect-source.mjs`, `workflow/scripts/plan-propagation.mjs`, `test/run-tests.mjs` | Keep branch mutation under agent judgment, but use helpers for source classification and deterministic branch/URL planning. |
| Iteration 7 | Added the cleanup workflow with dry-run candidate listing, local/remote scope support, exact-prefix confirmation, and guarded deletion. | `phases/phase-7-cleanup-workflow.md`, `workflow/AGENT.md`, `workflow/scripts/cleanup-temp-branches.mjs`, `test/run-tests.mjs` | Cleanup should remain plain-English driven and destructive actions should require candidate review plus explicit confirmation. |

## Open Evidence To Collect

- Baseline run on documented scenarios.
- Workflow-assisted run on the same scenarios.
- End-to-end fixture repo logs.
- Representative agent trajectories.
- Cleanup workflow evidence.
