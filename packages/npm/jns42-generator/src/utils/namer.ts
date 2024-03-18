import { toPascal } from "@jns42/jns42-core";

const startsWithLetterRe = /^[a-zA-Z]/u;
const nonIdentifierRe = /[^a-zA-Z0-9]/gu;

export interface PartInfo {
  value: string;
  index: number;
  cardinality: number;
  isHead: boolean;
}

// Sort Name-parts, last position first, then by ascending
// cardinality and then descending index. See test for example
export function comparePartInfos(a: PartInfo, b: PartInfo) {
  if (a.isHead > b.isHead) {
    return -1;
  }
  if (a.isHead < b.isHead) {
    return 1;
  }

  if (a.cardinality < b.cardinality) {
    return -1;
  }
  if (a.cardinality > b.cardinality) {
    return 1;
  }

  if (a.index < b.index) {
    return -1;
  }
  if (a.index > b.index) {
    return 1;
  }

  return 0;
}

/**
 * Namer unique name generator class
 */
export class Namer {
  private partCounters: Record<string, number> = {};
  private parts: Record<string, string[]> = {};
  private idCount = 0;

  /**
   * Namer unique name generator class
   */
  constructor(
    private readonly defaultName: string,
    private readonly maximumIterations: number,
  ) {
    //
  }

  public registerPath(id: string, path: string) {
    const nameParts = path
      // split the path
      .split("/")
      // decode the parts
      .map(decodeURIComponent)
      // remove all non identifiers
      .map((part) => part.replace(nonIdentifierRe, " "))
      .map((part) => part.trim())
      // camelcase the parts
      .map((part) => toPascal([part]))
      // remove all empty parts
      .filter((part) => part.length > 0);
    this.registerNameParts(id, nameParts);
  }

  private registerNameParts(id: string, nameParts: string[]) {
    this.idCount++;

    // count every unique name-part
    for (const namePart of nameParts) {
      this.partCounters[namePart] ??= 0;
      this.partCounters[namePart] += 1;
    }

    this.parts[id] = nameParts;
  }

  public getNames() {
    const names = Object.fromEntries(this.getNameEntries());
    return names;
  }

  private *getNameEntries(): Iterable<[string, string]> {
    const partInfos: Record<string, [string, PartInfo[]]> = {};

    for (const id in this.parts) {
      // For every path store the name-parts in a list with their count and
      // original position, and a flag that indicates if this was the last
      // name part.
      partInfos[id] = ["", []];

      const parts = this.parts[id];
      const cardinalities: Record<string, number> = {};

      for (let index = 0; index < parts.length; index++) {
        const part = parts[index];

        cardinalities[part] ??= 0;
        const cardinality = Math.min(this.idCount, this.partCounters[part] - cardinalities[part]);
        cardinalities[part] += cardinality;

        if (cardinality === this.idCount) {
          continue;
        }

        const partInfo = {
          cardinality,
          value: parts[index],
          index,
          isHead: index === parts.length - 1,
        };

        partInfos[id][1].push(partInfo);
      }

      // sort all name-parts
      partInfos[id][1].sort(comparePartInfos);
    }

    let names: Record<string, string[]> = {};
    let iterate = true;
    for (let iteration = 0; iterate && iteration < this.maximumIterations; iteration++) {
      names = {};
      iterate = false;

      for (const id in partInfos) {
        const name = partInfos[id][0];
        names[name] ??= [];
        names[name].push(id);
      }

      for (const name in names) {
        // if name is unique then we don't have to do anything
        if (names[name].length === 1) {
          continue;
        }

        iterate = true;

        // For every name that's is not unique, take the next name part
        // and append it.
        for (const id of names[name]) {
          const partInfo = partInfos[id][1].shift();
          if (partInfo == null) {
            continue;
          }
          partInfos[id][0] = partInfo.value + partInfos[id][0];
        }
      }

      for (const id in partInfos) {
        // if the name starts with a letter
        while (!startsWithLetterRe.test(partInfos[id][0])) {
          const partInfo = partInfos[id][1].shift();
          if (partInfo == null) {
            break;
          }

          partInfos[id][0] = partInfo.value + partInfos[id][0];
        }
      }

      for (const id in partInfos) {
        if (startsWithLetterRe.test(partInfos[id][0]) || partInfos[id][1].length > 0) {
          continue;
        }

        iterate = true;

        partInfos[id][0] = toPascal([this.defaultName]) + partInfos[id][0];
      }
    }

    for (const name in names) {
      if (names[name].length === 1) {
        const [id] = names[name];
        yield [id, name];
        continue;
      }

      // For every not unique name part, append a number to make it unique.
      for (let index = 0; index < names[name].length; index++) {
        const id = names[name][index];
        yield [id, `${name}${index + 1}`];
      }
    }
  }
}
