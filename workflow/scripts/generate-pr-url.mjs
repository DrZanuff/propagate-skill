#!/usr/bin/env node
function usage() {
  console.error(
    "Usage: generate-pr-url.mjs --provider <github|gitlab|gitea> --host <host> --repo <repo-path> --target <branch> --source <branch>"
  );
}

function readArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key?.startsWith("--") || value === undefined) {
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

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, "");
}

const args = readArgs(process.argv);
const provider = requireArg(args, "provider");
const host = trimSlashes(requireArg(args, "host"));
const repo = trimSlashes(requireArg(args, "repo"));
const target = requireArg(args, "target");
const source = requireArg(args, "source");

const encodedTarget = encodeURIComponent(target);
const encodedSource = encodeURIComponent(source);

let url;
if (provider === "github") {
  url = `https://${host}/${repo}/compare/${encodedTarget}...${encodedSource}?expand=1`;
} else if (provider === "gitlab") {
  const params = new URLSearchParams({
    "merge_request[source_branch]": source,
    "merge_request[target_branch]": target
  });
  url = `https://${host}/${repo}/-/merge_requests/new?${params.toString()}`;
} else if (provider === "gitea") {
  url = `https://${host}/${repo}/compare/${encodedTarget}...${encodedSource}`;
} else {
  console.error(`Unsupported provider: ${provider}`);
  process.exit(2);
}

process.stdout.write(url + "\n");
