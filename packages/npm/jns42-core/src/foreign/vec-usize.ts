import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "./foreign-object.js";

export class VecUsize extends ForeignObject {
  public static fromArray(array: number[]) {
    const vec = VecUsize.new(array.length);
    for (const item of array) {
      vec.push(item);
    }
    assert.equal(vec.len(), array.length);
    return vec;
  }

  public static new(capacity: number) {
    const pointer = mainFfi.exports.vec_usize_new(capacity);
    return new VecUsize(pointer);
  }

  protected drop() {
    mainFfi.exports.vec_usize_drop(this.pointer);
  }

  public len() {
    const result = mainFfi.exports.vec_usize_len(this.pointer);
    return result;
  }

  public push(value: number) {
    mainFfi.exports.vec_usize_push(this.pointer, value);
  }
}
