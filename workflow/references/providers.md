# Provider Reference

Use this reference when resolving Git hosting provider behavior for `propagate-env`.

## Provider Detection

Detect from local Git remote URLs first. Do not call provider web pages only to identify the host.

Common patterns:

- GitHub: `github.com:owner/repo.git`, `https://github.com/owner/repo.git`
- GitLab: `gitlab.com/group/project.git`, `https://gitlab.com/group/subgroup/project.git`
- Gitea: self-hosted domains often vary; treat hosts containing `gitea` as a heuristic and prefer memory or user confirmation for private/self-hosted domains.

If a host is not clearly identifiable, ask the user:

```text
I cannot confidently identify this Git host. Is this repository hosted on GitHub, GitLab, or Gitea?
```

Store the answer in repo memory when possible.

## Normalized Provider Object

Provider helpers should return a normalized object with these fields when possible:

- `remoteName`: selected Git remote, usually `origin`.
- `remoteUrl`: selected Git remote URL.
- `protocol`: parsed remote protocol, such as `ssh` or `https`.
- `host`: lowercase Git host.
- `repoPath`: namespace plus repository name, without leading slash or `.git`.
- `namespace`: everything before the repository name.
- `owner`: first namespace segment.
- `repoName`: repository name without `.git`.
- `provider`: `github`, `gitlab`, `gitea`, or `unknown`.
- `confidence`: `exact`, `heuristic`, or `unknown`.

For GitLab nested groups, keep the full namespace:

```text
https://gitlab.com/group/subgroup/project.git
namespace = group/subgroup
owner = group
repoName = project
repoPath = group/subgroup/project
```

## Branch Encoding

URL-encode branch names when building PR or compare URLs. This is especially important for branches containing `/`.

Examples:

```text
release/dev -> release%2Fdev
customer/dev -> customer%2Fdev
temp-TICKET-123-release-dev -> temp-TICKET-123-release-dev
```

## URL Formats

Use these formats for same-repository comparisons.

### GitHub

```text
https://<host>/<repo-path>/compare/<target>...<source>?expand=1
```

`<target>` and `<source>` must be URL-encoded branch names.

### GitLab

```text
https://<host>/<repo-path>/-/merge_requests/new?merge_request[source_branch]=<source>&merge_request[target_branch]=<target>
```

`<source>` and `<target>` must be query-encoded branch names.

### Gitea

```text
https://<host>/<repo-path>/compare/<target>...<source>
```

`<target>` and `<source>` must be URL-encoded branch names.

## Output Labels

Only label a URL as ready to open after the source branch exists on the remote.

Use a pending label when push failed, credentials are unavailable, or remote existence could not be verified.
