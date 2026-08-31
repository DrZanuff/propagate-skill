#!/usr/bin/env node
import { execFileSync } from "node:child_process";

function usage() {
  console.error(`Usage:
inspect-source.mjs --mode <staged|working|commit|commits> [--commit <sha> ...]

Modes:
  staged   Inspect staged changes with git diff --staged
  working  Inspect unstaged working tree changes with git diff
  commit   Inspect one commit
  commits  Inspect an ordered list of commits`);
}

function readArgs(argv) {
  const args = { commit: [] };
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
    if (name === "commit") {
      args.commit.push(value);
    } else {
      args[name] = value;
    }
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

function changedFilesForDiff(args) {
  const output = git(["diff", "--name-only", ...args]);
  return output ? output.split("\n").filter(Boolean) : [];
}

function statForDiff(args) {
  return git(["diff", "--stat", ...args]);
}

const args = readArgs(process.argv);
const mode = requireArg(args, "mode");

let result;
if (mode === "staged") {
  const files = changedFilesForDiff(["--staged"]);
  result = {
    mode,
    hasChanges: files.length > 0,
    changedFiles: files,
    stat: statForDiff(["--staged"])
  };
} else if (mode === "working") {
  const files = changedFilesForDiff([]);
  result = {
    mode,
    hasChanges: files.length > 0,
    changedFiles: files,
    stat: statForDiff([])
  };
} else if (mode === "commit") {
  if (args.commit.length !== 1) {
    console.error("Mode commit requires exactly one --commit value.");
    process.exit(2);
  }
  const commit = args.commit[0];
  const files = git(["diff-tree", "--no-commit-id", "--name-only", "-r", commit])
    .split("\n")
    .filter(Boolean);
  result = {
    mode,
    commits: [commit],
    hasChanges: files.length > 0,
    changedFiles: files,
    stat: git(["show", "--stat", "--oneline", "--no-renames", commit])
  };
} else if (mode === "commits") {
  if (args.commit.length === 0) {
    console.error("Mode commits requires at least one --commit value.");
    process.exit(2);
  }
  const fileSet = new Set();
  for (const commit of args.commit) {
    const files = git(["diff-tree", "--no-commit-id", "--name-only", "-r", commit])
      .split("\n")
      .filter(Boolean);
    files.forEach((file) => fileSet.add(file));
  }
  result = {
    mode,
    commits: args.commit,
    hasChanges: fileSet.size > 0,
    changedFiles: [...fileSet].sort(),
    stat: args.commit
      .map((commit) => git(["show", "--stat", "--oneline", "--no-renames", commit]))
      .join("\n\n")
  };
} else {
  console.error(`Unsupported mode: ${mode}`);
  usage();
  process.exit(2);
}

process.stdout.write(JSON.stringify(result, null, 2) + "\n");
