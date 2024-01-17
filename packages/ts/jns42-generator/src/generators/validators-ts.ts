import assert from "assert";
import * as models from "../models/index.js";
import {
  NestedText,
  banner,
  generateJsDocComments,
  itt,
  joinIterable,
  toCamel,
  toPascal,
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
    let currentPathPart: string | undefined = "";
    let currentTypeName: string | undefined;
    let errors = new Array<ValidationError>();

    export function getValidationErrors() {
      return errors;
    }

    export function getLastValidationError() {
      if(errors.length === 0) {
        throw new TypeError("no validation errors");
      }
      return errors[errors.length - 1];
    }

    function resetErrors() {
      errors = [];
    }

    function recordError(rule: string) {
      errors.push({
        path: pathPartStack.join("/"),
        typeName: currentTypeName,
        rule,
      })
    }
  `;

  for (const [itemKey, item] of validatorsArena) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const typeName = toPascal(names[nodeId]);
    const functionName = toCamel("is", names[nodeId]);
    const statements = generateValidatorStatements(specification, itemKey, "value");

    yield itt`
      ${generateJsDocComments(item)}
      export function ${functionName}(value: unknown): value is types.${typeName} {
        if(pathPartStack.length === 0) {
          resetErrors();
        }

        const typeName: string | undefined = currentTypeName;
        const pathPart = currentPathPart;
        try {
          currentTypeName = ${JSON.stringify(typeName)};
          if(pathPart != null) {
            pathPartStack.push(pathPart);
          }
          ${statements};
        }
        finally {
          currentTypeName = typeName;
          if(pathPart != null) {
            currentPathPart = pathPartStack.pop();
          }
        }
      }
    `;
  }
}

function* generateValidatorReference(
  specification: models.Specification,
  typeKey: number,
  valueExpression: string,
): Iterable<NestedText> {
  const { names, validatorsArena } = specification;
  const typeItem = validatorsArena.getItem(typeKey);
  if (typeItem.id == null) {
    yield itt`
      ((value: unknown) => {
        const typeName: string | undefined = currentTypeName;
        const pathPart = currentPathPart;
        try {
          currentTypeName = undefined;
          if(pathPart != null) {
            pathPartStack.push(pathPart);
          }
          ${generateValidatorStatements(specification, typeKey, "value")}
        }
        finally {
          currentTypeName = typeName;
          if(pathPart != null) {
            currentPathPart = pathPartStack.pop();
          }
        }
      })(${valueExpression})
    `;
  } else {
    const functionName = toCamel("is", names[typeItem.id]);
    yield itt`${functionName}(${valueExpression})`;
  }
}

function* generateValidatorStatements(
  specification: models.Specification,
  itemKey: number,
  valueExpression: string,
): Iterable<NestedText> {
  const { validatorsArena } = specification;
  const item = validatorsArena.getItem(itemKey);

  if (item.alias != null) {
    yield itt`
      currentPathPart = undefined;
      if(!${generateValidatorReference(specification, item.alias, valueExpression)}) {
        return false;
      };
    `;
  }

  if (item.options != null) {
    yield itt`
      if(${joinIterable(
        item.options.map((option) => itt`${valueExpression} !== ${JSON.stringify(option)}`),
        " &&\n",
      )}) {
        recordError("options");
        return false;
      }
    `;
  }

  for (const type of item.types ?? []) {
    switch (type) {
      case "any": {
        break;
      }

      case "never": {
        yield itt`
          recordError("never");
          return false;
        `;
        return;
      }

      case "null": {
        yield itt`
          if(${valueExpression} !== null) {
            recordError("null");
            return false;
          }
        `;
        break;
      }

      case "boolean": {
        yield itt`
          if(typeof ${valueExpression} !== "boolean") {
            recordError("boolean");
            return false;
          }
        `;
        break;
      }

      case "integer": {
        yield itt`
          if(
            typeof ${valueExpression} !== "number" ||
            isNaN(${valueExpression}) ||
            ${valueExpression} % 1 !== 0
          ) {
            recordError("integer");
            return false;
          }
        `;

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

        break;
      }

      case "number": {
        yield itt`
          if(
            typeof ${valueExpression} !== "number" ||
            isNaN(${valueExpression})
          ) {
            recordError("number");
            return false;
          }
        `;

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
          // TODO implement me!
        }

        break;
      }

      case "string": {
        yield itt`
          if(
            typeof ${valueExpression} !== "string"
          ) {
            recordError("string");
            return false;
          }
        `;

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

        // TODO switch on when supported by mocks!
        // for (const ruleValue of item.valuePattern ?? []) {
        //   yield itt`
        //     if(
        //       !new RegExp(${JSON.stringify(ruleValue)}).test(${valueExpression})
        //     ) {
        //       recordError("valuePattern");
        //       return false;
        //     }
        //   `;
        // }

        break;
      }

      case "array": {
        yield itt`
            if(!Array.isArray(${valueExpression})) {
              recordError("array");
              return false;
          }
          `;

        if (item.tupleItems != null) {
          yield itt`
            if(
              ${valueExpression}.length !== ${JSON.stringify(item.tupleItems.length)}
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

        const trackElements = item.uniqueItems ?? false;
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

        break;

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
                  currentPathPart = String(elementIndex);
                  if(!${generateValidatorReference(specification, elementKey, `elementValue`)}) {
                    recordError("elementValue");
                    return false;
                  }
                  break;
              `;
            }
          }

          yield itt`
            default:
              ${generateDefaultCaseContent()}
              break;
          `;
        }

        function* generateDefaultCaseContent() {
          if (item.arrayItems != null) {
            yield itt`
              currentPathPart = String(elementIndex);
              if(!${generateValidatorReference(specification, item.arrayItems, `elementValue`)}) {
                recordError("elementValue");
                return false;
              }
              break;
            `;
          }
        }
      }

      case "map": {
        const countProperties = item.minimumProperties != null || item.maximumProperties != null;

        yield itt`
            if(
              ${valueExpression} === null ||
              typeof ${valueExpression} !== "object" ||
              Array.isArray(${valueExpression})
            ) {
              recordError("object");
              return false;
          }
          `;

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

        break;

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
                  currentPathPart = propertyName;
                  if(!${generateValidatorReference(
                    specification,
                    item.objectProperties[propertyName],
                    `propertyValue`,
                  )}) {
                    recordError("objectProperties");
                    return false;
                  }
                  break;
              `;
            }

            yield itt`
              default:
                ${generateDefaultCaseContent()}
                break;
            `;
          }
        }

        function* generateDefaultCaseContent() {
          if (item.patternProperties != null) {
            for (const propertyPattern in item.patternProperties) {
              yield itt`
                if(
                  new RegExp(${JSON.stringify(propertyPattern)}).test(propertyName) &&
                  !${generateValidatorReference(
                    specification,
                    item.patternProperties[propertyPattern],
                    `propertyValue`,
                  )}
                ) {
                  return false;
                }  
              `;
            }
          }

          if (item.mapProperties != null) {
            yield itt`
              if(
                !${generateValidatorReference(specification, item.mapProperties, `propertyValue`)}
              ) {
                return false;
              }  
            `;
          }
        }
      }
    }
  }

  if (item.reference != null) {
    yield itt`
      if(!${generateValidatorReference(specification, item.reference, valueExpression)}) {
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
          currentPathPart = ${JSON.stringify(String(elementIndex))}
          if(counter === ${JSON.stringify(elementIndex)} && ${generateValidatorReference(
            specification,
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
          currentPathPart = ${JSON.stringify(String(elementIndex))}
          if(counter < 1 && ${generateValidatorReference(
            specification,
            element,
            valueExpression,
          )}) {
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
          currentPathPart = ${JSON.stringify(String(elementIndex))}
          if(!${generateValidatorReference(specification, element, valueExpression)}) {
            counter += 1;
          }
        `;
      }
    }
  }

  if (item.if != null) {
    yield itt`
      if(${generateValidatorReference(specification, item.if, valueExpression)}) {
        ${generateInnerThenStatements()}
      }
      else {
        ${generateInnerElseStatements()}
      }
    `;

    function* generateInnerThenStatements() {
      if (item.then != null) {
        yield itt`
          if(!${generateValidatorReference(specification, item.then, valueExpression)}) {
            recordError("then");
            return false;
          }
        `;
      }
    }

    function* generateInnerElseStatements() {
      if (item.else != null) {
        yield itt`
          if(!${generateValidatorReference(specification, item.else, valueExpression)}) {
            recordError("else");
            return false;
          }
        `;
      }
    }
  }

  if (item.not != null) {
    yield itt`
      if(${generateValidatorReference(specification, item.not, valueExpression)}) {
        recordError("not");
        return false;
      }
    `;
  }

  yield itt`
    return true;
  `;
}
