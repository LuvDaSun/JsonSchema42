import fs from "node:fs";
import { instantiate } from "../dist/jns42_core.component.js";

async function getCoreModule(path) {
  const bytes = fs.readFileSync(new URL(`../dist/${path}`, import.meta.url));
  const module = await WebAssembly.compile(bytes);
  return module;
}

const instance = await instantiate(getCoreModule, {
  "jns42:core/imports": {
    fetchText(location) {
      const locationLower = location.toLowerCase();
      try {
        if (locationLower.startsWith("http://") || locationLower.startsWith("https://")) {
          throw "TODO";
          // const result = await fetch(location);
          // const text = await result.text();
          // return text;
        }
      } catch (error) {
        throw "http-error";
      }

      try {
        const text = fs.readFileSync(location, "utf-8");
        return text;
      } catch (error) {
        throw "io-error";
      }
    },
  },
});

export const documents = instance.documents;
export const models = instance.models;
export const naming = instance.naming;
export const utilities = instance.utilities;
