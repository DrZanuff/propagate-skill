#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function usage() {
  console.error("Usage: remove-memory.mjs --memory <path> --repo-key <key>");
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
const repoKey = requireArg(args, "repo-key");

if (!fs.existsSync(memoryPath)) {
  process.stdout.write(
    JSON.stringify(
      {
        memoryPath,
        repoKey,
        removed: false,
        reason: "memory file does not exist"
      },
      null,
      2
    ) + "\n"
  );
  process.exit(0);
}

const memory = JSON.parse(fs.readFileSync(memoryPath, "utf8"));
const existed = Boolean(memory.repos?.[repoKey]);
if (existed) {
  delete memory.repos[repoKey];
  fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2) + "\n");
}

process.stdout.write(
  JSON.stringify(
    {
      memoryPath,
      repoKey,
      removed: existed
    },
    null,
    2
  ) + "\n"
);
