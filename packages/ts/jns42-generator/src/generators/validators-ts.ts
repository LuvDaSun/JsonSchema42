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

  const { names, typeModels } = specification;

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

  for (const [typeKey, item] of Object.entries(typeModels)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const typeName = toPascal(names[nodeId]);
    const functionName = toCamel("is", names[nodeId]);
    const statements = generateValidatorStatements(specification, typeKey, "value");

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
  typeKey: string,
  valueExpression: string,
): Iterable<NestedText> {
  const { names, typeModels } = specification;
  const typeItem = typeModels[typeKey];
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
  typeKey: string,
  valueExpression: string,
): Iterable<NestedText> {
  const { names, typeModels } = specification;
  const typeItem = typeModels[typeKey];

  switch (typeItem.type) {
    case "unknown":
      yield itt`
        // unknown
        return true;
      `;
      break;

    case "any":
      yield itt`
          // any
          return true;
        `;
      break;

    case "never":
      yield itt`
        recordError("never");
        // never
        return false;
      `;
      break;

    case "null":
      yield itt`
        if(${valueExpression} !== null) {
          recordError("null");
          return false;
        }
        return true;
      `;
      break;

    case "boolean": {
      yield itt`
        if(typeof ${valueExpression} !== "boolean") {
          recordError("boolean");
          return false;
        }
      `;

      if (typeItem.options != null) {
        yield itt`
          if(${joinIterable(
            typeItem.options.map((option) => itt`${valueExpression} !== ${JSON.stringify(option)}`),
            " &&\n",
          )}) {
            recordError("options");
            return false;
          }
        `;
      }

      yield itt`
        return true;
      `;
      break;
    }

    case "integer":
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

      if (typeItem.options != null) {
        yield itt`
          if(${joinIterable(
            typeItem.options.map((option) => itt`${valueExpression} !== ${JSON.stringify(option)}`),
            " &&\n",
          )}) {
            recordError("options");
            return false;
          }
        `;
      }

      if (typeItem.minimumInclusive != null) {
        yield itt`
          if(
            ${valueExpression} < ${JSON.stringify(typeItem.minimumInclusive)}
          ) {
            recordError("minimumInclusive");
            return false;
          }
        `;
      }

      if (typeItem.minimumExclusive != null) {
        yield itt`
          if(
            ${valueExpression} <= ${JSON.stringify(typeItem.minimumExclusive)}
          ) {
            recordError("minimumExclusive");
            return false;
          }
        `;
      }

      if (typeItem.maximumInclusive != null) {
        yield itt`
          if(
            ${valueExpression} > ${JSON.stringify(typeItem.maximumInclusive)}
          ) {
            recordError("maximumInclusive");
            return false;
          }
        `;
      }

      if (typeItem.maximumExclusive != null) {
        yield itt`
          if(
            ${valueExpression} >= ${JSON.stringify(typeItem.maximumExclusive)}
          ) {
            recordError("maximumExclusive");
            return false;
          }
        `;
      }

      if (typeItem.multipleOf != null) {
        yield itt`
          if(
            ${valueExpression} % ${JSON.stringify(typeItem.multipleOf)} !== 0
          ) {
            recordError("multipleOf");
            return false;
          }
        `;
      }

      yield itt`
        return true;
      `;
      break;

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

      if (typeItem.options != null) {
        yield itt`
          if(${joinIterable(
            typeItem.options.map((option) => itt`${valueExpression} !== ${JSON.stringify(option)}`),
            " &&\n",
          )}) {
            recordError("options");
            return false;
          }
        `;
      }

      if (typeItem.minimumInclusive != null) {
        yield itt`
          if(
            ${valueExpression} < ${JSON.stringify(typeItem.minimumInclusive)}
          ) {
            recordError("minimumInclusive");
            return false;
          }
        `;
      }

      if (typeItem.minimumExclusive != null) {
        yield itt`
          if(
            ${valueExpression} <= ${JSON.stringify(typeItem.minimumExclusive)}
          ) {
            recordError("minimumExclusive");
            return false;
          }
        `;
      }

      if (typeItem.maximumInclusive != null) {
        yield itt`
          if(
            ${valueExpression} > ${JSON.stringify(typeItem.maximumInclusive)}
          ) {
            recordError("maximumInclusive");
            return false;
          }
        `;
      }

      if (typeItem.maximumExclusive != null) {
        yield itt`
          if(
            ${valueExpression} >= ${JSON.stringify(typeItem.maximumExclusive)}
          ) {
            recordError("maximumExclusive");
            return false;
          }
        `;
      }

      if (typeItem.multipleOf != null) {
        // TODO implement me!
      }

      yield itt`
        return true;
      `;
      break;
    }

    case "string":
      yield itt`
        if(
          typeof ${valueExpression} !== "string"
        ) {
          recordError("string");
          return false;
      }
      `;

      if (typeItem.options != null) {
        yield itt`
          if(${joinIterable(
            typeItem.options.map((option) => itt`${valueExpression} !== ${JSON.stringify(option)}`),
            " &&\n",
          )}) {
            recordError("options");
            return false;
          }
        `;
      }

      if (typeItem.minimumLength != null) {
        yield itt`
          if(
            ${valueExpression}.length < ${JSON.stringify(typeItem.minimumLength)}
          ) {
            recordError("minimumLength");
            return false;
          }
        `;
      }

      if (typeItem.maximumLength != null) {
        yield itt`
          if(
            value.length > ${JSON.stringify(typeItem.maximumLength)}
          ) {
            recordError("maximumLength");
            return false;
          }
        `;
      }

      for (const ruleValue of typeItem.valuePattern ?? []) {
        yield itt`
          if(
            !new RegExp(${JSON.stringify(ruleValue)}).test(${valueExpression})
          ) {
            recordError("valuePattern");
            return false;
          }
        `;
      }

      yield itt`
        return true;
      `;
      break;

    case "tuple": {
      const unique = typeItem.uniqueItems ?? false;

      yield itt`
        if(
          !Array.isArray(${valueExpression}) ||
          ${valueExpression}.length !== ${JSON.stringify(typeItem.elements.length)}
        ) {
          recordError("tuple");
          return false;
      }
      `;

      if (unique) {
        yield itt`
          const elementValueSeen = new Set<unknown>();
        `;
      }

      yield itt`
        for(let elementIndex = 0; elementIndex < ${valueExpression}.length; elementIndex ++) {
          const elementValue = ${valueExpression}[elementIndex];

          ${generateAdvancedElementRules()}
        }
      `;

      yield itt`
        return true;
      `;
      break;

      function* generateAdvancedElementRules() {
        if (unique) {
          yield itt`
            if(elementValueSeen.has(elementValue)) {
              recordError("uniqueItems");
              return false;
              }
          `;
        }

        yield itt`
          switch(elementIndex) {
            ${generateAdvancedElementCaseRules()}
          }
        `;

        if (unique) {
          yield itt`
            elementValueSeen.add(elementValue);
          `;
        }
      }

      function* generateAdvancedElementCaseRules() {
        assert(typeItem.type === "tuple");
        for (let elementIndex = 0; elementIndex < typeItem.elements.length; elementIndex++) {
          const elementKey = typeItem.elements[elementIndex];
          yield itt`
            case ${JSON.stringify(Number(elementIndex))}:
              currentPathPart = ${JSON.stringify(elementKey)};
              if(!${generateValidatorReference(specification, elementKey, `elementValue`)}) {
                recordError("elementValue");
                return false;
              }
              break;
          `;
        }
      }
    }

    case "array": {
      const unique = typeItem.uniqueItems ?? false;

      yield itt`
        if(!Array.isArray(${valueExpression})) {
          recordError("array");
          return false;
      }
      `;

      if (typeItem.minimumItems != null) {
        yield itt`
          if(${valueExpression}.length < ${JSON.stringify(typeItem.minimumItems)}) {
            recordError("minimumItems");
            return false;
          }
        `;
      }

      if (typeItem.maximumItems != null) {
        yield itt`
          if(${valueExpression}.length > ${JSON.stringify(typeItem.maximumItems)}) {
            recordError("maximumItems");
            return false;
          }
        `;
      }

      if (unique) {
        yield itt`
          const elementValueSeen = new Set<unknown>();
        `;
      }

      yield itt`
        for(let elementIndex = 0; elementIndex < ${valueExpression}.length; elementIndex ++) {
          ${generateAdvancedElementRules()}
        }
      `;

      yield itt`
        return true;
      `;

      break;

      function* generateAdvancedElementRules() {
        assert(typeItem.type === "array");

        yield itt`
          const elementValue = ${valueExpression}[elementIndex];
        `;

        if (unique) {
          yield itt`
            if(elementValueSeen.has(elementValue)) {
              recordError("uniqueItems");
              return false;
              }
            elementValueSeen.add(elementValue);
          `;
        }

        yield itt`
          currentPathPart = String(elementIndex);
          if(!${generateValidatorReference(specification, typeItem.element, `elementValue`)}) {
            recordError("elementValue");
            return false;
          }
        `;
      }
    }

    case "object": {
      const countProperties =
        typeItem.minimumProperties != null || typeItem.maximumProperties != null;

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
      for (const propertyName in typeItem.properties ?? []) {
        if (!typeItem.properties[propertyName].required) {
          continue;
        }
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
          ${generateAdvancedPropertyRules()}
        }
      `;

      if (countProperties) {
        if (typeItem.minimumProperties != null) {
          yield itt`
            if(propertyCount < ${JSON.stringify(typeItem.minimumProperties)}) {
              recordError("minimumProperties");
              return false;
              }
          `;
        }

        if (typeItem.maximumProperties != null) {
          yield itt`
            if(propertyCount > ${JSON.stringify(typeItem.maximumProperties)}) {
              recordError("maximumProperties");
              return false;
            }
          `;
        }
      }

      yield itt`
        return true;
      `;
      break;

      function* generateAdvancedPropertyRules() {
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

        yield itt`
          switch(propertyName) {
            ${generateAdvancedPropertyCaseRules()}
          }
        `;
      }

      function* generateAdvancedPropertyCaseRules() {
        assert(typeItem.type === "object");

        for (const propertyName in typeItem.properties) {
          yield itt`
            case ${JSON.stringify(propertyName)}:
              currentPathPart = propertyName;
              if(!${generateValidatorReference(
                specification,
                typeItem.properties[propertyName].element,
                `propertyValue`,
              )}) {
                recordError("propertyName");
                return false;
              }
              break;
          `;
        }
      }
    }

    case "map": {
      const countProperties =
        typeItem.minimumProperties != null || typeItem.maximumProperties != null;

      yield itt`
        if(
          ${valueExpression} === null ||
          typeof ${valueExpression} !== "object" ||
          Array.isArray(${valueExpression})
        ) {
          recordError("map");
          return false;
        }
      `;

      if (countProperties) {
        yield itt`
          let propertyCount = 0;
        `;
      }

      yield itt`
        for(const propertyName in ${valueExpression}) {
          ${generateAdvancedPropertyRules()}
        }
      `;

      if (countProperties) {
        if (typeItem.minimumProperties != null) {
          yield itt`
            if(propertyCount < ${JSON.stringify(typeItem.minimumProperties)}) {
              recordError("minimumProperties");
              return false;
            }
          `;
        }

        if (typeItem.maximumProperties != null) {
          yield itt`
            if(propertyCount > ${JSON.stringify(typeItem.maximumProperties)}) {
              recordError("maximumProperties");
              return false;
            }
          `;
        }
      }

      yield itt`
        return true;
      `;
      break;

      function* generateAdvancedPropertyRules() {
        assert(typeItem.type === "map");

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

        yield itt`
          if(!${generateValidatorReference(specification, typeItem.name, `propertyName`)}) {
            recordError("propertyName");
            return false;
          }
        `;

        yield itt`
          currentPathPart = propertyName;
          if(!${generateValidatorReference(specification, typeItem.element, `propertyValue`)}) {
            recordError("propertyValue");
            return false;
          }
        `;
      }
    }

    case "union": {
      yield itt`
        let count = 0;
      `;
      for (let elementIndex = 0; elementIndex < typeItem.elements.length; elementIndex++) {
        const element = typeItem.elements[elementIndex];
        yield itt`
          currentPathPart = ${JSON.stringify(String(elementIndex))}
          if(${generateValidatorReference(specification, element, valueExpression)}) {
            count++;
            if(count > 1) {
              recordError("union");
              return false;
            }
          }
        `;
      }
      yield itt`
        if(count < 1) {
          recordError("union");
          return false;
        }
        return true;
      `;
      break;
    }

    case "alias": {
      yield itt`
        currentPathPart = undefined;
        return (${generateValidatorReference(specification, typeItem.target, valueExpression)});
      `;
      break;
    }

    default:
      throw new TypeError(`type not supported`);
  }
}
