export interface ValidationFailures {
  path: string[];
  typeName: string;
  rule: string;
}

export class ValidationError extends Error {
  constructor(public readonly failures: ValidationFailures[]) {
    if (failures.length === 0) {
      super("No validation errors");
    } else {
      super(
        [
          `Validation failed`,
          ...failures
            .toReversed()
            .map(
              (item) => `  -> rule ${item.rule} for ${item.typeName} at /${item.path.join("/")}`,
            ),
        ].join("\n"),
      );
    }
  }
}

let currentValidationFailures = new Array<ValidationFailures>();
export function getValidationError() {
  const validationErrors = currentValidationFailures;
  currentValidationFailures = [];
  return new ValidationError(validationErrors);
}

const validationFailuresStack = new Array<ValidationFailures[]>();
export function saveValidationFailures() {
  validationFailuresStack.push([...currentValidationFailures]);
}
export function restoreValidationFailures() {
  currentValidationFailures = validationFailuresStack.pop()!;
}

const typeNameStack = new Array<string>();
export function withValidationType<T>(typeName: string, job: () => T) {
  if (typeNameStack.length === 0) {
    currentValidationFailures = [];
    validationFailuresStack.splice(0, validationFailuresStack.length);
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
export function recordValidationFailure(rule: string) {
  const typeName = typeNameStack[typeNameStack.length - 1]!;
  currentValidationFailures.push({
    path: [...pathStack],
    typeName,
    rule,
  });
}
