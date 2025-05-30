export interface ValidationError {
  path: string[];
  typeName: string;
  rule: string;
}

export class ValidationAssertionError extends Error {
  constructor(public readonly validationErrors: ValidationError[]) {
    super("validation failed");
  }
}

let currentValidationErrors = new Array<ValidationError>();
export function getValidationErrors() {
  return currentValidationErrors;
}
export function assertValidationErrors() {
  const validationErrors = currentValidationErrors;
  currentValidationErrors = [];
  throw new ValidationAssertionError(validationErrors);
}

const validationErrorsStack = new Array<ValidationError[]>();
export function saveValidationErrors() {
  validationErrorsStack.push([...currentValidationErrors]);
}
export function restoreValidationErrors() {
  currentValidationErrors = validationErrorsStack.pop()!;
}

const typeNameStack = new Array<string>();
export function withValidationType<T>(typeName: string, job: () => T) {
  if (typeNameStack.length === 0) {
    currentValidationErrors = [];
    validationErrorsStack.splice(0, validationErrorsStack.length);
  }
  typeNameStack.push(typeName);
  try {
    return job();
  } finally {
    typeNameStack.pop();
  }
}

const pathStack = new Array<string>();
export function withValidationPath<T>(path: string, job: () => T): T {
  pathStack.push(path);
  try {
    return job();
  } finally {
    pathStack.pop();
  }
}
export function recordValidationError(rule: string) {
  const typeName = typeNameStack[typeNameStack.length - 1]!;
  currentValidationErrors.push({
    path: [...pathStack],
    typeName,
    rule,
  });
}
