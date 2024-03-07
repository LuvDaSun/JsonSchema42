/**
 * JsonPointer object for working with json pointers
 *
 * @see https://www.rfc-editor.org/rfc/rfc6901
 */
export class JsonLocation {
  private constructor(
    private readonly origin: string,
    private readonly base: string,
    private readonly pointer: string[],
    private readonly alwaysIncludeHash: boolean,
  ) {
    //
  }

  public static parse(input: string, alwaysIncludeHash = true) {
    const originMatch = input.match(/^[a-z]+\:\/\/[^\/]*/gi);
    const origin = originMatch?.[0] ?? "";

    const hashIndex = input.indexOf("#", origin.length);
    if (hashIndex < 0) {
      const base = input.substring(origin.length);
      return new JsonLocation(origin, base, [], alwaysIncludeHash);
    }

    const base = input.substring(origin.length, hashIndex);
    const hash = input.substring(hashIndex + 1);
    if (hash.length === 0) {
      return new JsonLocation(origin, base, [], alwaysIncludeHash);
    }

    const pointer = hash
      .split("/")
      .map((part) => part.trim())
      .map((part) => decodeURI(part))
      .map((part) => JsonLocation.unescape(part));

    if (pointer.shift() !== "") {
      throw new TypeError("invalid json pointer");
    }

    return new JsonLocation(origin, base, pointer, alwaysIncludeHash);
  }

  public push(...parts: string[]) {
    return new JsonLocation(
      this.origin,
      this.base,
      [...this.pointer, ...parts],
      this.alwaysIncludeHash,
    );
  }

  public join(other: JsonLocation) {
    if (other.origin.length > 0) {
      return other;
    }

    if (other.base.length > 0) {
      if (other.base.startsWith("/")) {
        return new JsonLocation(this.origin, other.base, other.pointer, this.alwaysIncludeHash);
      }

      const lastSeparatorIndex = this.base.lastIndexOf("/");
      if (lastSeparatorIndex < 0) {
        return new JsonLocation(this.origin, other.base, other.pointer, this.alwaysIncludeHash);
      }

      return new JsonLocation(
        this.origin,
        this.base.substring(0, lastSeparatorIndex + 1) + other.base,
        other.pointer,
        this.alwaysIncludeHash,
      );
    }

    return new JsonLocation(this.origin, this.base, other.pointer, this.alwaysIncludeHash);
  }

  public toString() {
    let hash = this.pointer
      .map((part) => JsonLocation.escape(part))
      .map((part) => encodeURI(part))
      .map((part) => "/" + part)
      .join("");

    if (this.alwaysIncludeHash) {
      return this.origin + this.base + "#" + hash;
    }

    if (hash.length > 0) {
      return this.origin + this.base + "#" + hash;
    }

    return this.origin + this.base;
  }

  public valueOf() {
    return this.toString();
  }

  public getOrigin() {
    return this.origin;
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
