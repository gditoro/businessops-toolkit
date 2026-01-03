import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as yaml from "js-yaml";

export async function readYaml<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return yaml.load(raw) as T;
  } catch {
    return null;
  }
}

export async function writeYaml(filePath: string, data: any): Promise<void> {
  const raw = yaml.dump(data, { noRefs: true, lineWidth: 120 });

  // ✅ Ensure directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  await fs.writeFile(filePath, raw, "utf8");
}
