import { Reference } from "./reference.js";

export function withErrorReference<R>(task: (errorReferencePointer: number) => R): R {
  using errorReference = Reference.new();
  const result = task(errorReference.pointer);
  if (errorReference.target !== 0) {
    throw errorReference.target;
  }
  return result;
}

export async function withErrorReferencePromise<R>(
  task: (errorReferencePointer: number) => Promise<R>,
): Promise<R> {
  using errorReference = Reference.new();
  const result = await task(errorReference.pointer);
  if (errorReference.target !== 0) {
    throw errorReference.target;
  }
  return result;
}
