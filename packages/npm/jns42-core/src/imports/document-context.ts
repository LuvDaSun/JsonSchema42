import defer from "p-defer";
import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "../utils/foreign-object.js";
import { CString } from "./c-string.js";

export class DocumentContext extends ForeignObject {
  constructor(pointer: number) {
    super(pointer, () => mainFfi.exports.document_context_drop(pointer));
  }

  public static new() {
    const pointer = mainFfi.exports.document_context_new();
    return new DocumentContext(pointer);
  }

  public async loadFromLocation(
    retrievalLocation: string,
    givenLocation: string,
    antecedentLocation?: string,
  ) {
    using retrievalLocationForeign = CString.fromString(retrievalLocation);
    using givenLocationForeign = CString.fromString(givenLocation);
    using antecedentLocationForeign =
      antecedentLocation == null ? null : CString.fromString(antecedentLocation);

    const deferred = defer<void>();
    const key = mainFfi.registerCallback(() => {
      deferred.resolve();
    });
    mainFfi.exports.document_context_load_from_location(
      this.pointer,
      retrievalLocationForeign.pointer,
      givenLocationForeign.pointer,
      antecedentLocationForeign?.pointer ?? 0,
      key,
    );

    const data = await deferred.promise;
    return data;
  }
}
