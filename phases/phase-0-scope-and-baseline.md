# Phase 0: Scope And Baseline

Purpose: define the problem clearly and create a fair comparison point.

## Intended User

The intended user is a developer or technical maintainer responsible for applying the same logical change across multiple long-lived branches in one repository. These branches may represent environments, customers, releases, regions, deployment tracks, or other parallel variants of the same product.

This user is comfortable with Git, code review, and pull requests, but the task is still easy to get wrong because each target branch may intentionally differ from the others.

## Current Bottleneck

Branch propagation is repetitive and risk-prone. The maintainer must identify the source change, switch to each target branch, create a temporary branch from the correct base, apply the change, resolve branch-specific differences, run verification, push, and prepare the correct pull request URL.

The most important failure mode is accidentally chaining work from one prepared branch into the next. For example, a change intended for three independent target branches can become stacked if the second temporary branch starts from the first temporary branch instead of its own target branch. That creates confusing pull requests and can carry unrelated branch-specific differences into the wrong destination.

Other common sources of friction:

- Remote providers format compare and pull request URLs differently.
- Branch names often contain `/`, which must be encoded correctly in URLs.
- Some repositories have undocumented branch-specific notes that only the regular maintainer remembers.
- Temporary propagation branches can be left behind after review.
- Agents may assume a provider, branch list, or verification command without checking local evidence.

## Existing Starting Point

Before this project, the workflow existed as a private, organization-specific instruction file. It captured a valuable safety pattern: prepare one temporary source branch per target branch, and always start each temporary branch from its matching target branch.

However, the starting point was not reusable because it assumed:

- A fixed set of target branches.
- A specific Git hosting provider.
- A specific repository URL shape.
- Specific project verification commands.
- Private branch naming and operational context.

The project starts by preserving the safety pattern while removing the private assumptions.

## Baseline Process

The baseline should represent a reasonable way to perform the task before the new workflow exists. Use the same test scenarios for both the baseline and the final workflow.

Recommended baseline: one general-purpose prompt without the new workflow. The agent receives the repository and a short invocation-style task such as "propagate-env the current staged changes with the prefix `temp-TICKET-123-short-description`," but does not receive the portable workflow instructions, memory model, provider rules, or validation checklist.

The exact invocation syntax should stay tool-agnostic. One environment might use `@propagate-env`, another might use a slash command, another might use a named workflow picker, and another might rely on the user typing the workflow name in plain text. The important part is that the request names the workflow and includes the source change plus any run-specific options, such as a temporary branch prefix.

Alternative baseline if needed: manual branch propagation by a human maintainer following their usual process. This is useful for measuring time and number of steps, but harder to compare consistently across repeated cases.

Do not use the current private instruction file as the final public baseline unless the evaluation explicitly labels it as a pre-existing private artifact. It may be useful for internal comparison, but the public story should focus on the generic bottleneck and the improvement created by the portable workflow.

## Primary Evaluation Metric

Primary metric: successful independent branch propagations.

A scenario counts as successful when all intended target branches are prepared from their own correct base branch, contain the intended logical change, avoid unrelated branch-specific leakage, and produce a correct provider-specific PR or compare URL when pushing is available.

Suggested scoring:

```text
success rate = successful target branches / intended target branches
```

## Secondary Metrics

- Base-branch mistakes: count any temporary branch created from the wrong base.
- Correct PR URLs: count URLs with the correct provider format, target branch, source branch, and branch-name encoding.
- Human time: estimate or measure the time required from request to ready PR links.
- User-facing manual operations: count actions the user had to perform directly instead of delegating to the workflow.
- Cleanup safety: verify the workflow asks before deleting temporary branches and only targets branches matching the configured temp prefix.
- Memory usefulness: check whether stored target branches and branch notes are reused in later runs without the user repeating them.

## Test Scenarios

Document these scenarios first. Actual fixture repositories can be created later.

### Scenario 1: Clean Multi-Branch Propagation

A repository has three long-lived target branches, such as `release/dev`, `customer/dev`, and `main`. The source change applies cleanly to all three. The workflow should detect the provider from the remote, create one temp branch per target branch, apply the same logical change independently, run appropriate verification, push if possible, and produce correct PR URLs.

What this tests:

- Provider detection.
- Target branch memory.
- Independent base branch handling.
- Correct URL generation for branch names containing `/`.
- Final per-branch summary.

### Scenario 2: Unknown Provider Setup

A repository has a Git remote whose host is not obviously GitHub, GitLab, or Gitea. The workflow should avoid guessing. It should ask the user which provider to use, store that answer in memory, and continue using that provider for future PR URL generation.

What this tests:

- Safe uncertainty handling.
- Provider memory.
- Plain-English setup flow.
- Avoidance of false assumptions.

### Scenario 3: Branch-Specific Conflict

A repository has two or three target branches with intentional differences in the same file touched by the source change. The change applies cleanly to one branch but conflicts on another. The workflow should resolve or report the conflict while preserving each target branch's intentional differences. It must not use the successfully prepared temp branch as the base for the conflicted branch.

What this tests:

- Conflict handling.
- No chained branches.
- Preservation of branch-specific differences.
- Clear reporting when a branch is prepared, blocked, failed verification, or not pushed.
