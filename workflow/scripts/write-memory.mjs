#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function usage() {
  console.error(`Usage:
write-memory.mjs --memory <path> --repo-key <key> --provider <provider> --remote <name> --target <branch> [--target <branch> ...] [options]

Options:
  --remote-url <url>
  --repo-root <path>
  --host <host>
  --repo-path <path>
  --namespace <namespace>
  --owner <owner>
  --repo-name <name>
  --temp-prefix <prefix>        Defaults to temp-
  --branch-note <branch=note>   May be repeated
  --verification-hint <hint>    May be repeated`);
}

function readArgs(argv) {
  const args = {
    target: [],
    "branch-note": [],
    "verification-hint": []
  };

  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith("--")) {
      usage();
      process.exit(2);
    }
    const name = key.slice(2);
    const value = argv[++i];
    if (value === undefined) {
      usage();
      process.exit(2);
    }
    if (Array.isArray(args[name])) {
      args[name].push(value);
    } else {
      args[name] = value;
    }
  }

  return args;
}

function requireArg(args, name) {
  const value = args[name];
  if (!value || (Array.isArray(value) && value.length === 0)) {
    console.error(`Missing required argument: --${name}`);
    usage();
    process.exit(2);
  }
  return value;
}

function readMemory(memoryPath) {
  if (!fs.existsSync(memoryPath)) {
    return { version: 1, repos: {} };
  }
  return JSON.parse(fs.readFileSync(memoryPath, "utf8"));
}

function parseBranchNotes(values) {
  const notes = {};
  for (const value of values) {
    const separator = value.indexOf("=");
    if (separator <= 0) {
      console.error(`Invalid --branch-note value: ${value}`);
      console.error("Expected format: branch=note");
      process.exit(2);
    }
    const branch = value.slice(0, separator);
    const note = value.slice(separator + 1);
    notes[branch] = note;
  }
  return notes;
}

const args = readArgs(process.argv);
const memoryPath = path.resolve(requireArg(args, "memory"));
const repoKey = requireArg(args, "repo-key");
const provider = requireArg(args, "provider");
const remote = requireArg(args, "remote");
const targets = requireArg(args, "target");
const tempPrefix = args["temp-prefix"] || "temp-";

if (!["github", "gitlab", "gitea", "unknown"].includes(provider)) {
  console.error(`Invalid provider: ${provider}`);
  process.exit(2);
}

if (!tempPrefix.startsWith("temp-")) {
  console.error("Temporary branch prefix must start with temp-.");
  process.exit(2);
}

const memory = readMemory(memoryPath);
memory.version = 1;
memory.repos ||= {};
const existing = memory.repos[repoKey] || {};
const branchNotes = {
  ...(existing.branchNotes || {}),
  ...parseBranchNotes(args["branch-note"])
};
const verificationHints = [
  ...new Set([...(existing.verificationHints || []), ...args["verification-hint"]])
];
memory.repos[repoKey] = {
  provider,
  remote,
  ...(args["remote-url"] || existing.remoteUrl
    ? { remoteUrl: args["remote-url"] || existing.remoteUrl }
    : {}),
  ...(args["repo-root"] || existing.repoRoot
    ? { repoRoot: args["repo-root"] || existing.repoRoot }
    : {}),
  ...(args.host || existing.host ? { host: args.host || existing.host } : {}),
  ...(args["repo-path"] || existing.repoPath
    ? { repoPath: args["repo-path"] || existing.repoPath }
    : {}),
  ...(args.namespace || existing.namespace
    ? { namespace: args.namespace || existing.namespace }
    : {}),
  ...(args.owner || existing.owner ? { owner: args.owner || existing.owner } : {}),
  ...(args["repo-name"] || existing.repoName
    ? { repoName: args["repo-name"] || existing.repoName }
    : {}),
  targetBranches: [...new Set(targets)],
  tempPrefix,
  branchNotes,
  verificationHints
};

fs.mkdirSync(path.dirname(memoryPath), { recursive: true });
fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2) + "\n");

process.stdout.write(
  JSON.stringify(
    {
      memoryPath,
      repoKey,
      saved: memory.repos[repoKey]
    },
    null,
    2
  ) + "\n"
);
