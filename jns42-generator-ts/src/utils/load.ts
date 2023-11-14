import fs from "fs/promises";

export async function loadJSON(url: URL): Promise<unknown> {
  switch (url.protocol) {
    case "http:":
    case "https:": {
      const result = await fetch(url);
      const schemaRootNode = await result.json();
      return schemaRootNode;
    }

    case "file:": {
      const content = await fs.readFile(url.pathname, "utf-8");
      const schemaRootNode = JSON.parse(content);

      return schemaRootNode;
    }

    default:
      throw new TypeError(`unknown protocol: ${url.protocol}`);
  }
}
