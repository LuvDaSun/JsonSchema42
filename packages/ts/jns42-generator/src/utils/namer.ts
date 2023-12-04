import camelcase from "camelcase";

const startsWithLetterRe = /^[a-zA-Z]/u;
const nonIdentifierRe = /[^a-zA-Z0-9]/gu;
const maximumIterations = 5;

/*
First, split the paths in name-parts.

Then count every name-part by it's value.

For every path store the name-parts in a list with their count and original position, and a flag that indicates if this was the last name part.

Now sort all name-parts, last position first, then by ascending count and then ascending position.

Take the first name-part in the list, this will be the name.

Count the names by their value.

For every name that's is not unique, so has a count greater than 1, take the next name part and append it.

Continue until there are only unique names left, or 5 name parts are used.

For every not unique name part, append a number to make it unique.
*/

export interface PartInfo {
  value: string;
  isLast: boolean;
  index: number;
  cardinality: number;
}

// Sort Name-parts, last position first, then by ascending
// cardinality and then descending index. See test for example
export function comparePartInfos(a: PartInfo, b: PartInfo) {
  if (a.isLast > b.isLast) {
    return -1;
  }
  if (a.isLast < b.isLast) {
    return 1;
  }

  if (a.cardinality < b.cardinality) {
    return -1;
  }
  if (a.cardinality > b.cardinality) {
    return 1;
  }

  if (a.index > b.index) {
    return -1;
  }
  if (a.index < b.index) {
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

  /**
   * Namer unique name generator class
   */
  constructor() {}

  public registerPath(id: string, path: string) {
    const nameParts = path
      // split the path
      .split("/")
      // decode the parts
      .map(decodeURIComponent)
      // remove all non identifiers
      .map((part) => part.replace(nonIdentifierRe, " "))
      .map((part) => part.trim())
      // remove all empty parts
      .filter((part) => part.length > 0)
      // camelcase the parts
      .map((part) => camelcase(part, { pascalCase: true }));
    this.registerNameParts(id, nameParts);
  }

  private registerNameParts(id: string, nameParts: string[]) {
    // count every name-part
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
      let lastPartInfo: PartInfo | undefined;
      for (let index = 0; index < parts.length; index++) {
        const part = parts[index];
        const partInfo = {
          cardinality: this.partCounters[part],
          value: parts[index],
          index,
          isLast: false,
        };
        if (startsWithLetterRe.test(parts[index])) {
          lastPartInfo = partInfo;
        }
        partInfos[id][1].push(partInfo);
      }

      if (lastPartInfo != null) {
        lastPartInfo.isLast = true;
      }

      // sort all name-parts
      partInfos[id][1].sort(comparePartInfos);
    }

    let names: Record<string, string[]> = {};
    for (let iteration = 0; iteration < maximumIterations; iteration++) {
      names = {};
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

        // For every name that's is not unique, take the next name part
        // and append it.
        for (const id of names[name]) {
          const partInfo = partInfos[id][1].shift();
          if (partInfo == null) {
            continue;
          }
          partInfos[id][0] += partInfo.value;
        }
      }

      for (const id in partInfos) {
        const name = partInfos[id][0];

        // if the name starts with a letter
        if (startsWithLetterRe.test(name)) {
          continue;
        }

        const partInfo = partInfos[id][1].shift();
        if (partInfo == null) {
          continue;
        }
        partInfos[id][0] = partInfo.value + partInfos[id][0];
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
