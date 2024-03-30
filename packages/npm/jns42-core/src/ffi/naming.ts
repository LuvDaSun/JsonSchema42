import { mainFfi } from "../main-ffi.js";
import { Pointer } from "../utils/ffi.js";
import { SizedString } from "./sized-string.js";

export class NamesBuilder {
  constructor(private readonly pointer: Pointer) {
    //
  }

  public static new() {
    const pointer = mainFfi.exports.names_builder_new();
    return new NamesBuilder(pointer);
  }

  public add(key: number, value: string) {
    using valueStructure = SizedString.fromString(value);
    const valuePointer = valueStructure.pointer;
    mainFfi.exports.names_builder_add(this.pointer, key, valuePointer);
    return this;
  }

  public setDefaultName(value: string) {
    using valueStructure = SizedString.fromString(value);
    const valuePointer = valueStructure.pointer;
    mainFfi.exports.names_builder_set_default_name(this.pointer, valuePointer);
    return this;
  }

  public build() {
    const pointer = mainFfi.exports.names_builder_build(this.pointer);
    return new Names(pointer);
  }

  [Symbol.dispose]() {
    mainFfi.exports.names_builder_free(this.pointer);
  }
}

export class Names {
  constructor(private readonly pointer: Pointer) {
    //
  }

  public toCamelCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_camel_case(this.pointer, key);
    using resultStructure = SizedString.fromPointer(resultPointer);
    const result = resultStructure.toString();
    return result;
  }

  public toPascalCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_pascal_case(this.pointer, key);
    using resultStructure = SizedString.fromPointer(resultPointer);
    const result = resultStructure.toString();
    return result;
  }

  public toSnakeCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_snake_case(this.pointer, key);
    using resultStructure = SizedString.fromPointer(resultPointer);
    const result = resultStructure.toString();
    return result;
  }

  public toScreamingSnakeCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_screaming_snake_case(this.pointer, key);
    using resultStructure = SizedString.fromPointer(resultPointer);
    const result = resultStructure.toString();
    return result;
  }

  [Symbol.dispose]() {
    mainFfi.exports.names_free(this.pointer);
  }
}

export function toCamelCase(value: string) {
  using valueStructure = SizedString.fromString(value);
  const valuePointer = valueStructure.pointer;
  const resultPointer = mainFfi.exports.to_camel_case(valuePointer);
  using resultStructure = SizedString.fromPointer(resultPointer);
  const result = resultStructure.toString();
  return result;
}

export function toPascalCase(value: string) {
  using valueStructure = SizedString.fromString(value);
  const valuePointer = valueStructure.pointer;
  const resultPointer = mainFfi.exports.to_pascal_case(valuePointer);
  using resultStructure = SizedString.fromPointer(resultPointer);
  const result = resultStructure.toString();
  return result;
}

export function toSnakeCase(value: string) {
  using valueStructure = SizedString.fromString(value);
  const valuePointer = valueStructure.pointer;
  const resultPointer = mainFfi.exports.to_snake_case(valuePointer);
  using resultStructure = SizedString.fromPointer(resultPointer);
  const result = resultStructure.toString();
  return result;
}

export function toScreamingSnakeCase(value: string) {
  using valueStructure = SizedString.fromString(value);
  const valuePointer = valueStructure.pointer;
  const resultPointer = mainFfi.exports.to_screaming_snake_case(valuePointer);
  using resultStructure = SizedString.fromPointer(resultPointer);
  const result = resultStructure.toString();
  return result;
}
