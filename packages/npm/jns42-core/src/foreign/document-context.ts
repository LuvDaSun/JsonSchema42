import defer from "p-defer";
import { mainFfi } from "../main-ffi.js";
import { CString } from "./c-string.js";
import { ForeignObject } from "./foreign-object.js";

export class DocumentContext extends ForeignObject {
  protected drop() {
    mainFfi.exports.document_context_drop(this.pointer);
  }

  public static new() {
    const pointer = mainFfi.exports.document_context_new();
    return new DocumentContext(pointer);
  }

  public async load(location: string) {
    using locationForeign = CString.fromString(location);

    const deferred = defer<string>();
    const key = mainFfi.registerCallback((dataPointer: number) => {
      using dataForeign = new CString(dataPointer);
      const data = dataForeign.toString();
      deferred.resolve(data);
    });
    mainFfi.exports.document_context_load(this.pointer, locationForeign.pointer, key);

    const data = await deferred.promise;
    return data;
  }
}
