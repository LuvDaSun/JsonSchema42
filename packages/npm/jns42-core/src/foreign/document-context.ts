import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "./foreign-object.js";

export class DocumentContext extends ForeignObject {
  protected drop() {
    mainFfi.exports.document_context_drop(this.pointer);
  }

  public static new() {
    const pointer = mainFfi.exports.document_context_new();
    return new DocumentContext(pointer);
  }
}
