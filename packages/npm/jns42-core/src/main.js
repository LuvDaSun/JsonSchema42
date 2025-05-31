import fs from "node:fs/promises";
import { instantiate } from "../dist/jns42_core.component.js";

async function getCoreModule(path) {
  const bytes = await fs.readFile(new URL(`../dist/${path}`, import.meta.url));
  const module = await WebAssembly.compile(bytes);
  return module;
}

const instance = await instantiate(getCoreModule, {
  imports: {
    async "get-text"(location) {
      const locationLower = location.toLowerCase();
      if (locationLower.startsWith("http://") || locationLower.startsWith("https://")) {
        const result = await fetch(location);
        const text = await result.text();
        return text;
      }

      const text = await fs.readFile(location, "utf-8");
      return text;
    },
  },
});

export default instance;
