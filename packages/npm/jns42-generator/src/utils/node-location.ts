import path from "path";

/**
 * Location of a node. The location can be either a path or a url
 *
 * @see https://www.rfc-editor.org/rfc/rfc6901
 */
export class NodeLocation {
  public readonly base: string;

  private constructor(
    public readonly origin: string,
    base: string,
    public readonly pointer: string[],
    public readonly anchor: string,
  ) {
    this.base = path.normalize(base);
  }

  public static parse(input: string) {
    // replace all "\" with "/"
    input = input.replaceAll("\\", "/");

    // origin matches things like "http://a.b.c" or "C:"
    const originMatch = input.match(/^[a-z]+\:(:?\/\/[^\/]*)?/gi);
    const origin = originMatch?.[0] ?? "";

    const hashIndex = input.indexOf("#", origin.length);
    if (hashIndex < 0) {
      const base = input.substring(origin.length);
      return new NodeLocation(origin, base, [], "");
    }

    const base = input.substring(origin.length, hashIndex);
    const hash = input.substring(hashIndex + 1);
    if (hash.length === 0) {
      return new NodeLocation(origin, base, [], "");
    }

    if (hash.startsWith("/")) {
      let pointer = hash
        .substring(1)
        .split("/")
        .map((part) => decodeURI(part))
        .map((part) => NodeLocation.unescape(part));
      return new NodeLocation(origin, base, pointer, "");
    } else {
      const anchor = decodeURI(hash);
      return new NodeLocation(origin, base, [], anchor);
    }
  }

  public pushPointer(...parts: string[]) {
    if (this.anchor.length > 0) {
      throw new TypeError("cannot push to a location with an anchor");
    }

    return new NodeLocation(this.origin, this.base, [...this.pointer, ...parts], "");
  }

  public setAnchor(anchor: string) {
    if (this.pointer.length > 0) {
      throw new TypeError("cannot push to a location with a pointer");
    }

    return new NodeLocation(this.origin, this.base, [], anchor);
  }

  public join(other: NodeLocation) {
    // other has an origin, return that
    if (other.origin.length > 0) {
      return other;
    }

    if (other.base.length > 0) {
      // other has an absolute base, replace the base
      if (other.base.startsWith("/")) {
        return new NodeLocation(this.origin, other.base, other.pointer, other.anchor);
      }

      if (other.base.startsWith("?")) {
        const searchIndex = this.base.indexOf("?");
        if (searchIndex < 0) {
          return new NodeLocation(this.origin, this.base + other.base, other.pointer, other.anchor);
        }

        return new NodeLocation(
          this.origin,
          this.base.substring(0, searchIndex) + other.base,
          other.pointer,
          other.anchor,
        );
      }

      const lastSeparatorIndex = this.base.lastIndexOf("/");
      if (lastSeparatorIndex < 0) {
        return new NodeLocation(this.origin, other.base, other.pointer, other.anchor);
      }

      return new NodeLocation(
        this.origin,
        this.base.substring(0, lastSeparatorIndex + 1) + other.base,
        other.pointer,
        other.anchor,
      );
    }

    return new NodeLocation(this.origin, this.base, other.pointer, other.anchor);
  }

  public toRoot() {
    return new NodeLocation(this.origin, this.base, [], "");
  }

  public toString(alwaysIncludeHash = true) {
    let hash;
    if (this.pointer.length > 0) {
      hash =
        "/" +
        this.pointer
          .map((part) => NodeLocation.escape(part))
          .map((part) => encodeURI(part))
          .join("/");
    } else {
      hash = encodeURI(this.anchor);
    }

    if (alwaysIncludeHash) {
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
