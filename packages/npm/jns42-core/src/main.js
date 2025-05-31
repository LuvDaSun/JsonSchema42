import fs from "node:fs/promises";
import { instantiate } from "../dist/jns42_core.component.js";

async function getCoreModule(path) {
  const bytes = await fs.readFile(new URL(`../dist/${path}`, import.meta.url));
  const module = await WebAssembly.compile(bytes);
  return module;
}

const instance = await instantiate(getCoreModule, {
  imports: {
    async "fetch-text"(location) {
      const locationLower = location.toLowerCase();
      try {
        if (locationLower.startsWith("http://") || locationLower.startsWith("https://")) {
          const result = await fetch(location);
          const text = await result.text();
          return { tag: "ok", val: text };
        }
      } catch (error) {
        return { tag: "err", val: "http-error" };
      }

      try {
        const text = await fs.readFile(location, "utf-8");
        return { tag: "ok", val: text };
      } catch (error) {
        return { tag: "err", val: "io-error" };
      }
    },
  },
});

export const documents = instance.documents;
export const models = instance.models;
export const naming = instance.naming;
export const schemaTransforms = instance.schemaTransforms;
export const utilities = instance.utilities;
