#!/usr/bin/env node
function usage() {
  console.error(`Usage:
plan-propagation.mjs --provider <github|gitlab|gitea> --host <host> --repo <repo-path> --target <branch> [--target <branch> ...] [options]

Options:
  --remote <name>          Defaults to origin
  --prefix <prefix>        Defaults to temp-
  --change-name <name>     Optional short change slug`);
}

function readArgs(argv) {
  const args = { target: [] };
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
    if (name === "target") {
      args.target.push(value);
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

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, "");
}

function sanitizeBranchPart(value) {
  return value
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function makeTempBranch(prefix, target, changeName) {
  const cleanPrefix = prefix.endsWith("-") ? prefix : `${prefix}-`;
  const parts = [sanitizeBranchPart(target)];
  if (changeName) parts.push(sanitizeBranchPart(changeName));
  return `${cleanPrefix}${parts.filter(Boolean).join("-")}`;
}

function prUrl(provider, host, repo, target, source) {
  const encodedTarget = encodeURIComponent(target);
  const encodedSource = encodeURIComponent(source);
  if (provider === "github") {
    return `https://${host}/${repo}/compare/${encodedTarget}...${encodedSource}?expand=1`;
  }
  if (provider === "gitlab") {
    const params = new URLSearchParams({
      "merge_request[source_branch]": source,
      "merge_request[target_branch]": target
    });
    return `https://${host}/${repo}/-/merge_requests/new?${params.toString()}`;
  }
  if (provider === "gitea") {
    return `https://${host}/${repo}/compare/${encodedTarget}...${encodedSource}`;
  }
  throw new Error(`Unsupported provider: ${provider}`);
}

const args = readArgs(process.argv);
const provider = requireArg(args, "provider");
const host = trimSlashes(requireArg(args, "host"));
const repo = trimSlashes(requireArg(args, "repo"));
const targets = requireArg(args, "target");
const remote = args.remote || "origin";
const prefix = args.prefix || "temp-";
const changeName = args["change-name"] || "";

if (!["github", "gitlab", "gitea"].includes(provider)) {
  console.error(`Unsupported provider: ${provider}`);
  process.exit(2);
}

if (!prefix.startsWith("temp-")) {
  console.error("Temporary branch prefix must start with temp-.");
  process.exit(2);
}

const plan = targets.map((target) => {
  const tempBranch = makeTempBranch(prefix, target, changeName);
  return {
    target,
    baseRef: `${remote}/${target}`,
    tempBranch,
    pendingUrl: prUrl(provider, host, repo, target, tempBranch),
    pushCommand: `git push -u ${remote} ${tempBranch}`
  };
});

process.stdout.write(
  JSON.stringify(
    {
      provider,
      host,
      repo,
      remote,
      prefix,
      changeName,
      plan
    },
    null,
    2
  ) + "\n"
);
