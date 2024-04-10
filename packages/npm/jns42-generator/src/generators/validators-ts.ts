import assert from "assert";
import * as models from "../models/index.js";
import {
  NestedText,
  banner,
  generateJsDocComments,
  itt,
  joinIterable,
  mapIterable,
} from "../utils/index.js";

export function* generateValidatorsTsCode(specification: models.Specification) {
  yield banner;

  const { names, validatorsArena } = specification;

  yield itt`
    import * as types from "./types.js";
  `;

  yield itt`
    export interface ValidationError {
      path: string;
      rule: string;
      typeName?: string;
    }

    const pathPartStack = new Array<string>();
    const typeNameStack = new Array<string>();
    let errors = new Array<ValidationError>();
    let depth = 0;

    export function getValidationErrors() {
      return errors;
    }

    export function getLastValidationError() {
      if(errors.length === 0) {
        throw new TypeError("no validation errors");
      }
      return errors[errors.length - 1];
    }

    function withPath<T>(pathPart: string, job: () => T): T {
      pathPartStack.push(pathPart);
      try {
        return job();
      }
      finally {
        pathPartStack.pop();
      }
    }

    function withType<T>(typeName: string, job: () => T): T {
      if(typeNameStack.length === 0) {
        resetErrors();
      }
  
      typeNameStack.push(typeName);
      try {
        return job();
      }
      finally {
        typeNameStack.pop();
      }
    }

    function resetErrors() {
      errors = [];
    }

    function recordError(rule: string) {
      errors.push({
        path: pathPartStack.join("/"),
        typeName: typeNameStack[typeNameStack.length - 1],
        rule,
      })
    }
  `;

  for (const [itemKey, item] of [...validatorsArena].map((item, key) => [key, item] as const)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    using typeName = names.getName(itemKey);
    const statements = generateValidatorStatements(itemKey, "value");

    yield itt`
      ${generateJsDocComments(item)}
      export function is${typeName.toPascalCase()}(value: unknown): value is types.${typeName.toPascalCase()} {
        if(depth === 0) {
          resetErrors();
        }
  
        depth += 1;
        try{
          return withType(${JSON.stringify(typeName.toPascalCase())}, () => {
            ${statements};
          });
        }
        finally {
          depth -= 1;
        }
      }
    `;
  }

  function* generateValidatorReference(
    typeKey: number,
    valueExpression: string,
  ): Iterable<NestedText> {
    const typeItem = validatorsArena.getItem(typeKey);
    if (typeItem.id == null) {
      yield itt`
        ((value: unknown) => {
            ${generateValidatorStatements(typeKey, "value")}
        })(${valueExpression})
      `;
    } else {
      using typeName = names.getName(typeKey);
      yield itt`is${typeName.toPascalCase()}(${valueExpression})`;
    }
  }

  function* generateValidatorStatements(
    itemKey: number,
    valueExpression: string,
  ): Iterable<NestedText> {
    const item = validatorsArena.getItem(itemKey);

    if (item.reference != null) {
      yield itt`
        if(!${generateValidatorReference(item.reference, valueExpression)}) {
          return false;
        };
      `;
    }

    if (item.options != null) {
      yield itt`
        if(
          ${joinIterable(
            item.options.map((option) => itt`${valueExpression} !== ${JSON.stringify(option)}`),
            " &&\n",
          )}
        ) {
          recordError("options");
          return false;
        }
      `;
    }

    if (item.types != null && item.types.length > 0) {
      yield itt`
      if(!(${joinIterable(
        mapIterable(generateSubAssertions(), (assertion) => itt`(${assertion})`),
        " ||\n",
      )})) {
        recordError("types");
        return false;
      }
    `;
      function* generateSubAssertions() {
        for (const type of item.types ?? []) {
          switch (type) {
            case "any": {
              yield JSON.stringify(true);
              break;
            }

            case "never": {
              yield JSON.stringify(false);
              return;
            }

            case "null": {
              yield itt`${valueExpression} === null`;
              break;
            }

            case "boolean": {
              yield itt`typeof ${valueExpression} === "boolean"`;
              break;
            }

            case "integer": {
              yield itt`
                typeof ${valueExpression} === "number" &&
                !isNaN(${valueExpression}) &&
                ${valueExpression} % 1 === 0
              `;
              break;
            }

            case "number": {
              yield itt`
                typeof ${valueExpression} === "number" &&
                !isNaN(${valueExpression})
              `;
              break;
            }

            case "string": {
              yield itt`typeof ${valueExpression} === "string"`;
              break;
            }

            case "array": {
              yield itt`Array.isArray(${valueExpression})`;
              break;
            }

            case "map": {
              yield itt`
                ${valueExpression} !== null &&
                typeof ${valueExpression} === "object" &&
                !Array.isArray(${valueExpression})
              `;
              break;
            }
          }
        }
      }
    }

    if (
      item.minimumInclusive != null ||
      item.minimumExclusive != null ||
      item.maximumInclusive != null ||
      item.maximumExclusive != null ||
      item.multipleOf != null
    ) {
      yield itt`
        if(
          typeof ${valueExpression} === "number" &&
          !isNaN(${valueExpression})
        ) {
          ${generateSubValidators()}
        }
      `;

      function* generateSubValidators() {
        if (item.minimumInclusive != null) {
          yield itt`
            if(
              ${valueExpression} < ${JSON.stringify(item.minimumInclusive)}
            ) {
              recordError("minimumInclusive");
              return false;
            }
          `;
        }

        if (item.minimumExclusive != null) {
          yield itt`
            if(
              ${valueExpression} <= ${JSON.stringify(item.minimumExclusive)}
            ) {
              recordError("minimumExclusive");
              return false;
            }
          `;
        }

        if (item.maximumInclusive != null) {
          yield itt`
            if(
              ${valueExpression} > ${JSON.stringify(item.maximumInclusive)}
            ) {
              recordError("maximumInclusive");
              return false;
            }
          `;
        }

        if (item.maximumExclusive != null) {
          yield itt`
            if(
              ${valueExpression} >= ${JSON.stringify(item.maximumExclusive)}
            ) {
              recordError("maximumExclusive");
              return false;
            }
          `;
        }

        if (item.multipleOf != null) {
          yield itt`
            if(
              ${valueExpression} % ${JSON.stringify(item.multipleOf)} !== 0
            ) {
              recordError("multipleOf");
              return false;
            }
          `;
        }
      }
    }

    if (item.minimumLength != null || item.maximumLength != null || item.valuePattern != null) {
      yield itt`
        if(
          typeof ${valueExpression} === "string"
        ) {
          ${generateSubValidators()}
        }
      `;

      function* generateSubValidators() {
        if (item.minimumLength != null) {
          yield itt`
            if(
              ${valueExpression}.length < ${JSON.stringify(item.minimumLength)}
            ) {
              recordError("minimumLength");
              return false;
            }
          `;
        }

        if (item.maximumLength != null) {
          yield itt`
            if(
              value.length > ${JSON.stringify(item.maximumLength)}
            ) {
              recordError("maximumLength");
              return false;
            }
          `;
        }

        for (const ruleValue of item.valuePattern ?? []) {
          yield itt`
            if(
              !new RegExp(${JSON.stringify(ruleValue)}).test(${valueExpression})
            ) {
              recordError("valuePattern");
              return false;
            }
          `;
        }
      }
    }

    if (
      item.minimumItems != null ||
      item.maximumItems != null ||
      item.uniqueItems != null ||
      item.tupleItems != null ||
      item.arrayItems != null
    ) {
      const trackElements = item.uniqueItems ?? false;

      yield itt`
      if(
        Array.isArray(${valueExpression})
      ) {
        ${generateSubValidators()}
      }
    `;

      function* generateSubValidators() {
        if (item.tupleItems != null) {
          yield itt`
            if(
              ${valueExpression}.length < ${JSON.stringify(item.tupleItems.length)}
            ) {
              recordError("tupleItems");
              return false;
            }
          `;
        }

        if (item.minimumItems != null) {
          yield itt`
            if(${valueExpression}.length < ${JSON.stringify(item.minimumItems)}) {
              recordError("minimumItems");
              return false;
            }
          `;
        }

        if (item.maximumItems != null) {
          yield itt`
            if(${valueExpression}.length > ${JSON.stringify(item.maximumItems)}) {
              recordError("maximumItems");
              return false;
            }
          `;
        }

        if (trackElements) {
          yield itt`
            const elementValueSeen = new Set<unknown>();
          `;
        }

        yield itt`
          for(let elementIndex = 0; elementIndex < ${valueExpression}.length; elementIndex ++) {
            ${generateLoopContent()}
          }
        `;
      }

      function* generateLoopContent() {
        yield itt`
          const elementValue = ${valueExpression}[elementIndex];
        `;

        if (item.uniqueItems ?? false) {
          yield itt`
            if(elementValueSeen.has(elementValue)) {
              recordError("uniqueItems");
              return false;
            }
          `;
        }

        yield itt`
          switch(elementIndex) {
            ${generateCaseClauses()}
          }
        `;

        if (trackElements) {
          yield itt`
            elementValueSeen.add(elementValue);
          `;
        }
      }

      function* generateCaseClauses() {
        if (item.tupleItems != null) {
          for (let elementIndex = 0; elementIndex < item.tupleItems.length; elementIndex++) {
            const elementKey = item.tupleItems[elementIndex];
            yield itt`
              case ${JSON.stringify(elementIndex)}:
                if(!withPath(String(elementIndex), () => {
                  if(!${generateValidatorReference(elementKey, `elementValue`)}) {
                    recordError("elementValue");
                    return false;
                  }
                  return true;
                })) {
                  return false;
                }
                break;
            `;
          }
        }

        yield itt`
          default:
            ${generateDefaultCaseStatements()}
            break;
        `;
      }

      function* generateDefaultCaseStatements() {
        if (item.arrayItems != null) {
          yield itt`
            if(!withPath(String(elementIndex), () => {
              if(!${generateValidatorReference(item.arrayItems, `elementValue`)}) {
                recordError("elementValue");
                return false;
              }
              return true;
            })) {
              return false;
            }
            break;
          `;
        }
      }
    }

    if (
      item.minimumProperties != null ||
      item.maximumProperties != null ||
      item.required != null ||
      item.objectProperties != null ||
      item.patternProperties != null ||
      item.mapProperties != null
    ) {
      const countProperties = item.minimumProperties != null || item.maximumProperties != null;

      yield itt`
        if(
          ${valueExpression} !== null &&
          typeof ${valueExpression} === "object" &&
          !Array.isArray(${valueExpression})
        ) {
          ${generateSubValidators()}
        }
      `;

      function* generateSubValidators() {
        /**
         * check if all the required properties are present
         */
        for (const propertyName of item.required ?? []) {
          yield itt`
            if(
              !(${JSON.stringify(propertyName)} in ${valueExpression}) ||
              ${valueExpression}[${JSON.stringify(propertyName)}] === undefined
            ) {
              recordError("required");
              return false;
            }
          `;
        }

        if (countProperties) {
          yield itt`
            let propertyCount = 0;
          `;
        }

        yield itt`
          for(const propertyName in ${valueExpression}) {
            ${generateLoopContent()}
          }
        `;

        if (item.minimumProperties != null) {
          yield itt`
            if(propertyCount < ${JSON.stringify(item.minimumProperties)}) {
              recordError("minimumProperties");
              return false;
              }
          `;
        }
      }

      function* generateLoopContent() {
        yield itt`
          const propertyValue = value[propertyName as keyof typeof value];
          if(propertyValue === undefined) {
            continue;
          }
        `;

        if (countProperties) {
          yield itt`
            propertyCount++;
          `;
        }

        if (item.maximumProperties != null) {
          yield itt`
            if(propertyCount > ${JSON.stringify(item.maximumProperties)}) {
              recordError("maximumProperties");
              return false;
            }
          `;
        }

        yield itt`
          switch(propertyName) {
            ${generateCaseClauses()}
          }
        `;
      }

      function* generateCaseClauses() {
        if (item.objectProperties != null) {
          for (const propertyName in item.objectProperties) {
            yield itt`
              case ${JSON.stringify(propertyName)}:
                if(!withPath(propertyName, () => {
                  if(!${generateValidatorReference(
                    item.objectProperties[propertyName],
                    `propertyValue`,
                  )}) {
                    recordError("objectProperties");
                    return false;
                  }
                  return true;
                })) {
                  return false
                }
                break;
            `;
          }
        }

        yield itt`
          default:
            ${generateDefaultCaseStatements()}
            break;
        `;
      }

      function* generateDefaultCaseStatements() {
        if (item.patternProperties != null) {
          for (const propertyPattern in item.patternProperties) {
            yield itt`
              if(new RegExp(${JSON.stringify(propertyPattern)}).test(propertyName)) {
                if(!withPath(propertyName, () => {
                  if(
                    !${generateValidatorReference(
                      item.patternProperties[propertyPattern],
                      `propertyValue`,
                    )}
                  ) {
                    return false;
                  }  
                  return true;
                })) {
                  return false
                }
                continue;
              }
            `;
          }
        }

        if (item.mapProperties != null) {
          yield itt`
            if(!withPath(propertyName, () => {
              if(
                !${generateValidatorReference(item.mapProperties, `propertyValue`)}
              ) {
                return false;
              }  
              return true;
            })) {
              return false
            }
          `;
        }
      }
    }

    if (item.reference != null) {
      yield itt`
        if(!${generateValidatorReference(item.reference, valueExpression)}) {
          recordError("reference");
          return false;
        }
      `;
    }

    if (item.allOf != null) {
      yield itt`
        {
          let counter = 0;

          ${generateInnerStatements()}

          if(counter < ${JSON.stringify(item.allOf.length)}) {
            recordError("allOf");
            return false;
          }
        }
      `;

      function* generateInnerStatements() {
        assert(item.allOf != null);

        for (let elementIndex = 0; elementIndex < item.allOf.length; elementIndex++) {
          const element = item.allOf[elementIndex];
          yield itt`
            if(counter === ${JSON.stringify(elementIndex)} && ${generateValidatorReference(
              element,
              valueExpression,
            )}) {
              counter += 1;
            }
          `;
        }
      }
    }

    if (item.anyOf != null) {
      yield itt`
        {
          let counter = 0;

          ${generateInnerStatements()}

          if(counter < 1) {
            recordError("anyOf");
            return false;
          }
        }
      `;

      function* generateInnerStatements() {
        assert(item.anyOf != null);

        for (let elementIndex = 0; elementIndex < item.anyOf.length; elementIndex++) {
          const element = item.anyOf[elementIndex];
          yield itt`
            if(counter < 1 && ${generateValidatorReference(element, valueExpression)}) {
              counter += 1;
            }
          `;
        }
      }
    }

    if (item.oneOf != null) {
      yield itt`
        {
          let counter = 0;

          ${generateInnerStatements()}

          if(counter !== 1) {
            recordError("oneOf");
            return false;
          }
        }
      `;

      function* generateInnerStatements() {
        assert(item.oneOf != null);

        for (let elementIndex = 0; elementIndex < item.oneOf.length; elementIndex++) {
          const element = item.oneOf[elementIndex];
          yield itt`
            if(counter < 2 && ${generateValidatorReference(element, valueExpression)}) {
              counter += 1;
            }
          `;
        }
      }
    }

    if (item.if != null) {
      yield itt`
        if(${generateValidatorReference(item.if, valueExpression)}) {
          ${generateInnerThenStatements()}
        }
        else {
          ${generateInnerElseStatements()}
        }
      `;

      function* generateInnerThenStatements() {
        if (item.then != null) {
          yield itt`
            if(!${generateValidatorReference(item.then, valueExpression)}) {
              recordError("then");
              return false;
            }
          `;
        }
      }

      function* generateInnerElseStatements() {
        if (item.else != null) {
          yield itt`
            if(!${generateValidatorReference(item.else, valueExpression)}) {
              recordError("else");
              return false;
            }
          `;
        }
      }
    }

    if (item.not != null) {
      yield itt`
        if(${generateValidatorReference(item.not, valueExpression)}) {
          recordError("not");
          return false;
        }
      `;
    }

    yield itt`
      return true;
    `;
  }
}
