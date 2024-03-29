import { Out, PascalString, wasmExports } from "./ffi.js";

export function reverse(value: string): string {
  using resultOut = Out.createNullReference();
  using valuePascalString = PascalString.fromString(value);
  wasmExports.reverse(valuePascalString.asPointer(), resultOut.asPointer());
  using resultPascalString = PascalString.fromPointer(resultOut.getReference());
  const result = resultPascalString.toString();
  return result;
}
