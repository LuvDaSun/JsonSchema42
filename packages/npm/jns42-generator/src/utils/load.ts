import fs from "fs/promises";
import YAML from "yaml";

export async function loadYAML(location: string): Promise<unknown> {
  const hashIndex = location.indexOf("#");
  if (hashIndex >= 0) {
    location = location.substring(0, hashIndex);
  }

  const locationLower = location.toLowerCase();
  if (locationLower.startsWith("http://") || locationLower.startsWith("https://")) {
    const result = await fetch(location);
    const schemaRootNode = await result.json();

    return schemaRootNode;
  }

  const content = await fs.readFile(location, "utf-8");
  const schemaRootNode = YAML.parse(content);

  return schemaRootNode;
}
