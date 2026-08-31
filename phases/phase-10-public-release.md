# Phase 10: Public Release

Purpose: make the result usable from a clean environment.

## Release Shape

The project is prepared as an npm package named `propagate-env`.

The `npx` entrypoint is for installation and diagnostics only. Day-to-day branch propagation remains plain-English driven by the user's agent:

```text
propagate-env commit abc1234 with prefix temp-TICKET-123-short-description.
```

Installation command after npm publication:

```bash
npx propagate-env install
```

Installation command before npm publication, from GitHub:

```bash
npx github:DrZanuff/propagate-skill install
```

The installer writes:

- `.propagate-env/workflow/`
- `.propagate-env.json`
- `PROPAGATE_ENV.md`
- `AGENTS.md`, only when one does not already exist

## Checklist

- [x] Remove private hostnames, branches, and company-specific assumptions.
- [x] Confirm no credentials or private data are committed.
- [x] Add license.
- [x] Add usage instructions for humans and agents.
- [x] Add example plain-English prompts.
- [x] Add clean-environment reproduction guide.
- [x] Create public GitHub repository. Verified at `https://github.com/DrZanuff/propagate-skill`.
- [x] Push initial public version.
- [x] Optionally add packaging later if a specific agent/tool ecosystem benefits from it.

## Package Evidence

Package metadata:

- `package.json`
- `bin/propagate-env.mjs`
- `LICENSE`

Verification commands:

```bash
npm test
npm pack --dry-run
node bin/propagate-env.mjs --help
node bin/propagate-env.mjs install --target <empty-test-repo> --dry-run
npm exec --package . propagate-env -- install --target <empty-test-repo>
```

## Publication Steps

1. Confirm final repository visibility is public.
2. Confirm `npm view propagate-env` still returns 404 or otherwise choose another package name. It returned 404 on 2026-08-31.
3. Run `npm test`.
4. Run `npm pack --dry-run`.
5. Publish:

```bash
npm publish --access public
```

6. Test from a clean directory:

```bash
mkdir /tmp/propagate-env-install-check
cd /tmp/propagate-env-install-check
git init
npx propagate-env install
```

Expected result:

- Workflow files are installed.
- `.propagate-env.json` exists with an empty memory object.
- `PROPAGATE_ENV.md` points agents to the installed workflow.
- `AGENTS.md` is created only when no `AGENTS.md` existed already.

## Release Notes

Initial public release includes:

- Agent-agnostic propagation instructions.
- GitHub, GitLab, and Gitea provider URL helpers.
- Repo memory schema and read/write/remove helpers.
- Propagation planning helper.
- Cleanup helper with dry-run and exact-prefix confirmation.
- Deterministic tests.
- GitHub stress-test evidence and recording materials.
