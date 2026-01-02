import fs from "fs";
import path from "node:path";

function exists(p: string) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

/**
 * Finds the repository root by walking up from startDir.
 * Heuristics:
 * - .git folder
 * - businessops folder
 * - README.md + cli folder
 */
export function findRepoRoot(startDir: string = process.cwd()): string {
  let current = path.resolve(startDir);

  while (true) {
    const gitDir = path.join(current, ".git");
    const businessopsDir = path.join(current, "businessops");
    const readme = path.join(current, "README.md");
    const cliDir = path.join(current, "cli");

    if (exists(gitDir) || exists(businessopsDir) || (exists(readme) && exists(cliDir))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      // reached filesystem root
      return startDir;
    }
    current = parent;
  }
}
