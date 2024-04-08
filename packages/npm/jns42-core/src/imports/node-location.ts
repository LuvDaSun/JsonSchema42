import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "../utils/foreign-object.js";
import { CString } from "./c-string.js";
import { VecString } from "./vec-string.js";

/**
 * Location of a node. The location can be either a path or a url
 *
 * @see https://www.rfc-editor.org/rfc/rfc6901
 */
export class NodeLocation extends ForeignObject {
  constructor(pointer: number) {
    super(pointer, () => mainFfi.exports.node_location_drop(pointer));
  }

  public static parse(input: string) {
    using inputForeign = CString.fromString(input);
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
    using resultForeign = new CString(resultPointer);
    const result = resultForeign.toString();
    return result;
  }

  public toFetchString() {
    const resultPointer = mainFfi.exports.node_location_to_fetch_string(this.pointer);
    using resultForeign = new CString(resultPointer);
    const result = resultForeign.toString();
    return result;
  }

  public getPointer() {
    const resultPointer = mainFfi.exports.node_location_get_pointer(this.pointer);
    if (resultPointer === 0) {
      return;
    }
    using resultForeign = new VecString(resultPointer);
    const result = resultForeign.toArray();
    return result;
  }

  public getAnchor() {
    const resultPointer = mainFfi.exports.node_location_get_anchor(this.pointer);
    if (resultPointer === 0) {
      return;
    }
    using resultForeign = new CString(resultPointer);
    const result = resultForeign.toString();
    return result;
  }

  public getPath() {
    const resultPointer = mainFfi.exports.node_location_get_path(this.pointer);
    using resultForeign = new VecString(resultPointer);
    const result = resultForeign.toArray();
    return result;
  }

  public getHash() {
    const resultPointer = mainFfi.exports.node_location_get_hash(this.pointer);
    using resultForeign = new VecString(resultPointer);
    const result = resultForeign.toArray();
    return result;
  }

  public setPointer(pointer: string[]) {
    using pointerForeign = VecString.fromArray(pointer);
    mainFfi.exports.node_location_set_pointer(this.pointer, pointerForeign.pointer);
  }

  public setAnchor(anchor: string) {
    using anchorForeign = CString.fromString(anchor);
    mainFfi.exports.node_location_set_anchor(this.pointer, anchorForeign.pointer);
  }

  public setRoot() {
    mainFfi.exports.node_location_set_root(this.pointer);
  }
}
