#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function nodeScript(relativePath, args) {
  return execFileSync(
    process.execPath,
    [path.join(root, relativePath), ...args],
    { encoding: "utf8" }
  ).trim();
}

function nodeScriptIn(relativePath, args, cwd) {
  return execFileSync(
    process.execPath,
    [path.join(root, relativePath), ...args],
    { cwd, encoding: "utf8" }
  ).trim();
}

function nodeScriptInSilenced(relativePath, args, cwd) {
  return execFileSync(
    process.execPath,
    [path.join(root, relativePath), ...args],
    { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
  ).trim();
}

function run(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function detect(remoteUrl) {
  return JSON.parse(nodeScript("workflow/scripts/detect-provider.mjs", [remoteUrl]));
}

const githubSsh = detect("git@github.com:example-org/example-repo.git");
assert.deepEqual(
  {
    provider: githubSsh.provider,
    confidence: githubSsh.confidence,
    protocol: githubSsh.protocol,
    host: githubSsh.host,
    repoPath: githubSsh.repoPath,
    namespace: githubSsh.namespace,
    owner: githubSsh.owner,
    repoName: githubSsh.repoName
  },
  {
    provider: "github",
    confidence: "exact",
    protocol: "ssh",
    host: "github.com",
    repoPath: "example-org/example-repo",
    namespace: "example-org",
    owner: "example-org",
    repoName: "example-repo"
  }
);

const gitlabNested = detect("https://gitlab.com/group/subgroup/project.git");
assert.equal(gitlabNested.provider, "gitlab");
assert.equal(gitlabNested.protocol, "https");
assert.equal(gitlabNested.host, "gitlab.com");
assert.equal(gitlabNested.repoPath, "group/subgroup/project");
assert.equal(gitlabNested.namespace, "group/subgroup");
assert.equal(gitlabNested.owner, "group");
assert.equal(gitlabNested.repoName, "project");

const githubHttps = detect("https://github.com/example-org/example-repo.git");
assert.equal(githubHttps.provider, "github");
assert.equal(githubHttps.protocol, "https");
assert.equal(githubHttps.repoPath, "example-org/example-repo");

const binHelp = nodeScript("bin/propagate-env.mjs", ["--help"]);
assert.match(binHelp, /propagate-env/);
assert.match(binHelp, /propagate-env install/);
assert.match(binHelp, /Daily use remains plain English/);

const installDir = fs.mkdtempSync(path.join(os.tmpdir(), "propagate-env-install-"));
const installDryRun = JSON.parse(
  nodeScript("bin/propagate-env.mjs", ["install", "--target", installDir, "--dry-run"])
);
assert.equal(installDryRun.dryRun, true);
assert.equal(fs.existsSync(path.join(installDir, "PROPAGATE_ENV.md")), false);
assert.equal(installDryRun.written.includes("PROPAGATE_ENV.md"), true);

const installResult = JSON.parse(
  nodeScript("bin/propagate-env.mjs", ["install", "--target", installDir])
);
assert.equal(installResult.dryRun, false);
assert.equal(fs.existsSync(path.join(installDir, "PROPAGATE_ENV.md")), true);
assert.equal(fs.existsSync(path.join(installDir, "AGENTS.md")), true);
assert.equal(fs.existsSync(path.join(installDir, ".propagate-env.json")), true);
assert.equal(
  fs.existsSync(path.join(installDir, ".propagate-env", "workflow", "AGENT.md")),
  true
);
assert.deepEqual(
  JSON.parse(fs.readFileSync(path.join(installDir, ".propagate-env.json"), "utf8")),
  { version: 1, repos: {} }
);

const reinstallResultRaw = nodeScript("bin/propagate-env.mjs", ["install", "--target", installDir]);
const reinstallResult = JSON.parse(reinstallResultRaw.slice(0, reinstallResultRaw.indexOf("\n\n")));
assert.equal(reinstallResult.skipped.includes("AGENTS.md"), true);
assert.match(reinstallResultRaw, /AGENTS.md already exists/);

assert.equal(
  detect("ssh://git@gitea.example.com/team/project.git").provider,
  "gitea"
);
assert.equal(
  detect("ssh://git@git.example.internal/team/project.git").provider,
  "unknown"
);

assert.equal(
  nodeScript("workflow/scripts/generate-pr-url.mjs", [
    "--provider",
    "github",
    "--host",
    "github.com",
    "--repo",
    "example-org/example-repo",
    "--target",
    "release/dev",
    "--source",
    "temp-TICKET-123-feature/auth-timeout"
  ]),
  "https://github.com/example-org/example-repo/compare/release%2Fdev...temp-TICKET-123-feature%2Fauth-timeout?expand=1"
);

assert.equal(
  nodeScript("workflow/scripts/generate-pr-url.mjs", [
    "--provider",
    "gitlab",
    "--host",
    "gitlab.com",
    "--repo",
    "group/subgroup/project",
    "--target",
    "release/dev",
    "--source",
    "temp-TICKET-123-release-dev-fix"
  ]),
  "https://gitlab.com/group/subgroup/project/-/merge_requests/new?merge_request%5Bsource_branch%5D=temp-TICKET-123-release-dev-fix&merge_request%5Btarget_branch%5D=release%2Fdev"
);

assert.equal(
  nodeScript("workflow/scripts/generate-pr-url.mjs", [
    "--provider",
    "gitea",
    "--host",
    "gitea.example.com",
    "--repo",
    "team/project",
    "--target",
    "customer/dev",
    "--source",
    "temp-TICKET-123-customer-dev-fix"
  ]),
  "https://gitea.example.com/team/project/compare/customer%2Fdev...temp-TICKET-123-customer-dev-fix"
);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "propagate-env-test-"));
const memoryPath = path.join(tmpDir, "memory.json");
const writeResult = JSON.parse(
  nodeScript("workflow/scripts/write-memory.mjs", [
    "--memory",
    memoryPath,
    "--repo-key",
    "https://github.com/example-org/example-repo",
    "--provider",
    "github",
    "--remote",
    "origin",
    "--remote-url",
    "git@github.com:example-org/example-repo.git",
    "--repo-root",
    "/tmp/example-repo",
    "--host",
    "github.com",
    "--repo-path",
    "example-org/example-repo",
    "--namespace",
    "example-org",
    "--owner",
    "example-org",
    "--repo-name",
    "example-repo",
    "--target",
    "release/dev",
    "--target",
    "customer/dev",
    "--target",
    "main",
    "--temp-prefix",
    "temp-TICKET-123-",
    "--branch-note",
    "customer/dev=Preserve customer-specific config.",
    "--verification-hint",
    "Use package scripts when package.json changes."
  ])
);
const memory = JSON.parse(fs.readFileSync(memoryPath, "utf8"));
assert.equal(writeResult.repoKey, "https://github.com/example-org/example-repo");
assert.deepEqual(memory.repos["https://github.com/example-org/example-repo"], {
  provider: "github",
  remote: "origin",
  remoteUrl: "git@github.com:example-org/example-repo.git",
  repoRoot: "/tmp/example-repo",
  host: "github.com",
  repoPath: "example-org/example-repo",
  namespace: "example-org",
  owner: "example-org",
  repoName: "example-repo",
  targetBranches: ["release/dev", "customer/dev", "main"],
  tempPrefix: "temp-TICKET-123-",
  branchNotes: {
    "customer/dev": "Preserve customer-specific config."
  },
  verificationHints: ["Use package scripts when package.json changes."]
});

nodeScript("workflow/scripts/write-memory.mjs", [
  "--memory",
  memoryPath,
  "--repo-key",
  "https://github.com/example-org/example-repo",
  "--provider",
  "github",
  "--remote",
  "origin",
  "--target",
  "release/dev",
  "--target",
  "main",
  "--temp-prefix",
  "temp-TICKET-456-",
  "--branch-note",
  "release/dev=Preserve release-only config.",
  "--verification-hint",
  "Run focused tests for changed files."
]);

const updatedMemory = JSON.parse(fs.readFileSync(memoryPath, "utf8"));
assert.deepEqual(updatedMemory.repos["https://github.com/example-org/example-repo"], {
  provider: "github",
  remote: "origin",
  remoteUrl: "git@github.com:example-org/example-repo.git",
  repoRoot: "/tmp/example-repo",
  host: "github.com",
  repoPath: "example-org/example-repo",
  namespace: "example-org",
  owner: "example-org",
  repoName: "example-repo",
  targetBranches: ["release/dev", "main"],
  tempPrefix: "temp-TICKET-456-",
  branchNotes: {
    "customer/dev": "Preserve customer-specific config.",
    "release/dev": "Preserve release-only config."
  },
  verificationHints: [
    "Use package scripts when package.json changes.",
    "Run focused tests for changed files."
  ]
});

const readOne = JSON.parse(
  nodeScript("workflow/scripts/read-memory.mjs", [
    "--memory",
    memoryPath,
    "--repo-key",
    "https://github.com/example-org/example-repo"
  ])
);
assert.equal(readOne.exists, true);
assert.equal(readOne.found, true);
assert.equal(readOne.value.tempPrefix, "temp-TICKET-456-");

const readMissing = JSON.parse(
  nodeScript("workflow/scripts/read-memory.mjs", [
    "--memory",
    path.join(tmpDir, "missing.json"),
    "--repo-key",
    "https://github.com/example-org/example-repo"
  ])
);
assert.equal(readMissing.exists, false);
assert.equal(readMissing.found, false);

const removeResult = JSON.parse(
  nodeScript("workflow/scripts/remove-memory.mjs", [
    "--memory",
    memoryPath,
    "--repo-key",
    "https://github.com/example-org/example-repo"
  ])
);
assert.equal(removeResult.removed, true);
const afterRemove = JSON.parse(fs.readFileSync(memoryPath, "utf8"));
assert.equal(afterRemove.repos["https://github.com/example-org/example-repo"], undefined);

const plan = JSON.parse(
  nodeScript("workflow/scripts/plan-propagation.mjs", [
    "--provider",
    "github",
    "--host",
    "github.com",
    "--repo",
    "example-org/example-repo",
    "--remote",
    "origin",
    "--target",
    "release/dev",
    "--target",
    "customer/dev",
    "--prefix",
    "temp-TICKET-123-",
    "--change-name",
    "Fix Auth Timeout"
  ])
);
assert.deepEqual(
  plan.plan.map((item) => ({
    target: item.target,
    baseRef: item.baseRef,
    tempBranch: item.tempBranch,
    pendingUrl: item.pendingUrl,
    pushCommand: item.pushCommand
  })),
  [
    {
      target: "release/dev",
      baseRef: "origin/release/dev",
      tempBranch: "temp-TICKET-123-release-dev-fix-auth-timeout",
      pendingUrl:
        "https://github.com/example-org/example-repo/compare/release%2Fdev...temp-TICKET-123-release-dev-fix-auth-timeout?expand=1",
      pushCommand: "git push -u origin temp-TICKET-123-release-dev-fix-auth-timeout"
    },
    {
      target: "customer/dev",
      baseRef: "origin/customer/dev",
      tempBranch: "temp-TICKET-123-customer-dev-fix-auth-timeout",
      pendingUrl:
        "https://github.com/example-org/example-repo/compare/customer%2Fdev...temp-TICKET-123-customer-dev-fix-auth-timeout?expand=1",
      pushCommand: "git push -u origin temp-TICKET-123-customer-dev-fix-auth-timeout"
    }
  ]
);

const sourceRepo = fs.mkdtempSync(path.join(os.tmpdir(), "propagate-env-source-"));
run("git", ["init"], sourceRepo);
run("git", ["config", "user.email", "test@example.com"], sourceRepo);
run("git", ["config", "user.name", "Test User"], sourceRepo);
fs.writeFileSync(path.join(sourceRepo, "README.md"), "initial\n");
run("git", ["add", "README.md"], sourceRepo);
run("git", ["commit", "-m", "Initial commit"], sourceRepo);
fs.writeFileSync(path.join(sourceRepo, "README.md"), "initial\nstaged\n");
run("git", ["add", "README.md"], sourceRepo);
const stagedSource = JSON.parse(
  nodeScriptIn("workflow/scripts/inspect-source.mjs", ["--mode", "staged"], sourceRepo)
);
assert.equal(stagedSource.mode, "staged");
assert.equal(stagedSource.hasChanges, true);
assert.deepEqual(stagedSource.changedFiles, ["README.md"]);
run("git", ["commit", "-m", "Add staged line"], sourceRepo);
const commitSha = run("git", ["rev-parse", "HEAD"], sourceRepo);
const commitSource = JSON.parse(
  nodeScriptIn(
    "workflow/scripts/inspect-source.mjs",
    ["--mode", "commit", "--commit", commitSha],
    sourceRepo
  )
);
assert.equal(commitSource.mode, "commit");
assert.deepEqual(commitSource.commits, [commitSha]);
assert.deepEqual(commitSource.changedFiles, ["README.md"]);

const cleanupRemote = fs.mkdtempSync(path.join(os.tmpdir(), "propagate-env-remote-"));
const cleanupRepo = fs.mkdtempSync(path.join(os.tmpdir(), "propagate-env-cleanup-"));
run("git", ["init", "--bare"], cleanupRemote);
run("git", ["init"], cleanupRepo);
run("git", ["config", "user.email", "test@example.com"], cleanupRepo);
run("git", ["config", "user.name", "Test User"], cleanupRepo);
fs.writeFileSync(path.join(cleanupRepo, "README.md"), "cleanup\n");
run("git", ["add", "README.md"], cleanupRepo);
run("git", ["commit", "-m", "Initial cleanup commit"], cleanupRepo);
run("git", ["branch", "-M", "main"], cleanupRepo);
run("git", ["branch", "temp-TICKET-999-release"], cleanupRepo);
run("git", ["branch", "temp-TICKET-999-customer"], cleanupRepo);
run("git", ["branch", "feature/temp-TICKET-999-ignore"], cleanupRepo);
run("git", ["remote", "add", "origin", cleanupRemote], cleanupRepo);
run("git", ["push", "-u", "origin", "main"], cleanupRepo);
run("git", ["push", "origin", "temp-TICKET-999-release"], cleanupRepo);
run("git", ["push", "origin", "temp-TICKET-999-customer"], cleanupRepo);

const cleanupDryRun = JSON.parse(
  nodeScriptIn(
    "workflow/scripts/cleanup-temp-branches.mjs",
    ["--prefix", "temp-TICKET-999-", "--scope", "both"],
    cleanupRepo
  )
);
assert.equal(cleanupDryRun.dryRun, true);
assert.deepEqual(cleanupDryRun.localCandidates.sort(), [
  "temp-TICKET-999-customer",
  "temp-TICKET-999-release"
]);
assert.deepEqual(cleanupDryRun.remoteCandidates.sort(), [
  "temp-TICKET-999-customer",
  "temp-TICKET-999-release"
]);

assert.throws(() =>
  nodeScriptInSilenced(
    "workflow/scripts/cleanup-temp-branches.mjs",
    ["--prefix", "feature/", "--scope", "local"],
    cleanupRepo
  )
);

const cleanupLocal = JSON.parse(
  nodeScriptIn(
    "workflow/scripts/cleanup-temp-branches.mjs",
    [
      "--prefix",
      "temp-TICKET-999-",
      "--scope",
      "local",
      "--execute",
      "--confirm-prefix",
      "temp-TICKET-999-"
    ],
    cleanupRepo
  )
);
assert.equal(cleanupLocal.dryRun, false);
assert.equal(cleanupLocal.localDeleted.every((item) => item.deleted), true);
assert.equal(run("git", ["branch", "--list", "temp-TICKET-999-*"], cleanupRepo), "");

const cleanupRemoteResult = JSON.parse(
  nodeScriptIn(
    "workflow/scripts/cleanup-temp-branches.mjs",
    [
      "--prefix",
      "temp-TICKET-999-",
      "--scope",
      "remote",
      "--execute",
      "--confirm-prefix",
      "temp-TICKET-999-"
    ],
    cleanupRepo
  )
);
assert.equal(cleanupRemoteResult.remoteDeleted.every((item) => item.deleted), true);
assert.equal(
  run("git", ["ls-remote", "--heads", "origin", "temp-TICKET-999-*"], cleanupRepo),
  ""
);

const inspectResult = JSON.parse(
  nodeScript("workflow/scripts/inspect-repo.mjs", [])
);
assert.equal(inspectResult.insideWorkTree, true);
assert.equal(typeof inspectResult.remoteVerbose, "string");
assert.equal(typeof inspectResult.needsProviderQuestion, "boolean");

const doctorResult = JSON.parse(
  nodeScript("bin/propagate-env.mjs", ["doctor", "--target", root])
);
assert.equal(doctorResult.insideWorkTree, true);
assert.equal(typeof doctorResult.needsProviderQuestion, "boolean");

console.log("All tests passed.");
