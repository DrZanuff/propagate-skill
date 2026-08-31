# Phase 4: Provider Detection And URL Generation

Purpose: support GitHub, GitLab, and Gitea safely through agent-executed helper logic.

## Provider Model

Provider detection should produce a normalized object an agent can use without re-parsing the remote:

```json
{
  "remoteName": "origin",
  "remoteUrl": "git@github.com:example-org/example-repo.git",
  "protocol": "ssh",
  "host": "github.com",
  "repoPath": "example-org/example-repo",
  "namespace": "example-org",
  "owner": "example-org",
  "repoName": "example-repo",
  "provider": "github",
  "confidence": "exact"
}
```

`namespace` is everything before the repository name. For nested GitLab groups, keep the full namespace, such as `group/subgroup`.

## Detection Rules

- Parse local Git remotes before asking the user.
- Prefer `origin` when multiple remotes exist; otherwise use the first remote.
- Detect `github.com` as GitHub with exact confidence.
- Detect `gitlab.com` as GitLab with exact confidence.
- Detect hosts containing `gitlab` as GitLab with heuristic confidence.
- Detect hosts containing `gitea` as Gitea with heuristic confidence.
- Treat other hosts as unknown.

When the provider is unknown, ask:

```text
I cannot confidently identify this Git host. Is this repository hosted on GitHub, GitLab, or Gitea?
```

Store the answer in repo memory when possible.

## URL Generation Rules

Always generate URLs from normalized provider, host, repo path, target branch, and source branch.

Encode branch names with `encodeURIComponent`. This protects branches such as `release/dev`, `customer/dev`, or `feature/auth-timeout`.

Provider formats:

- GitHub: `https://<host>/<repo-path>/compare/<target>...<source>?expand=1`
- GitLab: `https://<host>/<repo-path>/-/merge_requests/new?merge_request[source_branch]=<source>&merge_request[target_branch]=<target>`
- Gitea: `https://<host>/<repo-path>/compare/<target>...<source>`

Only label URLs as ready after the source branch exists on the remote. If push failed or remote existence is uncertain, label them as pending.

## Helper Scripts

- `workflow/scripts/detect-provider.mjs`: parse one remote URL or `origin`, normalize repo identity, and detect provider.
- `workflow/scripts/inspect-repo.mjs`: inspect the current Git repo, collect `git remote -v`, select a remote, normalize it, and report whether the agent should ask the provider question.
- `workflow/scripts/generate-pr-url.mjs`: generate provider-specific PR or compare URLs.

These helpers are agent-executed implementation details.

## Phase 4 Review Checklist

- [x] SSH remotes are parsed.
- [x] HTTPS remotes are parsed.
- [x] Host, namespace, owner, repo name, repo path, provider, and remote name are normalized.
- [x] GitHub detection exists.
- [x] GitLab detection exists.
- [x] Gitea detection exists when the host gives enough signal.
- [x] Unknown providers require user selection.
- [x] Branch names containing `/` are URL-encoded.
- [x] GitHub compare URLs are generated.
- [x] GitLab merge request URLs are generated.
- [x] Gitea compare URLs are generated.
- [x] Tests cover branch names with `/`.
- [x] Tests cover nested GitLab groups.
- [x] Ask-vs-guess behavior is documented.
