import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "../utils/foreign-object.js";
import { CString } from "./c-string.js";
import { DocumentContext } from "./document-context.js";
import { ArenaSchemaItemValue } from "./schema-item.js";
import { VecString } from "./vec-string.js";
import { VecUsize } from "./vec-usize.js";
import { withErrorReference } from "./with-error.js";

export class SchemaArena extends ForeignObject {
  constructor(pointer: number) {
    super(pointer, () => mainFfi.exports.schema_arena_drop(pointer));
  }

  public static fromDocumentContext(documentContext: DocumentContext) {
    const pointer = mainFfi.exports.schema_arena_from_document_context(documentContext.pointer);
    return new SchemaArena(pointer);
  }

  public clone() {
    const pointer = mainFfi.exports.schema_arena_clone(this.pointer);
    return new SchemaArena(pointer);
  }

  public count() {
    const count = mainFfi.exports.schema_arena_count(this.pointer);
    return count;
  }

  public getItem(key: number): ArenaSchemaItemValue {
    const itemPointer = withErrorReference((errorReferencePointer) =>
      mainFfi.exports.schema_arena_get_item(this.pointer, key, errorReferencePointer),
    );
    using itemWrapper = new CString(itemPointer);
    const itemString = itemWrapper.toString();
    const item = JSON.parse(itemString);
    return item;
  }

  public getNameParts(key: number): string[] {
    const partsPointer = mainFfi.exports.schema_arena_get_name_parts(this.pointer, key);

    using partsForeign = new VecString(partsPointer);
    const parts = partsForeign.toArray();
    return parts;
  }

  public transform(transforms: VecUsize) {
    const result = mainFfi.exports.schema_arena_transform(this.pointer, transforms.pointer);
    return result;
  }

  public *[Symbol.iterator]() {
    const count = this.count();
    for (let key = 0; key < count; key++) {
      yield this.getItem(key);
    }
  }
}
