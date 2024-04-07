import fs from "fs/promises";
import { CString } from "../imports/index.js";

export async function fetchFile(locationPointer: number) {
  using locationForeign = new CString(locationPointer);
  const location = locationForeign.toString();

  const locationLower = location.toLowerCase();
  let data: string | undefined;
  if (locationLower.startsWith("http://") || locationLower.startsWith("https://")) {
    const result = await fetch(location);
    data = await result.text();
  } else {
    data = await fs.readFile(location, "utf-8");
  }

  using dataForeign = CString.fromString(data);
  dataForeign.abandon();

  return dataForeign.pointer;
}
