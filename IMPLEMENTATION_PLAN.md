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

Detailed notes: [phases/phase-2-repository-structure.md](/mnt/extra/Git/propagate-skill/phases/phase-2-repository-structure.md)

- [ ] Create public repo. Deferred: repository remains private for now.
- [x] Add portable workflow instructions at the root or under a clear `workflow/` folder.
- [x] Add helper scripts only where deterministic behavior is useful.
- [x] Add references under `workflow/references/`.
- [x] Add memory schema or template.
- [x] Add tests.
- [x] Add README with usage and reproduction guide.
- [x] Add improvement changelog.
- [x] Document example plain-English requests.

Suggested structure:

```text
propagate-branches/
├── workflow/
│   ├── AGENT.md
│   ├── scripts/
│   │   ├── cleanup-temp-branches.mjs
│   │   ├── detect-provider.mjs
│   │   ├── generate-pr-url.mjs
│   │   ├── inspect-repo.mjs
│   │   ├── inspect-source.mjs
│   │   ├── plan-propagation.mjs
│   │   ├── read-memory.mjs
│   │   ├── remove-memory.mjs
│   │   └── write-memory.mjs
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

Detailed notes: [phases/phase-3-plain-english-setup-flow.md](/mnt/extra/Git/propagate-skill/phases/phase-3-plain-english-setup-flow.md)

- [x] Define the setup trigger phrases in the portable workflow instructions.
- [x] Verify current directory is inside a Git repository.
- [x] Read `git remote -v`.
- [x] Detect provider from remote URL.
- [x] Ask provider when detection is uncertain.
- [x] Ask for target branches when not already known.
- [x] Ask for branch-specific notes when useful.
- [x] Ask for temp branch prefix only if the default `temp-` is not acceptable.
- [x] Write memory/config.
- [x] Summarize setup in plain English.
- [x] Record setup evidence in the progress log.

Example user requests:

- "propagate-env set up this repo for branch propagation."
- "propagate-env remember that this repo targets `release/dev`, `customer/dev`, and `main`."
- "propagate-env for `customer/dev`, remember to pay attention to customer-specific config."
- "propagate-env the current staged changes with prefix `temp-TICKET-123-short-description`."
- "propagate-env clean up the temp branches from the PRs you just created."

## Phase 4: Provider Detection And URL Generation

Purpose: support GitHub, GitLab, and Gitea safely through agent-executed helper logic.

Detailed notes: [phases/phase-4-provider-detection-and-url-generation.md](/mnt/extra/Git/propagate-skill/phases/phase-4-provider-detection-and-url-generation.md)

- [x] Parse SSH remotes.
- [x] Parse HTTPS remotes.
- [x] Normalize host, owner/group, repo, provider, and remote name.
- [x] Detect GitHub.
- [x] Detect GitLab.
- [x] Detect Gitea when possible.
- [x] Fall back to user selection when provider is unknown.
- [x] URL-encode branch names containing `/`.
- [x] Generate GitHub compare/PR URLs.
- [x] Generate GitLab merge request URLs.
- [x] Generate Gitea compare/PR URLs.
- [x] Add tests for branch names with `/`.
- [x] Add tests for nested GitLab groups.
- [x] Document when the agent should ask instead of guessing.

## Phase 5: Memory Model

Purpose: preserve repo-specific knowledge without baking it into the public workflow.

Detailed notes: [phases/phase-5-memory-model.md](/mnt/extra/Git/propagate-skill/phases/phase-5-memory-model.md)

- [x] Decide memory location.
- [x] Define JSON schema.
- [x] Store repo path or remote identity.
- [x] Store provider.
- [x] Store remote name.
- [x] Store target branches.
- [x] Store temp branch prefix.
- [x] Store branch-specific notes.
- [x] Define plain-English memory inspection flow.
- [x] Define plain-English memory update flow.
- [x] Define plain-English stale memory removal flow.
- [x] Add helper scripts only if they reduce error-prone JSON editing.

Example memory shape:

```json
{
  "repos": {
    "https://github.com/example-org/example-repo": {
      "provider": "github",
      "remote": "origin",
      "remoteUrl": "git@github.com:example-org/example-repo.git",
      "repoRoot": "/path/to/example-repo",
      "host": "github.com",
      "repoPath": "example-org/example-repo",
      "namespace": "example-org",
      "owner": "example-org",
      "repoName": "example-repo",
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

Detailed notes: [phases/phase-6-propagation-workflow.md](/mnt/extra/Git/propagate-skill/phases/phase-6-propagation-workflow.md)

- [x] Trigger from workflow-named requests such as "propagate-env this commit" or "propagate-env the current staged changes with prefix `temp-TICKET-123-short-description`."
- [x] Identify source changes from commit, commit range, or working tree.
- [x] Inspect Git status before modifying anything.
- [x] Read configured target branches from memory.
- [x] Fetch refs when possible.
- [x] For each target branch, create a separate temp branch from that target branch.
- [x] Apply source change independently to each temp branch.
- [x] Resolve conflicts while preserving target-branch differences.
- [x] Commit adapted changes.
- [x] Run verification appropriate to touched files.
- [x] Push only branches that pass verification.
- [x] Generate PR/compare URL only after push succeeds.
- [x] Report push-pending URLs separately when push is unavailable.
- [x] Ask whether to clean up temp branches after PRs are raised.
- [x] Record per-branch evidence in the progress log.

## Phase 7: Cleanup Workflow

Purpose: make temporary branch cleanup safe, explicit, and plain-English driven.

Detailed notes: [phases/phase-7-cleanup-workflow.md](/mnt/extra/Git/propagate-skill/phases/phase-7-cleanup-workflow.md)

- [x] Trigger from user requests such as "remove the temp branches" or from the post-PR cleanup prompt.
- [x] Agent lists matching local temp branches.
- [x] Agent lists matching remote temp branches.
- [x] Ask for confirmation before deletion.
- [x] Support local-only cleanup.
- [x] Support remote cleanup.
- [x] Refuse to delete branches that do not match configured temp prefix.
- [x] Record cleanup result in progress log.
- [x] Keep the user interaction in plain English.

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
| 2026-08-30 | Phase 2 | Added repository structure, references, schema, scripts, tests, README, and changelog. | `node test/run-tests.mjs` | Passed: helper script tests report `All tests passed.` | Review Phase 2 content and decide when to make the repo public. |
| 2026-08-31 | Phase 3 | Added plain-English setup flow, repo inspection helper, memory writer helper, docs, and tests. | `node test/run-tests.mjs` | Passed: helper script tests report `All tests passed.` | Review setup flow and proceed to provider URL details. |
| 2026-08-31 | Phase 4 | Added normalized provider detection docs and expanded URL generation tests. | `node test/run-tests.mjs` | Passed: helper script tests report `All tests passed.` | Review provider behavior and proceed to the memory model. |
| 2026-08-31 | Phase 5 | Added memory model docs, schema identity fields, read/write/remove helpers, and memory tests. | `node test/run-tests.mjs` | Passed: helper script tests report `All tests passed.` | Review memory behavior and proceed to propagation workflow. |
| 2026-08-31 | Phase 6 | Added propagation workflow docs, source inspection helper, planning helper, and tests. | `node test/run-tests.mjs` | Passed: helper script tests report `All tests passed.` | Review propagation workflow and proceed to cleanup workflow. |
| 2026-08-31 | Phase 7 | Added cleanup workflow docs, dry-run-first cleanup helper, and local/remote cleanup tests. | `node test/run-tests.mjs` | Passed: helper script tests report `All tests passed.` | Review cleanup workflow and proceed to test repositories. |

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
