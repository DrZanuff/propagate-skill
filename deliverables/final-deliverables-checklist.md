# Final Deliverables Checklist

This checklist maps the hackathon PDF requirements to this repository.

## 01 Complete Solution Code And Improvement Changelog

Status: mostly ready, pending final baseline numbers, final video, and npm publication.

Required:

- [x] Complete solution code.
- [x] Instructions that shape each agent.
- [x] README introduces intended user.
- [x] README explains the bottleneck.
- [x] README explains why solving it is valuable.
- [x] Clearly labeled `IMPROVEMENT_CHANGELOG.md`.
- [x] Every meaningful iteration has its own changelog entry.
- [x] Each entry connects change, reason, evidence, and decision or learning.
- [x] Failed experiments are kept.
- [x] Main failure mode documented.
- [x] Hot take documented.
- [x] License added.
- [x] Public GitHub repository exists.
- [x] `npx` installer prepared.
- [ ] Final baseline measurements filled in.
- [x] Initial public release changes pushed.
- [ ] npm package published, if submitting the `npx` path as live.

Current files:

- [README.md](../README.md)
- [workflow/AGENT.md](../workflow/AGENT.md)
- [IMPROVEMENT_CHANGELOG.md](../IMPROVEMENT_CHANGELOG.md)

## 02 Reproduction Guide

Status: ready for helper scripts; needs final baseline command transcript after recording.

Required:

- [x] Clean-environment setup instructions.
- [x] Exact commands for solution helper tests.
- [x] Exact baseline prompt.
- [x] Exact workflow prompt.
- [x] Evaluation scorecard.
- [x] Required data documented.
- [x] Expected output documented.
- [x] Relevant versions documented.
- [x] Package dry-run command documented.
- [ ] Approximate runtime filled in after final recording.
- [ ] Approximate cost filled in after final recording.

Current files:

- [README.md](../README.md)
- [REPRODUCTION_GUIDE.md](../REPRODUCTION_GUIDE.md)
- [recording/demo-runbook.md](../recording/demo-runbook.md)
- [recording/baseline-script.md](../recording/baseline-script.md)

## 03 Solution Video

Status: script ready, recording pending.

Required video shape:

- [x] Begin with the problem.
- [x] Explain the simple baseline.
- [x] Walk through one realistic execution from start to finish.
- [x] Show final comparison.
- [x] Briefly explain the changelog.
- [x] Highlight the change that contributed most.
- [x] Mention one experiment removed or changed.
- [ ] Record video up to 5 minutes.
- [ ] Confirm final video length.

Current files:

- [recording/video-script.md](../recording/video-script.md)
- [recording/demo-runbook.md](../recording/demo-runbook.md)

## 04 Agent Trajectories

Status: representative trajectories drafted; final live recording trajectory pending.

Required:

- [x] Representative trajectories for the agent used during implementation.
- [x] Instructions are linked to final result.
- [x] Tool responses are summarized.
- [x] Feedback and checkpoints are captured.
- [x] Retries and failed paths are included.
- [ ] Final recording trajectory filled in after video run.
- [ ] Additional agent/tool environment trajectory added if tested.

Current file:

- [recording/agent-trajectories.md](../recording/agent-trajectories.md)

## Delivery Gaps Before Submission

- Fill baseline measurements in `IMPROVEMENT_CHANGELOG.md`.
- Run the prepared live recording prompt and fill Trajectory 6.
- Record video and confirm it is no longer than 5 minutes.
- Decide whether to clean remaining demo temp branches.
- Push the Phase 10 release commit.
- Publish `propagate-env` to npm if the submission needs `npx propagate-env install` live from the registry.

## Main Failure Mode

The main failure mode is branch contamination: an agent accidentally stacks target branches, or resolves conflicts by overwriting branch-specific behavior instead of preserving it.

## Hot Take

Branch propagation is less a Git command problem than an agent context problem. The big win is making hidden branch knowledge explicit, testable, and reusable.
