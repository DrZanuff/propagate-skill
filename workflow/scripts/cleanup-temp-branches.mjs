#!/usr/bin/env node
import { execFileSync } from "node:child_process";

function usage() {
  console.error(`Usage:
cleanup-temp-branches.mjs --prefix <temp-prefix> [options]

Options:
  --remote <name>             Defaults to origin
  --scope <local|remote|both> Defaults to both
  --execute                   Delete candidates. Omit for dry-run.
  --confirm-prefix <prefix>   Required with --execute and must match --prefix`);
}

function readArgs(argv) {
  const args = { execute: false };
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (key === "--execute") {
      args.execute = true;
      continue;
    }
    if (!key.startsWith("--")) {
      usage();
      process.exit(2);
    }
    const value = argv[++i];
    if (value === undefined) {
      usage();
      process.exit(2);
    }
    args[key.slice(2)] = value;
  }
  return args;
}

function requireArg(args, name) {
  const value = args[name];
  if (!value) {
    console.error(`Missing required argument: --${name}`);
    usage();
    process.exit(2);
  }
  return value;
}

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function tryGit(args) {
  try {
    return { ok: true, output: git(args) };
  } catch (error) {
    return {
      ok: false,
      output: "",
      error: String(error.stderr || error.message || error)
    };
  }
}

function lines(output) {
  return output
    .split("\n")
    .map((line) => line.trim().replace(/^\* /, ""))
    .filter(Boolean);
}

function listLocal(prefix) {
  return lines(tryGit(["branch", "--list", `${prefix}*`]).output).filter((branch) =>
    branch.startsWith(prefix)
  );
}

function listRemote(remote, prefix) {
  return lines(tryGit(["branch", "-r", "--list", `${remote}/${prefix}*`]).output)
    .map((branch) => branch.replace(new RegExp(`^${remote.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/`), ""))
    .filter((branch) => branch.startsWith(prefix));
}

function deleteLocal(branch) {
  const result = tryGit(["branch", "-d", branch]);
  if (result.ok) return { branch, deleted: true };
  return { branch, deleted: false, error: result.error };
}

function deleteRemote(remote, branch) {
  const result = tryGit(["push", remote, "--delete", branch]);
  if (result.ok) return { branch, deleted: true };
  return { branch, deleted: false, error: result.error };
}

const args = readArgs(process.argv);
const prefix = requireArg(args, "prefix");
const remote = args.remote || "origin";
const scope = args.scope || "both";

if (!prefix.startsWith("temp-")) {
  console.error("Cleanup prefix must start with temp-.");
  process.exit(2);
}

if (!["local", "remote", "both"].includes(scope)) {
  console.error(`Invalid scope: ${scope}`);
  usage();
  process.exit(2);
}

if (args.execute && args["confirm-prefix"] !== prefix) {
  console.error("--execute requires --confirm-prefix with the exact cleanup prefix.");
  process.exit(2);
}

const localCandidates = scope === "remote" ? [] : listLocal(prefix);
const remoteCandidates = scope === "local" ? [] : listRemote(remote, prefix);

const result = {
  prefix,
  remote,
  scope,
  dryRun: !args.execute,
  localCandidates,
  remoteCandidates,
  localDeleted: [],
  remoteDeleted: []
};

if (args.execute) {
  result.localDeleted = localCandidates.map(deleteLocal);
  result.remoteDeleted = remoteCandidates.map((branch) => deleteRemote(remote, branch));
}

process.stdout.write(JSON.stringify(result, null, 2) + "\n");
