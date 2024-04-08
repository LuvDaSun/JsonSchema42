import * as schemaIntermediate from "@jns42/schema-intermediate";
import defer from "p-defer";
import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "../utils/foreign-object.js";
import { CString } from "./c-string.js";
import { withErrorReference, withErrorReferencePromise } from "./with-error.js";

export class DocumentContext extends ForeignObject {
  constructor(pointer: number) {
    super(pointer, () => mainFfi.exports.document_context_drop(pointer));
  }

  public static new() {
    const pointer = mainFfi.exports.document_context_new();
    return new DocumentContext(pointer);
  }

  public registerWellKnownFactories() {
    withErrorReference((errorReferencePointer) =>
      mainFfi.exports.document_context_register_well_known_factories(
        this.pointer,
        errorReferencePointer,
      ),
    );
  }

  public async loadFromLocation(
    retrievalLocation: string,
    givenLocation: string,
    antecedentLocation: string | undefined,
    defaultMetaSchemaId: string,
  ) {
    using retrievalLocationForeign = CString.fromString(retrievalLocation);

    using givenLocationForeign = CString.fromString(givenLocation);

    using antecedentLocationForeign =
      antecedentLocation == null ? null : CString.fromString(antecedentLocation);

    using defaultMetaSchemaIdForeign = CString.fromString(defaultMetaSchemaId);

    const deferred = defer<void>();
    const key = mainFfi.registerCallback(() => {
      deferred.resolve();
    });

    await withErrorReferencePromise(async (errorReferencePointer) =>
      mainFfi.exports.document_context_load_from_location(
        this.pointer,
        retrievalLocationForeign.pointer,
        givenLocationForeign.pointer,
        antecedentLocationForeign?.pointer ?? 0,
        defaultMetaSchemaIdForeign.pointer,
        errorReferencePointer,
        key,
      ),
    );

    await deferred.promise;
  }

  public async loadFromNode(
    retrievalLocation: string,
    givenLocation: string,
    antecedentLocation: string | undefined,
    node: any,
    defaultMetaSchemaId: string,
  ) {
    using retrievalLocationForeign = CString.fromString(retrievalLocation);

    using givenLocationForeign = CString.fromString(givenLocation);

    using antecedentLocationForeign =
      antecedentLocation == null ? null : CString.fromString(antecedentLocation);

    let nodeString = JSON.stringify(node);
    using nodeForeign = CString.fromString(nodeString);

    using defaultMetaSchemaIdForeign = CString.fromString(defaultMetaSchemaId);

    const deferred = defer<void>();
    const key = mainFfi.registerCallback(() => {
      deferred.resolve();
    });

    await withErrorReferencePromise(async (errorReferencePointer) =>
      mainFfi.exports.document_context_load_from_node(
        this.pointer,
        retrievalLocationForeign.pointer,
        givenLocationForeign.pointer,
        antecedentLocationForeign?.pointer ?? 0,
        nodeForeign.pointer,
        defaultMetaSchemaIdForeign.pointer,
        errorReferencePointer,
        key,
      ),
    );

    await deferred.promise;
  }

  public getIntermediateDocument(): schemaIntermediate.SchemaJson {
    const documentPointer = withErrorReference((errorReferencePointer) =>
      mainFfi.exports.document_context_get_intermediate_document(
        this.pointer,
        errorReferencePointer,
      ),
    );
    using documentForeign = new CString(documentPointer);
    const documentString = documentForeign.toString();
    const document = JSON.parse(documentString);
    return document;
  }
}
