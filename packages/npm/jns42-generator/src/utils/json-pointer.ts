/**
 * JsonPointer object for working with json pointers
 *
 * @see https://www.rfc-editor.org/rfc/rfc6901
 */
export class JsonPointer {
  private constructor(
    private readonly base: string,
    private readonly pointer: string[],
    private readonly alwaysIncludeHash: boolean,
  ) {
    //
  }

  public static parse(input: string, alwaysIncludeHash = true) {
    const hashIndex = input.indexOf("#");
    if (hashIndex < 0) {
      return new JsonPointer(input, [], alwaysIncludeHash);
    }

    const base = input.substring(0, hashIndex);
    const hash = input.substring(hashIndex + 1);
    if (hash.length === 0) {
      return new JsonPointer(base, [], alwaysIncludeHash);
    }

    const pointer = hash
      .split("/")
      .map((part) => part.trim())
      .map((part) => decodeURI(part))
      .map((part) => JsonPointer.unescape(part));

    if (pointer.shift() !== "") {
      throw new TypeError("invalid json pointer");
    }

    return new JsonPointer(base, pointer, alwaysIncludeHash);
  }

  public push(...parts: string[]) {
    return new JsonPointer(this.base, [...this.pointer, ...parts], this.alwaysIncludeHash);
  }

  public toString() {
    let hash = this.pointer
      .map((part) => JsonPointer.escape(part))
      .map((part) => encodeURI(part))
      .map((part) => "/" + part)
      .join("");

    if (this.alwaysIncludeHash) {
      return this.base + "#" + hash;
    }

    if (hash.length > 0) {
      return this.base + "#" + hash;
    }

    return this.base;
  }

  public valueOf() {
    return this.toString();
  }

  public getBase() {
    return this.base;
  }

  public getPointer() {
    return this.pointer;
  }

  public getTip() {
    return this.pointer[this.pointer.length - 1];
  }

  public static escape(input: string) {
    return input.replaceAll("~", "~0").replaceAll("/", "~1");
  }

  public static unescape(input: string) {
    return input.replaceAll("~1", "/").replaceAll("~0", "~");
  }
}
