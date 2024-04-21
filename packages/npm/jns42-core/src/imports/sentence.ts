import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "../utils/foreign-object.js";
import { CString } from "./c-string.js";
import { withErrorReference } from "./with-error.js";

export class Sentence extends ForeignObject {
  constructor(pointer: number) {
    super(pointer, () => mainFfi.exports.sentence_drop(pointer));
  }

  public static new(input: string) {
    using inputForeign = CString.fromString(input);
    const pointer = mainFfi.exports.sentence_new(inputForeign.pointer);
    return new Sentence(pointer);
  }

  public clone() {
    const pointer = mainFfi.exports.sentence_clone(this.pointer);
    return new Sentence(pointer);
  }

  public join(other: Sentence) {
    const pointer = mainFfi.exports.sentence_join(this.pointer, other.pointer);
    return new Sentence(pointer);
  }

  public toCamelCase() {
    const resultPointer = withErrorReference((errorReferencePointer) =>
      mainFfi.exports.sentence_to_camel_case(this.pointer, errorReferencePointer),
    );
    using resultWrapper = new CString(resultPointer);
    const result = resultWrapper.toString();
    return result;
  }

  public toPascalCase() {
    const resultPointer = withErrorReference((errorReferencePointer) =>
      mainFfi.exports.sentence_to_pascal_case(this.pointer, errorReferencePointer),
    );
    using resultWrapper = new CString(resultPointer);
    const result = resultWrapper.toString();
    return result;
  }

  public toSnakeCase() {
    const resultPointer = withErrorReference((errorReferencePointer) =>
      mainFfi.exports.sentence_to_snake_case(this.pointer, errorReferencePointer),
    );
    using resultWrapper = new CString(resultPointer);
    const result = resultWrapper.toString();
    return result;
  }

  public toScreamingSnakeCase() {
    const resultPointer = withErrorReference((errorReferencePointer) =>
      mainFfi.exports.sentence_to_screaming_snake_case(this.pointer, errorReferencePointer),
    );
    using resultWrapper = new CString(resultPointer);
    const result = resultWrapper.toString();
    return result;
  }
}
