#!/usr/bin/env node
import { execFileSync } from "node:child_process";

function usage() {
  console.error("Usage: detect-provider.mjs [remote-url]");
  console.error("If remote-url is omitted, the script reads git remote get-url origin.");
}

function readRemoteUrl() {
  const arg = process.argv[2];
  if (arg && arg !== "--help" && arg !== "-h") return arg;
  if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  }
  try {
    return execFileSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf8"
    }).trim();
  } catch {
    console.error("No remote URL provided and git remote get-url origin failed.");
    process.exit(2);
  }
}

function normalizeRepoPath(value) {
  return value
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/\.git$/, "");
}

function repoParts(repoPath) {
  const parts = repoPath.split("/").filter(Boolean);
  const repoName = parts.at(-1) || "";
  const namespaceParts = parts.slice(0, -1);
  return {
    namespace: namespaceParts.join("/"),
    owner: namespaceParts[0] || "",
    repoName
  };
}

function parseRemote(remoteUrl) {
  const scpLike = remoteUrl.match(/^(?:([^@]+)@)?([^:]+):(.+)$/);
  let parsed;
  if (scpLike && !remoteUrl.includes("://")) {
    parsed = {
      protocol: "ssh",
      host: scpLike[2].toLowerCase(),
      repoPath: normalizeRepoPath(scpLike[3])
    };
    return { ...parsed, ...repoParts(parsed.repoPath) };
  }

  try {
    const url = new URL(remoteUrl);
    parsed = {
      protocol: url.protocol.replace(":", ""),
      host: url.hostname.toLowerCase(),
      repoPath: normalizeRepoPath(url.pathname)
    };
    return { ...parsed, ...repoParts(parsed.repoPath) };
  } catch {
    return {
      protocol: "unknown",
      host: "",
      repoPath: "",
      namespace: "",
      owner: "",
      repoName: "",
      parseError: "unrecognized remote URL"
    };
  }
}

function detectProvider(host) {
  if (host === "github.com") {
    return { provider: "github", confidence: "exact" };
  }
  if (host === "gitlab.com") {
    return { provider: "gitlab", confidence: "exact" };
  }
  if (host.includes("gitlab")) {
    return { provider: "gitlab", confidence: "heuristic" };
  }
  if (host.includes("gitea")) {
    return { provider: "gitea", confidence: "heuristic" };
  }
  return { provider: "unknown", confidence: "unknown" };
}

const remoteUrl = readRemoteUrl();
const parsed = parseRemote(remoteUrl);
const detection = detectProvider(parsed.host);
const remoteName = process.argv[2] ? null : "origin";

process.stdout.write(
  JSON.stringify(
    {
      remoteUrl,
      remoteName,
      ...parsed,
      ...detection
    },
    null,
    2
  ) + "\n"
);
