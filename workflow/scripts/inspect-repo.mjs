#!/usr/bin/env node
import { execFileSync } from "node:child_process";

function runGit(args, options = {}) {
  try {
    return {
      ok: true,
      value: execFileSync("git", args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        ...options
      }).trim()
    };
  } catch (error) {
    return {
      ok: false,
      value: "",
      error: String(error.stderr || error.message || error)
    };
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
  if (host === "github.com") return { provider: "github", confidence: "exact" };
  if (host === "gitlab.com") return { provider: "gitlab", confidence: "exact" };
  if (host.includes("gitlab")) return { provider: "gitlab", confidence: "heuristic" };
  if (host.includes("gitea")) return { provider: "gitea", confidence: "heuristic" };
  return { provider: "unknown", confidence: "unknown" };
}

function parseRemotes(remoteVerbose) {
  const remotes = new Map();
  for (const line of remoteVerbose.split("\n").filter(Boolean)) {
    const match = line.match(/^(\S+)\s+(\S+)\s+\((fetch|push)\)$/);
    if (!match) continue;
    const [, name, url, kind] = match;
    const entry = remotes.get(name) || { name };
    entry[kind] = url;
    remotes.set(name, entry);
  }
  return [...remotes.values()];
}

const root = runGit(["rev-parse", "--show-toplevel"]);
if (!root.ok) {
  process.stdout.write(
    JSON.stringify(
      {
        insideWorkTree: false,
        error: "Current directory is not inside a Git repository."
      },
      null,
      2
    ) + "\n"
  );
  process.exit(1);
}

const remoteVerboseResult = runGit(["remote", "-v"]);
const remoteVerbose = remoteVerboseResult.ok ? remoteVerboseResult.value : "";
const remotes = parseRemotes(remoteVerbose);
const selectedRemote = remotes.find((remote) => remote.name === "origin") || remotes[0] || null;
const selectedUrl = selectedRemote?.fetch || selectedRemote?.push || "";
const parsed = selectedUrl ? parseRemote(selectedUrl) : {};
const detection = detectProvider(parsed.host || "");

process.stdout.write(
  JSON.stringify(
    {
      insideWorkTree: true,
      root: root.value,
      remoteVerbose,
      remotes,
      selectedRemote: selectedRemote?.name || null,
      remoteUrl: selectedUrl || null,
      ...parsed,
      ...detection,
      needsProviderQuestion: detection.provider === "unknown"
    },
    null,
    2
  ) + "\n"
);
