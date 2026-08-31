#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function usage() {
  process.stdout.write(`propagate-env

Install an agent-readable branch propagation workflow into a repository.

Usage:
  propagate-env install [--target <dir>] [--force] [--dry-run]
  propagate-env doctor [--target <dir>]
  propagate-env help

Daily use remains plain English inside your agent:
  propagate-env set up this repo for branch propagation.
  propagate-env commit abc1234 with prefix temp-TICKET-123-short-description.
  propagate-env clean up the temp branches from the PRs you just prepared.

The installer writes:
  .propagate-env/workflow/
  .propagate-env.json
  PROPAGATE_ENV.md
  AGENTS.md, only when one does not already exist
`);
}

function parseArgs(argv) {
  const parsed = {
    command: argv[2] || "help",
    target: process.cwd(),
    force: false,
    dryRun: false
  };

  for (let i = 3; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--force") {
      parsed.force = true;
    } else if (arg === "--dry-run") {
      parsed.dryRun = true;
    } else if (arg === "--target") {
      const value = argv[++i];
      if (!value) fail("Missing value for --target.");
      parsed.target = value;
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

function ensureDirectory(targetDir) {
  const resolved = path.resolve(targetDir);
  if (!fs.existsSync(resolved)) {
    fail(`Target directory does not exist: ${resolved}`);
  }
  if (!fs.statSync(resolved).isDirectory()) {
    fail(`Target is not a directory: ${resolved}`);
  }
  return resolved;
}

function writeFileIfNeeded(filePath, content, options, result) {
  if (fs.existsSync(filePath) && !options.force) {
    result.skipped.push(path.relative(options.target, filePath));
    return;
  }

  result.written.push(path.relative(options.target, filePath));
  if (options.dryRun) return;

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function copyWorkflow(sourceDir, targetDir, options, result) {
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyWorkflow(sourcePath, targetPath, options, result);
      continue;
    }

    if (fs.existsSync(targetPath) && !options.force) {
      result.skipped.push(path.relative(options.target, targetPath));
      continue;
    }

    result.written.push(path.relative(options.target, targetPath));
    if (options.dryRun) continue;

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
    fs.chmodSync(targetPath, fs.statSync(sourcePath).mode);
  }
}

function installedPointer() {
  return `# propagate-env

Agents: when the user invokes \`propagate-env\` or asks to apply the same logical Git change across configured long-lived branches, read \`.propagate-env/workflow/AGENT.md\` before acting.

The user interface is plain English. Helper scripts under \`.propagate-env/workflow/scripts/\` exist for deterministic support; they are not the primary interaction model.

Example requests:

- \`propagate-env set up this repo for branch propagation.\`
- \`propagate-env remember that this repo targets release/dev, customer/dev, and main.\`
- \`propagate-env commit abc1234 with prefix temp-TICKET-123-short-description.\`
- \`propagate-env clean up the temp branches from the PRs you just prepared.\`
`;
}

function agentsPointer() {
  return `# Agent Instructions

When the user invokes \`propagate-env\` or asks to apply the same logical Git change across configured long-lived branches, read \`PROPAGATE_ENV.md\` and follow the workflow it points to.
`;
}

function install(parsed) {
  const target = ensureDirectory(parsed.target);
  const options = { ...parsed, target };
  const result = {
    target,
    dryRun: parsed.dryRun,
    force: parsed.force,
    written: [],
    skipped: []
  };

  copyWorkflow(
    path.join(packageRoot, "workflow"),
    path.join(target, ".propagate-env", "workflow"),
    options,
    result
  );
  writeFileIfNeeded(path.join(target, "PROPAGATE_ENV.md"), installedPointer(), options, result);
  writeFileIfNeeded(path.join(target, "AGENTS.md"), agentsPointer(), options, result);
  writeFileIfNeeded(
    path.join(target, ".propagate-env.json"),
    JSON.stringify({ version: 1, repos: {} }, null, 2) + "\n",
    options,
    result
  );

  process.stdout.write(JSON.stringify(result, null, 2) + "\n");

  if (result.skipped.includes("AGENTS.md")) {
    process.stdout.write(
      "\nAGENTS.md already exists. Add this pointer if your agent reads AGENTS.md:\n\n" +
        agentsPointer()
    );
  }
}

function doctor(parsed) {
  const target = ensureDirectory(parsed.target);
  const scriptPath = path.join(packageRoot, "workflow", "scripts", "inspect-repo.mjs");
  const output = execFileSync(process.execPath, [scriptPath], {
    cwd: target,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  process.stdout.write(output);
}

const parsed = parseArgs(process.argv);

if (parsed.command === "help" || parsed.command === "--help" || parsed.command === "-h") {
  usage();
} else if (parsed.command === "install") {
  install(parsed);
} else if (parsed.command === "doctor") {
  doctor(parsed);
} else {
  fail(`Unknown command: ${parsed.command}`);
}
