import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/ffi.js";
import { SizedString2 } from "./sized-string-2.js";

export class NamesBuilder {
  private static finalizationRegistry = new FinalizationRegistry<Pointer>((pointer) => {
    mainFfi.exports.names_builder_free(pointer);
  });
  private token = Symbol();

  constructor(private readonly pointer: Pointer) {
    assert(pointer !== NULL_POINTER);

    NamesBuilder.finalizationRegistry.register(this, pointer, this.token);
  }

  [Symbol.dispose]() {
    NamesBuilder.finalizationRegistry.unregister(this.token);

    mainFfi.exports.names_builder_free(this.pointer);
  }

  public static new() {
    const pointer = mainFfi.exports.names_builder_new();
    return new NamesBuilder(pointer);
  }

  public add(key: number, value: string) {
    using valueStructure = new SizedString2();
    valueStructure.value = value;
    const valuePointer = valueStructure.pointer;
    mainFfi.exports.names_builder_add(this.pointer, key, valuePointer);
    return this;
  }

  public setDefaultName(value: string) {
    using valueStructure = new SizedString2();
    valueStructure.value = value;
    const valuePointer = valueStructure.pointer;
    mainFfi.exports.names_builder_set_default_name(this.pointer, valuePointer);
    return this;
  }

  public build() {
    const pointer = mainFfi.exports.names_builder_build(this.pointer);
    return new Names(pointer);
  }
}

export class Names {
  private static finalizationRegistry = new FinalizationRegistry<Pointer>((pointer) => {
    mainFfi.exports.names_free(pointer);
  });
  private token = Symbol();

  constructor(private readonly pointer: Pointer) {
    assert(pointer !== NULL_POINTER);

    Names.finalizationRegistry.register(this, pointer, this.token);
  }

  [Symbol.dispose]() {
    Names.finalizationRegistry.unregister(this.token);

    mainFfi.exports.names_free(this.pointer);
  }

  public toCamelCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_camel_case(this.pointer, key);
    using resultStructure = new SizedString2(resultPointer);
    const result = resultStructure.value;
    assert(result != null);
    return result;
  }

  public toPascalCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_pascal_case(this.pointer, key);
    using resultStructure = new SizedString2(resultPointer);
    const result = resultStructure.value;
    assert(result != null);
    return result;
  }

  public toSnakeCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_snake_case(this.pointer, key);
    using resultStructure = new SizedString2(resultPointer);
    const result = resultStructure.value;
    assert(result != null);
    return result;
  }

  public toScreamingSnakeCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_screaming_snake_case(this.pointer, key);
    using resultStructure = new SizedString2(resultPointer);
    const result = resultStructure.value;
    assert(result != null);
    return result;
  }
}

export function toCamelCase(value: string) {
  using valueStructure = new SizedString2();
  valueStructure.value = value;
  const valuePointer = valueStructure.pointer;
  const resultPointer = mainFfi.exports.to_camel_case(valuePointer);
  using resultStructure = new SizedString2(resultPointer);
  const result = resultStructure.value;
  assert(result != null);
  return result;
}

export function toPascalCase(value: string) {
  using valueStructure = new SizedString2();
  valueStructure.value = value;
  const valuePointer = valueStructure.pointer;
  const resultPointer = mainFfi.exports.to_pascal_case(valuePointer);
  using resultStructure = new SizedString2(resultPointer);
  const result = resultStructure.value;
  assert(result != null);
  return result;
}

export function toSnakeCase(value: string) {
  using valueStructure = new SizedString2();
  valueStructure.value = value;
  const valuePointer = valueStructure.pointer;
  const resultPointer = mainFfi.exports.to_snake_case(valuePointer);
  using resultStructure = new SizedString2(resultPointer);
  const result = resultStructure.value;
  assert(result != null);
  return result;
}

export function toScreamingSnakeCase(value: string) {
  using valueStructure = new SizedString2();
  valueStructure.value = value;
  const valuePointer = valueStructure.pointer;
  const resultPointer = mainFfi.exports.to_screaming_snake_case(valuePointer);
  using resultStructure = new SizedString2(resultPointer);
  const result = resultStructure.value;
  assert(result != null);
  return result;
}
