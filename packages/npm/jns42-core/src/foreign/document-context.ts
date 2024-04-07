import defer from "p-defer";
import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "./foreign-object.js";
import { SizedString } from "./sized-string.js";

export class DocumentContext extends ForeignObject {
  protected drop() {
    mainFfi.exports.document_context_drop(this.pointer);
  }

  public static new() {
    const pointer = mainFfi.exports.document_context_new();
    return new DocumentContext(pointer);
  }

  public async load(location: string) {
    using locationForeign = SizedString.fromString(location);

    const deferred = defer();
    const key = mainFfi.registerCallback(() => deferred.resolve());
    mainFfi.exports.document_context_load(this.pointer, locationForeign.pointer, key);

    await deferred.promise;
  }
}
