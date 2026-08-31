#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function usage() {
  console.error(`Usage:
read-memory.mjs --memory <path> [--repo-key <key>]

Reads propagate-env memory. With --repo-key, returns that repo entry and whether it exists.`);
}

function readArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
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

const args = readArgs(process.argv);
const memoryPath = path.resolve(requireArg(args, "memory"));

if (!fs.existsSync(memoryPath)) {
  process.stdout.write(
    JSON.stringify(
      {
        memoryPath,
        exists: false,
        version: 1,
        repos: {},
        ...(args["repo-key"] ? { repoKey: args["repo-key"], found: false } : {})
      },
      null,
      2
    ) + "\n"
  );
  process.exit(0);
}

const memory = JSON.parse(fs.readFileSync(memoryPath, "utf8"));
if (args["repo-key"]) {
  const repoKey = args["repo-key"];
  process.stdout.write(
    JSON.stringify(
      {
        memoryPath,
        exists: true,
        repoKey,
        found: Boolean(memory.repos?.[repoKey]),
        value: memory.repos?.[repoKey] || null
      },
      null,
      2
    ) + "\n"
  );
} else {
  process.stdout.write(
    JSON.stringify(
      {
        memoryPath,
        exists: true,
        ...memory
      },
      null,
      2
    ) + "\n"
  );
}
