# Improvement Changelog

This changelog records the evolution of `propagate-env` from an organization-specific workflow into a reusable agent-agnostic workflow.

## Evaluation Summary

Baseline measurements are pending the final recording run. The workflow column records the GitHub evidence collected so far.

| Metric | Baseline Prompt | `propagate-env` Workflow | Current Evidence |
| --- | ---: | ---: | --- |
| Successful target propagations | Pending baseline run | 6/6 in Phase 8 | Clean and conflict GitHub scenarios each pushed to `main`, `release/dev`, and `customer/dev`. |
| Base-branch mistakes | Pending baseline run | 0 observed | Every temp branch was based on its own target branch. |
| Correct provider URLs | Pending baseline run | 6/6 in Phase 8 | GitHub URLs encoded `release/dev` and `customer/dev`. |
| Verification before push | Pending baseline run | 6/6 pushed branches verified | `npm test` passed before each Phase 8 push. |
| Push-unavailable handling | Pending baseline run | Passed simulation | Push failure was reported as push-pending, not ready for PR. |
| Cleanup safety | Pending baseline run | Passed scoped cleanup | Cleanup helper deleted only branches matching the confirmed prefix. |

## Entries

| Stage | What Changed | Why It Changed | Evidence | Decision / Learning |
| --- | --- | --- | --- | --- |
| Baseline | Documented the problem, intended user, bottleneck, baseline, metrics, and 2-3 scenarios. | The project needs a fair comparison point before claiming improvement. | `phases/phase-0-scope-and-baseline.md` | Use one general-purpose prompt without the workflow as the primary baseline. |
| Iteration 1 | Created portable workflow instructions and removed organization-specific assumptions. | The workflow should be reusable across agents, providers, and repos. | `workflow/AGENT.md`, `SKILL.md`, `phases/phase-1-generic-workflow-design.md` | Keep `workflow/AGENT.md` as the source of truth and `SKILL.md` as compatibility only. |
| Iteration 2 | Added repository structure, references, memory schema, deterministic helper scripts, tests, README, and changelog. | Reviewers and future agents need a clean project shape and reproducible checks. | `workflow/references/`, `workflow/memory/`, `workflow/scripts/`, `test/run-tests.mjs`, `README.md` | Keep scripts focused on deterministic tasks agents often get subtly wrong. |
| Iteration 3 | Added the plain-English setup flow with repo inspection and memory writing helpers. | Users should configure the workflow through normal agent conversation, not setup commands. | `phases/phase-3-plain-english-setup-flow.md`, `workflow/AGENT.md`, `workflow/scripts/inspect-repo.mjs`, `workflow/scripts/write-memory.mjs` | Agents should ask only for missing setup facts, default to `temp-`, and store provider/branch memory after setup. |
| Iteration 4 | Strengthened provider detection and URL generation with normalized remote identity fields and broader tests. | Provider URL formats are easy to guess incorrectly, especially with slash branches and nested GitLab groups. | `phases/phase-4-provider-detection-and-url-generation.md`, `workflow/references/providers.md`, `workflow/scripts/detect-provider.mjs`, `workflow/scripts/generate-pr-url.mjs`, `test/run-tests.mjs` | Agents can rely on helper output for host, namespace, repo name, provider confidence, and encoded provider URLs. |
| Iteration 5 | Defined memory location precedence, repo identity fields, inspection/update/removal flows, and JSON-safe memory helpers. | Repo-specific knowledge should be preserved without being baked into public workflow instructions. | `phases/phase-5-memory-model.md`, `workflow/references/memory.md`, `workflow/memory/schema.json`, `workflow/scripts/read-memory.mjs`, `workflow/scripts/write-memory.mjs`, `workflow/scripts/remove-memory.mjs` | Keep memory generic and explicit: repo-local for shareable facts, user-global for private facts, with confirmation before stale entries are removed. |
| Iteration 6 | Added the full propagation workflow with pre-mutation checks, independent target loops, verification-gated push rules, evidence capture, source inspection, and non-destructive propagation planning. | The most important safety behavior is procedural: each target branch needs an independent base and its own verification. | `phases/phase-6-propagation-workflow.md`, `workflow/AGENT.md`, `workflow/scripts/inspect-source.mjs`, `workflow/scripts/plan-propagation.mjs`, `test/run-tests.mjs` | Keep branch mutation under agent judgment, but use helpers for source classification and deterministic branch/URL planning. |
| Iteration 7 | Added the cleanup workflow with dry-run candidate listing, local/remote scope support, exact-prefix confirmation, and guarded deletion. | Temporary branch cleanup is useful but destructive if scoped poorly. | `phases/phase-7-cleanup-workflow.md`, `workflow/AGENT.md`, `workflow/scripts/cleanup-temp-branches.mjs`, `test/run-tests.mjs` | Cleanup should remain plain-English driven and destructive actions should require candidate review plus explicit confirmation. |
| Iteration 8 | Ran the workflow against a real public GitHub stress-test repository. Created target branches, clean and conflict source scenarios, propagated temp branches, simulated push-unavailable behavior, and tested cleanup. | The deterministic helper tests needed an end-to-end GitHub proof before real submission. | `phases/phase-8-test-repositories.md`, `https://github.com/DrZanuff/propagate-stress-test` | GitHub path works end to end. GitLab/Gitea and second-agent runs are deferred. Conflict handling proved useful because release/customer branches needed branch-specific preservation. |
| Iteration 9 | Added evaluation and recording assets: Phase 9 doc, video script, demo runbook, baseline script, deliverables checklist, representative trajectories, and a prepared source branch for the live demo. | The hackathon deliverable needs measured comparison, reproducible recording steps, and readable trajectories. | `phases/phase-9-evaluation-and-evidence.md`, `recording/`, `deliverables/final-deliverables-checklist.md`, `scenario/recording-add-build-label` | The package is ready for recording; final baseline numbers and the live solution trajectory still need to be filled after the video run. |

## Failed Experiments And Learnings

| Experiment / Failure | What Happened | Learning |
| --- | --- | --- |
| Unquoted shell JSON during memory setup | Branch notes containing parentheses caused shell parsing trouble when passed directly. | Memory writes should go through helper arguments or file-backed JSON, not hand-assembled shell snippets. |
| Push-unavailable simulation | A temp branch verified locally but failed to push to an intentionally missing remote. | The workflow must label URLs as push-pending until push success is confirmed. |
| Broad provider scope before real remotes | GitHub, GitLab, and Gitea were all planned, but only GitHub had a real public remote ready for this pass. | Keep deterministic GitLab/Gitea tests, but mark real remote testing as deferred until those remotes exist. |

## Main Failure Mode

The main failure mode is branch contamination: an agent accidentally stacks target branches, or resolves conflicts by overwriting branch-specific behavior instead of preserving it.

## Hot Take

Branch propagation is less a Git command problem than an agent context problem. The big win is making hidden branch knowledge explicit, testable, and reusable.

## Open Evidence To Collect

- Baseline run on the recording scenario.
- Workflow-assisted live run on the same recording scenario.
- Final Trajectory 6 in `recording/agent-trajectories.md`.
- Runtime and cost after the final recording.
- Optional second-agent run.
