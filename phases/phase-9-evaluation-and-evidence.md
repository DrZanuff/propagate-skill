# Phase 9: Evaluation And Evidence

Purpose: satisfy the hackathon requirement to show measured improvement.

## Scope

This phase turns the working implementation into evidence a reviewer can follow:

- A clearly labeled improvement changelog.
- A baseline and solution comparison table.
- Representative agent trajectories.
- A recording script and runbook for the solution video.
- A deliverables checklist mapped to the hackathon PDF.

The current evidence is strongest for the GitHub path. GitLab, Gitea, and second-agent validation are intentionally tracked as deferred work until they are tested.

## Baseline

The selected baseline is one general-purpose prompt without the new workflow.

Baseline prompt to record:

```text
Please apply this change to main, release/dev, and customer/dev, then prepare pull request links.
```

Expected baseline risks:

- The agent may forget to start each target branch from its own base branch.
- The agent may stack one temp branch on top of another.
- The agent may miss branch-specific notes.
- The agent may generate incorrect compare URLs for branch names containing `/`.
- The agent may report PR links before push success is known.
- The agent may omit cleanup or delete too broadly.

The baseline run should use the same repository and scenarios as the workflow-assisted run.

## Solution Run

Workflow prompt to record:

```text
propagate-env commit 421f9fb with prefix temp-RECORDING-build-label.
```

Prepared source branch:

```text
scenario/recording-add-build-label
```

Prepared source commit:

```text
421f9fb Add recording build label scenario
```

Prepared target branches:

- `main`
- `release/dev`
- `customer/dev`

The source commit has not been propagated yet. It is intended for the live recording.

## Current Evidence

Automated helper verification:

```bash
node test/run-tests.mjs
```

Expected output:

```text
All tests passed.
```

GitHub stress-test evidence:

- Phase 8 created the public GitHub fixture repository.
- Phase 8 propagated clean and conflict scenarios to all three target branches.
- Phase 8 verified each pushed temp branch with `npm test`.
- Phase 8 generated GitHub compare URLs with slash branch encoding.
- Phase 8 simulated push-unavailable behavior and reported a push-pending URL separately.
- Phase 8 dry-ran and executed scoped temp branch cleanup.

Detailed evidence:

- [Phase 8 Test Repositories](phase-8-test-repositories.md)
- [Agent Trajectories](../recording/agent-trajectories.md)

## Final Comparison Table

Fill the baseline column after recording the baseline run.

| Metric | Baseline Prompt | `propagate-env` Workflow | Current Evidence |
| --- | ---: | ---: | --- |
| Successful target propagations | Pending baseline run | 6/6 in Phase 8 | Clean and conflict GitHub scenarios each pushed to `main`, `release/dev`, and `customer/dev`. |
| Base-branch mistakes | Pending baseline run | 0 observed | Every temp branch was based on its own target branch. |
| Correct provider URLs | Pending baseline run | 6/6 in Phase 8 | GitHub URLs encoded `release/dev` and `customer/dev` as `release%2Fdev` and `customer%2Fdev`. |
| Verification before push | Pending baseline run | 6/6 pushed branches verified | `npm test` passed before each Phase 8 push. |
| Push-unavailable handling | Pending baseline run | Passed simulation | Push failure was reported as push-pending, not ready for PR. |
| Cleanup safety | Pending baseline run | Passed scoped cleanup | Cleanup helper deleted only branches matching the confirmed prefix. |

## Failed Experiments And Learnings

| Experiment / Failure | What Happened | Learning |
| --- | --- | --- |
| Unquoted shell JSON during memory setup | Branch notes containing parentheses caused shell parsing trouble when passed directly. | Memory writes should go through helper arguments or file-backed JSON, not hand-assembled shell snippets. |
| Push-unavailable simulation | A temp branch verified locally but failed to push to an intentionally missing remote. | The workflow must label URLs as push-pending until push success is confirmed. |
| Public-provider scope too broad for first proof | GitHub, GitLab, and Gitea were all planned, but only GitHub had a real public remote ready. | Treat GitLab/Gitea as documented provider support with deterministic tests until real remotes are exercised. |

## Recording Assets

Use these files for the solution video:

- [Video Script](../recording/video-script.md)
- [Demo Runbook](../recording/demo-runbook.md)
- [Baseline Script](../recording/baseline-script.md)
- [Agent Trajectories](../recording/agent-trajectories.md)

## Completion Criteria

- Changelog includes baseline and every meaningful iteration.
- Changelog records what changed, why, evidence, and learning.
- Failed experiments remain visible.
- Final comparison table exists and can be completed after baseline recording.
- Representative trajectories are saved.
- Recording scripts explain what to show and what to say.
