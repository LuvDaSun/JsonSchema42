import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "./foreign-object.js";
import { SizedString } from "./sized-string.js";
import { VecSizedString } from "./vec-sized-string.js";

const finalizationRegistry = new FinalizationRegistry<number>((pointer) => {
  if (pointer !== 0) {
    mainFfi.exports.node_location_drop(pointer);
  }
});

/**
 * Location of a node. The location can be either a path or a url
 *
 * @see https://www.rfc-editor.org/rfc/rfc6901
 */
export class NodeLocation extends ForeignObject {
  private token = {};

  constructor(pointer: number) {
    super(pointer);

    finalizationRegistry.register(this, pointer, this.token);
  }

  [Symbol.dispose]() {
    finalizationRegistry.unregister(this.token);

    super[Symbol.dispose]();
  }

  protected drop() {
    mainFfi.exports.node_location_drop(this.pointer);
  }

  public static parse(input: string) {
    using inputForeign = SizedString.fromString(input);
    const pointer = mainFfi.exports.node_location_parse(inputForeign.pointer);
    return new NodeLocation(pointer);
  }

  public clone() {
    const pointer = mainFfi.exports.node_location_clone(this.pointer);
    return new NodeLocation(pointer);
  }

  public join(other: NodeLocation) {
    const pointer = mainFfi.exports.node_location_join(this.pointer, other.pointer);
    return new NodeLocation(pointer);
  }

  public get debug() {
    return this.toString();
  }

  public toString() {
    const resultPointer = mainFfi.exports.node_location_to_string(this.pointer);
    using resultForeign = new SizedString(resultPointer);
    const result = resultForeign.toString();
    assert(result != null);
    return result;
  }

  public toRetrievalString() {
    const resultPointer = mainFfi.exports.node_location_to_retrieval_string(this.pointer);
    using resultForeign = new SizedString(resultPointer);
    const result = resultForeign.toString();
    assert(result != null);
    return result;
  }

  public getPointer() {
    const resultPointer = mainFfi.exports.node_location_get_pointer(this.pointer);
    using resultForeign = new VecSizedString(resultPointer);
    const result = resultForeign.toArray();
    return result;
  }

  public getAnchor() {
    const resultPointer = mainFfi.exports.node_location_get_anchor(this.pointer);
    using resultForeign = new SizedString(resultPointer);
    const result = resultForeign.toString();
    return result;
  }

  public getPath() {
    const resultPointer = mainFfi.exports.node_location_get_path(this.pointer);
    using resultForeign = new VecSizedString(resultPointer);
    const result = resultForeign.toArray();
    assert(result != null);
    return result;
  }

  public getHash() {
    const resultPointer = mainFfi.exports.node_location_get_hash(this.pointer);
    using resultForeign = new VecSizedString(resultPointer);
    const result = resultForeign.toArray();
    assert(result != null);
    return result;
  }

  public setPointer(pointer: string[]) {
    using pointerForeign = VecSizedString.fromArray(pointer);
    mainFfi.exports.node_location_set_pointer(this.pointer, pointerForeign.pointer);
  }

  public setAnchor(anchor: string) {
    using anchorForeign = SizedString.fromString(anchor);
    mainFfi.exports.node_location_set_anchor(this.pointer, anchorForeign.pointer);
  }

  public setRoot() {
    mainFfi.exports.node_location_set_root(this.pointer);
  }
}
