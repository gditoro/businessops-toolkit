import fs from "fs-extra";
import YAML from "yaml";

export async function loadYamlFile(filePath: string): Promise<any> {
  const content = await fs.readFile(filePath, "utf8");
  return YAML.parse(content);
}
