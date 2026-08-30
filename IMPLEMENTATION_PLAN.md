# Agent-Agnostic Propagate Branches Workflow Plan

## Goal

Turn the current organization-specific branch propagation instructions into a reusable, public, provider-agnostic agent workflow. A user should be able to invoke the workflow naturally, for example "propagate-env the current staged changes with prefix `temp-TICKET-123-short-description`" or "propagate-env clean up the temp branches from the PRs you just prepared." The workflow should guide any capable coding agent or automation tool to detect the repository provider, ask only necessary questions, maintain repo-specific memory, safely prepare pull requests across GitHub, GitLab, or Gitea, and record evidence of each iteration.

The public repository may include helper scripts, but they are implementation details for agents and automation tools. The user should not need to remember workflow commands; they should ask in plain English and let the workflow tell the agent what to do.

## Success Criteria

- [ ] Public repository created with no private organization details.
- [ ] Workflow can be used by different agents or tools without product-specific assumptions.
- [ ] User can trigger the workflow with plain-English requests.
- [ ] Agent can initialize repo-specific setup through conversation or documented setup steps.
- [ ] Workflow detects GitHub, GitLab, or Gitea from the Git remote.
- [ ] Workflow asks the user for the provider when detection is uncertain.
- [ ] Workflow memory stores target repos, target branches, and branch-specific notes.
- [ ] Propagation workflow creates independent `temp-` branches from each target branch.
- [ ] PR/compare URLs are generated correctly for each supported provider.
- [ ] After PRs are raised, the agent asks whether to remove temporary branches.
- [ ] Progress, failures, improvements, and evidence are recorded.

## Phase 0: Scope And Baseline

Purpose: define the problem clearly and create a fair comparison point.

Detailed notes: [phases/phase-0-scope-and-baseline.md](/mnt/extra/Git/propagate-skill/phases/phase-0-scope-and-baseline.md)

- [x] Define the intended user.
- [x] Describe the current bottleneck.
- [x] Document what existed before this project.
- [x] Choose the baseline process.
- [x] Define primary evaluation metric.
- [x] Define secondary metrics.
- [x] Document 2-3 test scenarios.
- [x] Include at least one challenging conflict scenario.

## Phase 1: Generic Workflow Design

Purpose: remove hardcoded organization-specific assumptions while keeping the useful workflow discipline.

Detailed notes: [phases/phase-1-generic-workflow-design.md](/mnt/extra/Git/propagate-skill/phases/phase-1-generic-workflow-design.md)

- [x] Name the generic workflow.
- [x] Define the portable instruction entrypoint, for example `AGENT.md`, `WORKFLOW.md`, or `propagate-branches.md`.
- [x] Write trigger guidance for generic branch propagation requests.
- [x] Replace hardcoded target branches with configured target branches.
- [x] Replace hardcoded provider URLs with provider-specific URL generation.
- [x] Keep the rule that every target branch starts from its own original base.
- [x] Keep required `temp-` branch naming.
- [x] Add instructions to read repo memory before acting.
- [x] Add instructions to record branch-specific notes and warnings.
- [x] Add instructions to ask about temp branch cleanup after PRs are raised.

## Phase 2: Repository Structure

Purpose: make the workflow public, portable, agent-friendly, and reproducible.

- [ ] Create public repo.
- [ ] Add portable workflow instructions at the root or under a clear `workflow/` folder.
- [ ] Add helper scripts only where deterministic behavior is useful.
- [ ] Add references under `workflow/references/`.
- [ ] Add memory schema or template.
- [ ] Add tests.
- [ ] Add README with usage and reproduction guide.
- [ ] Add improvement changelog.
- [ ] Document example plain-English requests.

Suggested structure:

```text
propagate-branches/
├── workflow/
│   ├── AGENT.md
│   ├── scripts/
│   │   ├── detect_provider.sh
│   │   ├── generate_pr_url.sh
│   │   ├── read_memory.sh
│   │   └── write_memory.sh
│   ├── references/
│   │   ├── providers.md
│   │   ├── memory.md
│   │   └── evaluation.md
│   └── memory/
│       └── schema.json
├── test/
├── README.md
├── IMPROVEMENT_CHANGELOG.md
└── IMPLEMENTATION_PLAN.md
```

## Phase 3: Plain-English Setup Flow

Purpose: let any repo configure the workflow through normal agent conversation, without making the user run setup commands manually.

- [ ] Define the setup trigger phrases in the portable workflow instructions.
- [ ] Verify current directory is inside a Git repository.
- [ ] Read `git remote -v`.
- [ ] Detect provider from remote URL.
- [ ] Ask provider when detection is uncertain.
- [ ] Ask for target branches when not already known.
- [ ] Ask for branch-specific notes when useful.
- [ ] Ask for temp branch prefix only if the default `temp-` is not acceptable.
- [ ] Write memory/config.
- [ ] Summarize setup in plain English.
- [ ] Record setup evidence in the progress log.

Example user requests:

- "propagate-env set up this repo for branch propagation."
- "propagate-env remember that this repo targets `release/dev`, `customer/dev`, and `main`."
- "propagate-env for `customer/dev`, remember to pay attention to customer-specific config."
- "propagate-env the current staged changes with prefix `temp-TICKET-123-short-description`."
- "propagate-env clean up the temp branches from the PRs you just created."

## Phase 4: Provider Detection And URL Generation

Purpose: support GitHub, GitLab, and Gitea safely through agent-executed helper logic.

- [ ] Parse SSH remotes.
- [ ] Parse HTTPS remotes.
- [ ] Normalize host, owner/group, repo, provider, and remote name.
- [ ] Detect GitHub.
- [ ] Detect GitLab.
- [ ] Detect Gitea when possible.
- [ ] Fall back to user selection when provider is unknown.
- [ ] URL-encode branch names containing `/`.
- [ ] Generate GitHub compare/PR URLs.
- [ ] Generate GitLab merge request URLs.
- [ ] Generate Gitea compare/PR URLs.
- [ ] Add tests for branch names with `/`.
- [ ] Add tests for nested GitLab groups.
- [ ] Document when the agent should ask instead of guessing.

## Phase 5: Memory Model

Purpose: preserve repo-specific knowledge without baking it into the public workflow.

- [ ] Decide memory location.
- [ ] Define JSON schema.
- [ ] Store repo path or remote identity.
- [ ] Store provider.
- [ ] Store remote name.
- [ ] Store target branches.
- [ ] Store temp branch prefix.
- [ ] Store branch-specific notes.
- [ ] Define plain-English memory inspection flow.
- [ ] Define plain-English memory update flow.
- [ ] Define plain-English stale memory removal flow.
- [ ] Add helper scripts only if they reduce error-prone JSON editing.

Example memory shape:

```json
{
  "repos": {
    "/path/to/repo": {
      "provider": "gitea",
      "remote": "origin",
      "targetBranches": ["release/dev", "customer/dev", "main"],
      "tempPrefix": "temp-",
      "branchNotes": {
        "release/dev": "Preserve release-only config.",
        "customer/dev": "Check customer-specific config."
      }
    }
  }
}
```

## Phase 6: Propagation Workflow

Purpose: generalize the current instructions into a safe branch propagation procedure.

- [ ] Trigger from workflow-named requests such as "propagate-env this commit" or "propagate-env the current staged changes with prefix `temp-TICKET-123-short-description`."
- [ ] Identify source changes from commit, commit range, or working tree.
- [ ] Inspect Git status before modifying anything.
- [ ] Read configured target branches from memory.
- [ ] Fetch refs when possible.
- [ ] For each target branch, create a separate temp branch from that target branch.
- [ ] Apply source change independently to each temp branch.
- [ ] Resolve conflicts while preserving target-branch differences.
- [ ] Commit adapted changes.
- [ ] Run verification appropriate to touched files.
- [ ] Push only branches that pass verification.
- [ ] Generate PR/compare URL only after push succeeds.
- [ ] Report push-pending URLs separately when push is unavailable.
- [ ] Ask whether to clean up temp branches after PRs are raised.
- [ ] Record per-branch evidence in the progress log.

## Phase 7: Cleanup Workflow

Purpose: make temporary branch cleanup safe, explicit, and plain-English driven.

- [ ] Trigger from user requests such as "remove the temp branches" or from the post-PR cleanup prompt.
- [ ] Agent lists matching local temp branches.
- [ ] Agent lists matching remote temp branches.
- [ ] Ask for confirmation before deletion.
- [ ] Support local-only cleanup.
- [ ] Support remote cleanup.
- [ ] Refuse to delete branches that do not match configured temp prefix.
- [ ] Record cleanup result in progress log.
- [ ] Keep the user interaction in plain English.

## Phase 8: Test Repositories

Purpose: prove the workflow works before testing against real public remotes.

- [ ] Create fixture repo for GitHub-style remote.
- [ ] Create fixture repo for GitLab-style remote.
- [ ] Create fixture repo for Gitea-style remote.
- [ ] Create fixture repo with unknown remote.
- [ ] Create target branches with intentional differences.
- [ ] Create clean cherry-pick scenario.
- [ ] Create conflict scenario.
- [ ] Create push-unavailable scenario.
- [ ] Create temp cleanup scenario.
- [ ] Save relevant agent/tool outputs as evidence.
- [ ] Test with plain-English prompts, not user-facing CLI commands.
- [ ] Run the same tests with at least two different agent/tool environments when possible.

## Phase 9: Evaluation And Evidence

Purpose: satisfy the hackathon requirement to show measured improvement.

- [ ] Create `IMPROVEMENT_CHANGELOG.md`.
- [ ] Add baseline entry.
- [ ] Add one entry for each meaningful iteration.
- [ ] Record what changed.
- [ ] Record why it changed.
- [ ] Record evidence.
- [ ] Record decision or learning.
- [ ] Keep failed experiments in the changelog.
- [ ] Produce final comparison table.
- [ ] Save representative agent trajectories.

Evaluation table:

```markdown
| Metric | Baseline | Agent Solution | Change |
| --- | ---: | ---: | ---: |
| Successful propagations | TBD | TBD | TBD |
| Base-branch mistakes | TBD | TBD | TBD |
| Correct PR URLs | TBD | TBD | TBD |
| Human time per task | TBD | TBD | TBD |
| User-facing manual operations | TBD | TBD | TBD |
```

## Phase 10: Public Release

Purpose: make the result usable from a clean environment.

- [ ] Remove private hostnames, branches, and company-specific assumptions.
- [ ] Confirm no credentials or private data are committed.
- [ ] Add license.
- [ ] Add usage instructions for humans and agents.
- [ ] Add example plain-English prompts.
- [ ] Add clean-environment reproduction guide.
- [ ] Create public GitHub repository.
- [ ] Push initial public version.
- [ ] Optionally add packaging later if a specific agent/tool ecosystem benefits from it.

## Progress Log

Use this table while working.

| Date | Phase | Change | Evidence | Result | Next Step |
| --- | --- | --- | --- | --- | --- |
| TBD | Baseline | Establish current process | TBD | TBD | TBD |

## Open Decisions

- [ ] Final workflow name.
- [ ] Memory location: repo-local, user-global, or both.
- [ ] Whether helper scripts should be shell, Node, Python, or mixed.
- [ ] Whether cleanup should delete remote branches by default after explicit user confirmation.
- [ ] Whether provider detection should use network/API checks or local Git remote parsing only.
- [ ] Whether the public repo should expose only portable instructions or also optional adapters for specific tools.

## Final Deliverables

- [ ] Public source repository.
- [ ] Generic agent workflow instructions.
- [ ] Agent/tool helper scripts.
- [ ] Reproduction guide.
- [ ] Improvement changelog.
- [ ] Evaluation results.
- [ ] Representative agent trajectories.
- [ ] Short demo video outline or recording.
