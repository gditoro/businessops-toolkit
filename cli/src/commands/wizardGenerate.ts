import path from "node:path";
import { execa } from "execa";

/**
 * Calls the generate command as a subprocess so wizard always uses the same codepath.
 * This keeps wizard stable even when generate evolves.
 */
export async function generateDocs(repoRoot: string, statePath: string) {
  // Run: node dist/cli.js generate --state <statePath>
  // During dev: use tsx to run src/cli.ts generate...
  // We’ll implement dev-time execution using `node` on the TS runtime environment.
  // The easiest robust approach is to call the current command through npm scripts.

  const cliDir = path.join(repoRoot, "cli");

  // Use `npm run dev -- generate` so it works during dev without building.
  await execa("npm", ["run", "dev", "--", "generate", "--state", path.relative(repoRoot, statePath)], {
    cwd: cliDir,
    stdio: "inherit"
  });
}
