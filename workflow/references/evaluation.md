# Evaluation Reference

Use this reference when measuring whether `propagate-env` improves branch propagation.

## Baseline

Use the same repository scenario for the baseline and the workflow-assisted run.

Recommended baseline:

```text
propagate-env the current staged changes with prefix temp-TICKET-123-short-description
```

For the baseline run, the agent receives this invocation-style request but does not receive the workflow instructions, provider rules, memory model, or verification checklist.

## Primary Metric

Successful independent branch propagation:

```text
successful target branches / intended target branches
```

A target branch succeeds when:

- Its temp branch starts from the correct target base.
- The intended logical change is present.
- Unrelated branch-specific changes are not leaked from another target branch.
- Verification passes or the limitation is clearly reported.
- The PR or compare URL is correct when push is available.

## Secondary Metrics

- Base-branch mistakes.
- Correct PR URLs.
- Human time from request to ready branch summary.
- User-facing manual operations.
- Cleanup safety.
- Memory reuse across runs.

## Minimum Scenarios

Use 2-3 documented scenarios before creating fixture repositories:

- Clean multi-branch propagation.
- Unknown provider setup.
- Branch-specific conflict.

Record failures. Failed experiments are useful evidence when they explain an improvement.
