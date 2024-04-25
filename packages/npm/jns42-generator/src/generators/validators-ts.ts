import { banner } from "@jns42/core";
import assert from "assert";
import * as models from "../models/index.js";
import {
  NestedText,
  generateJsDocComments,
  itt,
  joinIterable,
  mapIterable,
  packageInfo,
} from "../utils/index.js";

export function* generateValidatorsTsCode(specification: models.Specification) {
  yield banner("//", `v${packageInfo.version}`);

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
    const itemValue = item.toValue();
    const { location: nodeId } = itemValue;

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
    using typeItem = validatorsArena.getItem(typeKey);
    const typeItemValue = typeItem.toValue();
    if (typeItemValue.location == null) {
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
    const itemValue = item.toValue();

    if (itemValue.reference != null) {
      yield itt`
        if(!${generateValidatorReference(itemValue.reference, valueExpression)}) {
          return false;
        };
      `;
    }

    if (itemValue.options != null) {
      yield itt`
        if(
          ${joinIterable(
            itemValue.options.map(
              (option) => itt`${valueExpression} !== ${JSON.stringify(option)}`,
            ),
            " &&\n",
          )}
        ) {
          recordError("options");
          return false;
        }
      `;
    }

    if (itemValue.types != null && itemValue.types.length > 0) {
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
        for (const type of itemValue.types ?? []) {
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

            case "object": {
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
      itemValue.minimumInclusive != null ||
      itemValue.minimumExclusive != null ||
      itemValue.maximumInclusive != null ||
      itemValue.maximumExclusive != null ||
      itemValue.multipleOf != null
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
        if (itemValue.minimumInclusive != null) {
          yield itt`
            if(
              ${valueExpression} < ${JSON.stringify(itemValue.minimumInclusive)}
            ) {
              recordError("minimumInclusive");
              return false;
            }
          `;
        }

        if (itemValue.minimumExclusive != null) {
          yield itt`
            if(
              ${valueExpression} <= ${JSON.stringify(itemValue.minimumExclusive)}
            ) {
              recordError("minimumExclusive");
              return false;
            }
          `;
        }

        if (itemValue.maximumInclusive != null) {
          yield itt`
            if(
              ${valueExpression} > ${JSON.stringify(itemValue.maximumInclusive)}
            ) {
              recordError("maximumInclusive");
              return false;
            }
          `;
        }

        if (itemValue.maximumExclusive != null) {
          yield itt`
            if(
              ${valueExpression} >= ${JSON.stringify(itemValue.maximumExclusive)}
            ) {
              recordError("maximumExclusive");
              return false;
            }
          `;
        }

        if (itemValue.multipleOf != null) {
          yield itt`
            if(
              ${valueExpression} % ${JSON.stringify(itemValue.multipleOf)} !== 0
            ) {
              recordError("multipleOf");
              return false;
            }
          `;
        }
      }
    }

    if (
      itemValue.minimumLength != null ||
      itemValue.maximumLength != null ||
      itemValue.valuePattern != null
    ) {
      yield itt`
        if(
          typeof ${valueExpression} === "string"
        ) {
          ${generateSubValidators()}
        }
      `;

      function* generateSubValidators() {
        if (itemValue.minimumLength != null) {
          yield itt`
            if(
              ${valueExpression}.length < ${JSON.stringify(itemValue.minimumLength)}
            ) {
              recordError("minimumLength");
              return false;
            }
          `;
        }

        if (itemValue.maximumLength != null) {
          yield itt`
            if(
              value.length > ${JSON.stringify(itemValue.maximumLength)}
            ) {
              recordError("maximumLength");
              return false;
            }
          `;
        }

        if (itemValue.valuePattern != null) {
          yield itt`
            if(
              !new RegExp(${JSON.stringify(itemValue.valuePattern)}).test(${valueExpression})
            ) {
              recordError("valuePattern");
              return false;
            }
          `;
        }
      }
    }

    if (
      itemValue.minimumItems != null ||
      itemValue.maximumItems != null ||
      itemValue.uniqueItems != null ||
      itemValue.tupleItems != null ||
      itemValue.arrayItems != null
    ) {
      const trackElements = itemValue.uniqueItems ?? false;

      yield itt`
      if(
        Array.isArray(${valueExpression})
      ) {
        ${generateSubValidators()}
      }
    `;

      function* generateSubValidators() {
        if (itemValue.tupleItems != null) {
          yield itt`
            if(
              ${valueExpression}.length < ${JSON.stringify(itemValue.tupleItems.length)}
            ) {
              recordError("tupleItems");
              return false;
            }
          `;
        }

        if (itemValue.minimumItems != null) {
          yield itt`
            if(${valueExpression}.length < ${JSON.stringify(itemValue.minimumItems)}) {
              recordError("minimumItems");
              return false;
            }
          `;
        }

        if (itemValue.maximumItems != null) {
          yield itt`
            if(${valueExpression}.length > ${JSON.stringify(itemValue.maximumItems)}) {
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

        if (itemValue.uniqueItems ?? false) {
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
        if (itemValue.tupleItems != null) {
          for (let elementIndex = 0; elementIndex < itemValue.tupleItems.length; elementIndex++) {
            const elementKey = itemValue.tupleItems[elementIndex];
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
        if (itemValue.arrayItems != null) {
          yield itt`
            if(!withPath(String(elementIndex), () => {
              if(!${generateValidatorReference(itemValue.arrayItems, `elementValue`)}) {
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
      itemValue.minimumProperties != null ||
      itemValue.maximumProperties != null ||
      itemValue.required != null ||
      itemValue.objectProperties != null ||
      itemValue.patternProperties != null ||
      itemValue.mapProperties != null
    ) {
      const countProperties =
        itemValue.minimumProperties != null || itemValue.maximumProperties != null;

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
        for (const propertyName of itemValue.required ?? []) {
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

        if (itemValue.minimumProperties != null) {
          yield itt`
            if(propertyCount < ${JSON.stringify(itemValue.minimumProperties)}) {
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

        if (itemValue.maximumProperties != null) {
          yield itt`
            if(propertyCount > ${JSON.stringify(itemValue.maximumProperties)}) {
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
        if (itemValue.objectProperties != null) {
          for (const propertyName in itemValue.objectProperties) {
            yield itt`
              case ${JSON.stringify(propertyName)}:
                if(!withPath(propertyName, () => {
                  if(!${generateValidatorReference(
                    itemValue.objectProperties[propertyName],
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
        if (itemValue.patternProperties != null) {
          for (const propertyPattern in itemValue.patternProperties) {
            yield itt`
              if(new RegExp(${JSON.stringify(propertyPattern)}).test(propertyName)) {
                if(!withPath(propertyName, () => {
                  if(
                    !${generateValidatorReference(
                      itemValue.patternProperties[propertyPattern],
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

        if (itemValue.mapProperties != null) {
          yield itt`
            if(!withPath(propertyName, () => {
              if(
                !${generateValidatorReference(itemValue.mapProperties, `propertyValue`)}
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

    if (itemValue.reference != null) {
      yield itt`
        if(!${generateValidatorReference(itemValue.reference, valueExpression)}) {
          recordError("reference");
          return false;
        }
      `;
    }

    if (itemValue.allOf != null) {
      yield itt`
        {
          let counter = 0;

          ${generateInnerStatements()}

          if(counter < ${JSON.stringify(itemValue.allOf.length)}) {
            recordError("allOf");
            return false;
          }
        }
      `;

      function* generateInnerStatements() {
        assert(itemValue.allOf != null);

        for (let elementIndex = 0; elementIndex < itemValue.allOf.length; elementIndex++) {
          const element = itemValue.allOf[elementIndex];
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

    if (itemValue.anyOf != null) {
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
        assert(itemValue.anyOf != null);

        for (let elementIndex = 0; elementIndex < itemValue.anyOf.length; elementIndex++) {
          const element = itemValue.anyOf[elementIndex];
          yield itt`
            if(counter < 1 && ${generateValidatorReference(element, valueExpression)}) {
              counter += 1;
            }
          `;
        }
      }
    }

    if (itemValue.oneOf != null) {
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
        assert(itemValue.oneOf != null);

        for (let elementIndex = 0; elementIndex < itemValue.oneOf.length; elementIndex++) {
          const element = itemValue.oneOf[elementIndex];
          yield itt`
            if(counter < 2 && ${generateValidatorReference(element, valueExpression)}) {
              counter += 1;
            }
          `;
        }
      }
    }

    if (itemValue.if != null) {
      yield itt`
        if(${generateValidatorReference(itemValue.if, valueExpression)}) {
          ${generateInnerThenStatements()}
        }
        else {
          ${generateInnerElseStatements()}
        }
      `;

      function* generateInnerThenStatements() {
        if (itemValue.then != null) {
          yield itt`
            if(!${generateValidatorReference(itemValue.then, valueExpression)}) {
              recordError("then");
              return false;
            }
          `;
        }
      }

      function* generateInnerElseStatements() {
        if (itemValue.else != null) {
          yield itt`
            if(!${generateValidatorReference(itemValue.else, valueExpression)}) {
              recordError("else");
              return false;
            }
          `;
        }
      }
    }

    if (itemValue.not != null) {
      yield itt`
        if(${generateValidatorReference(itemValue.not, valueExpression)}) {
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
