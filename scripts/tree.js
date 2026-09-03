// scripts/tree.js

import fs from "node:fs";
import path from "node:path";
import chokidar from "chokidar";

const ROOT = process.cwd();

const CONFIG = {
  output: "structure.txt",

  maxDepth: Infinity,

  debounce: 200,

  foldersFirst: true,

  showCounts: true,

  showTimestamp: true,

  useGitignore: true,

  ignore: [
    ".git",
    ".next",
    "node_modules",
    ".turbo",
    ".vercel",
    "dist",
    "build",
    "coverage",
    ".DS_Store",
    "scripts",
    ".dev",
    // "structure.txt",
  ],
};

const stats = {
  files: 0,
  folders: 0,
};

function resetStats() {
  stats.files = 0;
  stats.folders = 0;
}

function normalize(p) {
  return p.replace(/\\/g, "/");
}

function readGitignore() {
  if (!CONFIG.useGitignore) return [];

  const gitignore = path.join(ROOT, ".gitignore");

  if (!fs.existsSync(gitignore)) return [];

  return fs
    .readFileSync(gitignore, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"))
    .map((line) => line.replace(/\/$/, ""));
}

const ignorePatterns = [...CONFIG.ignore, ...readGitignore()];

function isIgnored(relativePath) {
  const p = normalize(relativePath);

  return ignorePatterns.some((pattern) => {
    const value = normalize(pattern);

    return (
      p === value ||
      p.startsWith(value + "/") ||
      p.includes("/" + value + "/") ||
      path.basename(p) === value
    );
  });
}

function scan(dir, depth = 0) {
  if (depth > CONFIG.maxDepth) return [];

  const relative = normalize(path.relative(ROOT, dir));

  if (relative && isIgnored(relative)) {
    return [];
  }

  let entries = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  entries = entries.filter((entry) => {
    const rel = normalize(path.relative(ROOT, path.join(dir, entry.name)));

    return !isIgnored(rel);
  });

  entries.sort((a, b) => {
    if (CONFIG.foldersFirst) {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
    }

    return a.name.localeCompare(b.name);
  });

  return entries.map((entry) => ({
    name: entry.name,
    path: path.join(dir, entry.name),
    isDirectory: entry.isDirectory(),
    children: entry.isDirectory()
      ? scan(path.join(dir, entry.name), depth + 1)
      : [],
  }));
}

function buildTree(nodes, prefix = "") {
  const lines = [];

  nodes.forEach((node, index) => {
    const last = index === nodes.length - 1;

    const branch = last ? "└── " : "├── ";

    lines.push(prefix + branch + node.name);

    if (node.isDirectory) {
      stats.folders++;

      lines.push(
        ...buildTree(node.children, prefix + (last ? "    " : "│   ")),
      );
    } else {
      stats.files++;
    }
  });

  return lines;
}
function generateTree() {
  try {
    resetStats();

    const tree = scan(ROOT);

    const lines = [".", ...buildTree(tree)];

    if (CONFIG.showCounts || CONFIG.showTimestamp) {
      lines.push("");
      lines.push("::::::::::::::::::::::::");

      if (CONFIG.showCounts) {
        lines.push(`📁 Folders : ${stats.folders}`);
        lines.push(`📄 Files   : ${stats.files}`);
      }

      if (CONFIG.showTimestamp) {
        lines.push(`⏰Generated: ${new Date().toLocaleString()}`);
      }
    }

    fs.writeFileSync(path.join(ROOT, CONFIG.output), lines.join("\n"), "utf8");

    console.clear();
    console.log("🌳 File tree updated");
    console.log(`📁 Folders : ${stats.folders}`);
    console.log(`📄 Files   : ${stats.files}`);
    console.log(`📝 Output  : ${CONFIG.output}`);
    console.log(`⏰ ${new Date().toLocaleTimeString()}`);
  } catch (err) {
    console.error(err);
  }
}

function watch() {
  let timer;

  const watcher = chokidar.watch(ROOT, {
    ignored: (file) => {
      const relative = normalize(path.relative(ROOT, file));

      return isIgnored(relative) || relative === CONFIG.output;
    },

    ignoreInitial: true,

    persistent: true,
  });

  watcher.on("all", () => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      generateTree();
    }, CONFIG.debounce);
  });

  console.log("👀 Watching for file changes...");
  console.log("Press Ctrl+C to stop.\n");

  process.on("SIGINT", async () => {
    await watcher.close();

    console.log("\n👋 Watcher stopped.");

    process.exit(0);
  });
}

generateTree();

if (process.argv.includes("--watch")) {
  watch();
}
