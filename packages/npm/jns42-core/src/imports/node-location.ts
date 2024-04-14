import { ForeignObject } from "../utils/foreign-object.js";

/**
 * Location of a node. The location can be either a path or a url
 *
 * @see https://www.rfc-editor.org/rfc/rfc6901
 */
export class NodeLocation extends ForeignObject {
  constructor(pointer: number) {
    super(pointer);
  }

  public static parse(input: string): NodeLocation {
    throw "not implemented";
  }

  public clone(): NodeLocation {
    throw "not implemented";
  }

  public join(other: NodeLocation): NodeLocation {
    throw "not implemented";
  }

  public toString(): string {
    throw "not implemented";
  }

  public toFetchString(): string {
    throw "not implemented";
  }

  public getPointer(): string[] {
    throw "not implemented";
  }

  public getAnchor(): string | undefined {
    throw "not implemented";
  }

  public getPath(): string[] | undefined {
    throw "not implemented";
  }

  public getHash(): string[] {
    throw "not implemented";
  }

  public setPointer(pointer: string[]) {
    throw "not implemented";
  }

  public setAnchor(anchor: string) {
    throw "not implemented";
  }

  public setRoot() {
    throw "not implemented";
  }
}
