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

  const { names, types } = specification;

  yield itt`
    import * as types from "./types.js";
  `;

  yield itt`
    const currentPath = new Array<string>();
  `;

  for (const [typeKey, item] of Object.entries(types)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const typeName = toPascal(names[nodeId]);
    const functionName = toCamel("is", names[nodeId]);
    const statements = generateValidatorStatements(specification, typeKey, "value");

    yield itt`
      ${generateJsDocComments(item)}
      export function ${functionName}(value: unknown, pathPart?: string): value is types.${typeName} {
        try {
          if(pathPart != null) {
            currentPath.push(pathPart);
          }
          ${statements};
        }
        finally {
          if(pathPart != null) {
            currentPath.pop();
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
  pathExpression: string = "null",
): Iterable<NestedText> {
  const { names, types } = specification;
  const typeItem = types[typeKey];
  if (typeItem.id == null) {
    yield itt`
      (() => {
        try {
          if(${pathExpression} != null) {
            currentPath.push(${pathExpression});
          }
          ${generateValidatorStatements(specification, typeKey, valueExpression)}
        }
        finally {
          if(${pathExpression} != null) {
            currentPath.pop();
          }
        }
      })()
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
  const { names, types } = specification;
  const typeItem = types[typeKey];

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
        // never
        return false;
      `;
      break;

    case "null":
      yield itt`
        return ${valueExpression} === null;
      `;
      break;

    case "boolean": {
      yield itt`
        if(typeof ${valueExpression} !== "boolean") {
          return false;
        }
      `;

      if (typeItem.options != null) {
        yield itt`
          if(${joinIterable(
            typeItem.options.map((option) => itt`${valueExpression} !== ${JSON.stringify(option)}`),
            " &&\n",
          )}) {
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
          return false;
        }
      `;

      if (typeItem.options != null) {
        yield itt`
          if(${joinIterable(
            typeItem.options.map((option) => itt`${valueExpression} !== ${JSON.stringify(option)}`),
            " &&\n",
          )}) {
            return false;
          }
        `;
      }

      if (typeItem.minimumInclusive != null) {
        yield itt`
          if(
            ${valueExpression} < ${JSON.stringify(typeItem.minimumInclusive)}
          ) {
            return false;
          }
        `;
      }

      if (typeItem.minimumExclusive != null) {
        yield itt`
          if(
            ${valueExpression} <= ${JSON.stringify(typeItem.minimumExclusive)}
          ) {
            return false;
          }
        `;
      }

      if (typeItem.maximumInclusive != null) {
        yield itt`
          if(
            ${valueExpression} > ${JSON.stringify(typeItem.maximumInclusive)}
          ) {
            return false;
          }
        `;
      }

      if (typeItem.maximumExclusive != null) {
        yield itt`
          if(
            ${valueExpression} >= ${JSON.stringify(typeItem.maximumExclusive)}
          ) {
            return false;
          }
        `;
      }

      if (typeItem.multipleOf != null) {
        yield itt`
          if(
            ${valueExpression} % ${JSON.stringify(typeItem.multipleOf)} !== 0
          ) {
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
        return false;
      }
    `;

      if (typeItem.options != null) {
        yield itt`
          if(${joinIterable(
            typeItem.options.map((option) => itt`${valueExpression} !== ${JSON.stringify(option)}`),
            " &&\n",
          )}) {
            return false;
          }
        `;
      }

      if (typeItem.minimumInclusive != null) {
        yield itt`
          if(
            ${valueExpression} < ${JSON.stringify(typeItem.minimumInclusive)}
          ) {
            return false;
          }
        `;
      }

      if (typeItem.minimumExclusive != null) {
        yield itt`
          if(
            ${valueExpression} <= ${JSON.stringify(typeItem.minimumExclusive)}
          ) {
            return false;
          }
        `;
      }

      if (typeItem.maximumInclusive != null) {
        yield itt`
          if(
            ${valueExpression} > ${JSON.stringify(typeItem.maximumInclusive)}
          ) {
            return false;
          }
        `;
      }

      if (typeItem.maximumExclusive != null) {
        yield itt`
          if(
            ${valueExpression} >= ${JSON.stringify(typeItem.maximumExclusive)}
          ) {
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
          return false;
        }
      `;

      if (typeItem.options != null) {
        yield itt`
          if(${joinIterable(
            typeItem.options.map((option) => itt`${valueExpression} !== ${JSON.stringify(option)}`),
            " &&\n",
          )}) {
            return false;
          }
        `;
      }

      if (typeItem.minimumLength != null) {
        yield itt`
          if(
            ${valueExpression}.length < ${JSON.stringify(typeItem.minimumLength)}
          ) {
            return false;
          }
        `;
      }

      if (typeItem.maximumLength != null) {
        yield itt`
          if(
            value.length > ${JSON.stringify(typeItem.maximumLength)}
          ) {
            return false;
          }
        `;
      }

      for (const ruleValue of typeItem.valuePattern ?? []) {
        yield itt`
          if(
            !new RegExp(${JSON.stringify(ruleValue)}).test(${valueExpression})
          ) {
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
        if(!Array.isArray(${valueExpression})) {
          return false;
        }
      `;
      yield itt`
        if(${valueExpression}.length !== ${JSON.stringify(typeItem.elements.length)}) {
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
              if(!${generateValidatorReference(
                specification,
                elementKey,
                `elementValue`,
                JSON.stringify(elementKey),
              )}) {
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
          return false;
        }
      `;

      if (typeItem.minimumItems != null) {
        yield itt`
          if(${valueExpression}.length < ${JSON.stringify(typeItem.minimumItems)}) {
            return false;
          }
        `;
      }

      if (typeItem.maximumItems != null) {
        yield itt`
          if(${valueExpression}.length > ${JSON.stringify(typeItem.maximumItems)}) {
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
              return false;
            }
            elementValueSeen.add(elementValue);
          `;
        }

        yield itt`
          if(!${generateValidatorReference(
            specification,
            typeItem.element,
            `elementValue`,
            "String(elementIndex)",
          )}) {
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
              return false;
            }
          `;
        }

        if (typeItem.maximumProperties != null) {
          yield itt`
            if(propertyCount > ${JSON.stringify(typeItem.maximumProperties)}) {
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
              if(!${generateValidatorReference(
                specification,
                typeItem.properties[propertyName].element,
                `propertyValue`,
                "propertyName",
              )}) {
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
              return false;
            }
          `;
        }

        if (typeItem.maximumProperties != null) {
          yield itt`
            if(propertyCount > ${JSON.stringify(typeItem.maximumProperties)}) {
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
            return false;
          }
        `;

        yield itt`
          if(!${generateValidatorReference(
            specification,
            typeItem.element,
            `propertyValue`,
            "propertyName",
          )}) {
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
          if(${generateValidatorReference(
            specification,
            element,
            valueExpression,
            JSON.stringify(String(elementIndex)),
          )}) {
            count++;
            if(count > 1) {
              return false;
            }
          }
        `;
      }
      yield itt`
        return count === 1;
      `;
      break;
    }

    case "alias": {
      yield itt`
        return (${generateValidatorReference(specification, typeItem.target, valueExpression)});
      `;
      break;
    }

    default:
      throw new TypeError(`type not supported`);
  }
}
