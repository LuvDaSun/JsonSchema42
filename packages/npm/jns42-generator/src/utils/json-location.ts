/**
 * Location of a json node. The location can be either a path or a url
 *
 * @see https://www.rfc-editor.org/rfc/rfc6901
 */
export class JsonLocation {
  private constructor(
    public readonly origin: string,
    public readonly base: string,
    public readonly pointer: string[],
    public readonly anchor: string,
    private readonly alwaysIncludeHash: boolean,
  ) {}

  public static parse(input: string, alwaysIncludeHash = true) {
    // replace all "\" with "/"
    input = input.replaceAll("\\", "/");

    // origin matches things like "http://a.b.c" or "C:"
    const originMatch = input.match(/^[a-z]+\:(:?\/\/[^\/]*)?/gi);
    const origin = originMatch?.[0] ?? "";

    const hashIndex = input.indexOf("#", origin.length);
    if (hashIndex < 0) {
      const base = input.substring(origin.length);
      return new JsonLocation(origin, base, [], "", alwaysIncludeHash);
    }

    const base = input.substring(origin.length, hashIndex);
    const hash = input.substring(hashIndex + 1);
    if (hash.length === 0) {
      return new JsonLocation(origin, base, [], "", alwaysIncludeHash);
    }

    if (hash.startsWith("/")) {
      let pointer = hash
        .substring(1)
        .split("/")
        .map((part) => decodeURI(part))
        .map((part) => JsonLocation.unescape(part));
      return new JsonLocation(origin, base, pointer, "", alwaysIncludeHash);
    } else {
      const anchor = decodeURI(hash);
      return new JsonLocation(origin, base, [], anchor, alwaysIncludeHash);
    }
  }

  public push(...parts: string[]) {
    if (this.anchor.length > 0) {
      throw new TypeError("cannot push to a location with an anchor");
    }

    return new JsonLocation(
      this.origin,
      this.base,
      [...this.pointer, ...parts],
      "",
      this.alwaysIncludeHash,
    );
  }

  public join(other: JsonLocation) {
    // other has an origin, return that
    if (other.origin.length > 0) {
      return other;
    }

    if (other.base.length > 0) {
      // other has an absolute base, replace the base
      if (other.base.startsWith("/")) {
        return new JsonLocation(
          this.origin,
          other.base,
          other.pointer,
          other.anchor,
          this.alwaysIncludeHash,
        );
      }

      if (other.base.startsWith("?")) {
        const searchIndex = this.base.indexOf("?");
        if (searchIndex < 0) {
          return new JsonLocation(
            this.origin,
            this.base + other.base,
            other.pointer,
            other.anchor,
            this.alwaysIncludeHash,
          );
        }

        return new JsonLocation(
          this.origin,
          this.base.substring(0, searchIndex) + other.base,
          other.pointer,
          other.anchor,
          this.alwaysIncludeHash,
        );
      }

      const lastSeparatorIndex = this.base.lastIndexOf("/");
      if (lastSeparatorIndex < 0) {
        return new JsonLocation(
          this.origin,
          other.base,
          other.pointer,
          other.anchor,
          this.alwaysIncludeHash,
        );
      }

      return new JsonLocation(
        this.origin,
        this.base.substring(0, lastSeparatorIndex + 1) + other.base,
        other.pointer,
        other.anchor,
        this.alwaysIncludeHash,
      );
    }

    return new JsonLocation(
      this.origin,
      this.base,
      other.pointer,
      other.anchor,
      this.alwaysIncludeHash,
    );
  }

  public toRoot() {
    return new JsonLocation(this.origin, this.base, [], "", this.alwaysIncludeHash);
  }

  public toString() {
    let hash;
    if (this.pointer.length > 0) {
      hash =
        "/" +
        this.pointer
          .map((part) => JsonLocation.escape(part))
          .map((part) => encodeURI(part))
          .join("/");
    } else {
      hash = encodeURI(this.anchor);
    }

    if (this.alwaysIncludeHash) {
      return this.origin + this.base + "#" + hash;
    }

    if (hash.length > 0) {
      return this.origin + this.base + "#" + hash;
    }

    return this.origin + this.base;
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
