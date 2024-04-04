import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { Wrapper } from "./wrapper.js";

export class VecUsizeProxy extends Wrapper {
  public static fromArray(array: number[]) {
    const vec = VecUsizeProxy.new(array.length);
    for (const item of array) {
      vec.push(item);
    }
    assert.equal(vec.len(), array.length);
    return vec;
  }

  public static new(capacity: number) {
    const pointer = mainFfi.exports.vec_usize_new(capacity);
    return new VecUsizeProxy(pointer);
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
