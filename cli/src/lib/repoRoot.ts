import path from "node:path";
import fs from "node:fs";

function exists(p: string) {
  try {
    fs.statSync(p);
    return true;
  } catch {
    return false;
  }
}

export function findRepoRoot(startDir: string = process.cwd()): string {
  let dir = startDir;

  for (let i = 0; i < 20; i++) {
    const hasGit = exists(path.join(dir, ".git"));
    const hasBusinessops = exists(path.join(dir, "businessops"));

    if (hasGit || hasBusinessops) return dir;

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return startDir; // fallback
}
