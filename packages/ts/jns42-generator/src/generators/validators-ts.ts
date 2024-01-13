import assert from "assert";
import * as models from "../models/index.js";
import {
  NestedText,
  banner,
  generateJsDocComments,
  itt,
  joinIterable,
  mapIterable,
  toCamel,
  toPascal,
} from "../utils/index.js";

export function* generateValidatorsTsCode(specification: models.Specification) {
  yield banner;

  const { names, types } = specification;

  yield itt`
    import * as types from "./types.js";
  `;

  for (const [typeKey, item] of Object.entries(types)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const typeName = toPascal(names[nodeId]);
    const functionName = toCamel("is", names[nodeId]);
    const definition = generateValidatorDefinition(specification, typeKey, "value");

    yield itt`
      ${generateJsDocComments(item)}
      export function ${functionName}(value: unknown): value is types.${typeName} {
        return (${definition});
      }
    `;
  }
}

function* generateValidatorReference(
  specification: models.Specification,
  typeKey: string,
  valueExpression: string,
): Iterable<NestedText> {
  const { names, types } = specification;
  const typeItem = types[typeKey];
  if (typeItem.id == null) {
    yield itt`${generateValidatorDefinition(specification, typeKey, valueExpression)}`;
  } else {
    const functionName = toCamel("is", names[typeItem.id]);
    yield itt`${functionName}(${valueExpression})`;
  }
}

function* generateValidatorDefinition(
  specification: models.Specification,
  typeKey: string,
  valueExpression: string,
): Iterable<NestedText> {
  yield* joinIterable(
    mapIterable(generateRules(specification, typeKey, valueExpression), (text) => itt`(${text})`),
    " &&\n",
  );
}

function* generateRules(
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
        true
      `;
      break;

    case "any":
      yield itt`
        // any
        true
      `;
      break;

    case "null":
      yield itt`${valueExpression} === null`;
      break;

    case "boolean": {
      yield itt`typeof ${valueExpression} === "boolean"`;

      if (typeItem.options != null) {
        yield joinIterable(
          typeItem.options.map((option) => itt`${valueExpression} === ${JSON.stringify(option)}`),
          " ||\n",
        );
      }
      break;
    }

    case "integer":
      yield itt`typeof ${valueExpression} === "number"`;
      yield itt`!isNaN(${valueExpression})`;
      yield itt`${valueExpression} % 1 === 0`;

      if (typeItem.options != null) {
        yield joinIterable(
          typeItem.options.map((option) => itt`${valueExpression} === ${JSON.stringify(option)}`),
          " ||\n",
        );
      }

      if (typeItem.minimumInclusive != null) {
        yield itt`${valueExpression} >= ${JSON.stringify(typeItem.minimumInclusive)}`;
      }

      if (typeItem.minimumExclusive != null) {
        yield itt`${valueExpression} > ${JSON.stringify(typeItem.minimumExclusive)}`;
      }

      if (typeItem.maximumInclusive != null) {
        yield itt`${valueExpression} <= ${JSON.stringify(typeItem.maximumInclusive)}`;
      }

      if (typeItem.maximumExclusive != null) {
        yield itt`${valueExpression} < ${JSON.stringify(typeItem.maximumExclusive)}`;
      }

      for (const ruleValue of typeItem.multipleOf ?? []) {
        yield itt`${valueExpression} % ${JSON.stringify(ruleValue)} === 0`;
      }

      break;

    case "number": {
      yield itt`typeof ${valueExpression} === "number"`;
      yield itt`!isNaN(${valueExpression})`;

      if (typeItem.options != null) {
        yield joinIterable(
          typeItem.options.map((option) => itt`${valueExpression} === ${JSON.stringify(option)}`),
          " ||\n",
        );
      }

      if (typeItem.minimumInclusive != null) {
        yield itt`${valueExpression} >= ${JSON.stringify(typeItem.minimumInclusive)}`;
      }

      if (typeItem.minimumExclusive != null) {
        yield itt`${valueExpression} > ${JSON.stringify(typeItem.minimumExclusive)}`;
      }

      if (typeItem.maximumInclusive != null) {
        yield itt`${valueExpression} <= ${JSON.stringify(typeItem.maximumInclusive)}`;
      }

      if (typeItem.maximumExclusive != null) {
        yield itt`${valueExpression} < ${JSON.stringify(typeItem.maximumExclusive)}`;
      }

      for (const ruleValue of typeItem.multipleOf ?? []) {
        yield itt`${valueExpression} % ${JSON.stringify(ruleValue)} === 0`;
      }

      break;
    }

    case "string":
      yield itt`typeof ${valueExpression} === "string"`;

      if (typeItem.options != null) {
        yield joinIterable(
          typeItem.options.map((option) => itt`${valueExpression} === ${JSON.stringify(option)}`),
          " ||\n",
        );
      }

      if (typeItem.minimumLength != null) {
        yield itt`${valueExpression}.length >= ${JSON.stringify(typeItem.minimumLength)}`;
      }

      if (typeItem.maximumLength != null) {
        yield itt`value.length <= ${JSON.stringify(typeItem.maximumLength)}`;
      }

      for (const rulevalue of typeItem.valuePattern ?? []) {
        yield itt`new RegExp(${JSON.stringify(rulevalue)}).test(${valueExpression})`;
      }

      break;

    case "tuple": {
      const unique = typeItem.uniqueItems ?? false;

      yield itt`Array.isArray(${valueExpression})`;
      yield itt`${valueExpression}.length === ${JSON.stringify(typeItem.elements.length)}`;

      yield itt`
        (()=>{
          ${generateAdvancedRules()}
        })()
      `;
      break;

      function* generateAdvancedRules() {
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
      }

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
              if(!${generateValidatorReference(specification, elementKey, `elementValue`)}) {
                return false;
              }
              break;
          `;
        }
      }
    }

    case "array": {
      const unique = typeItem.uniqueItems ?? false;

      yield itt`Array.isArray(${valueExpression})`;

      if (typeItem.minimumItems != null) {
        yield itt`${valueExpression}.length >= ${JSON.stringify(typeItem.minimumItems)}`;
      }

      if (typeItem.maximumItems != null) {
        yield itt`${valueExpression}.length <= ${JSON.stringify(typeItem.maximumItems)}`;
      }

      yield itt`
        (()=>{
          ${generateAdvancedRules()}
        })()
      `;
      break;

      function* generateAdvancedRules() {
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
      }

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
          if(!${generateValidatorReference(specification, typeItem.element, `elementValue`)}) {
            return false;
          }
        `;
      }
    }

    case "object": {
      const countProperties =
        typeItem.minimumProperties != null || typeItem.maximumProperties != null;

      yield itt`${valueExpression} !== null`;
      yield itt`typeof ${valueExpression} === "object"`;
      yield itt`!Array.isArray(${valueExpression})`;

      /**
       * check if all the required properties are present
       */
      for (const propertyName in typeItem.properties ?? []) {
        if (!typeItem.properties[propertyName].required) {
          continue;
        }
        yield itt`${JSON.stringify(propertyName)} in ${valueExpression}`;
        yield itt`${valueExpression}[${JSON.stringify(propertyName)}] !== undefined`;
      }

      yield itt`
        (()=>{
          ${generateAdvancedRules()}
        })()
      `;
      break;

      function* generateAdvancedRules() {
        assert(typeItem.type === "object");

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
      }

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

      yield itt`${valueExpression} !== null`;
      yield itt`typeof ${valueExpression} === "object"`;
      yield itt`!Array.isArray(${valueExpression})`;

      yield itt`
        (()=>{
          ${generateAdvancedRules()}
        })()
      `;
      break;

      function* generateAdvancedRules() {
        assert(typeItem.type === "map");
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
      }

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
          if(!${generateValidatorReference(specification, typeItem.element, `propertyValue`)}) {
            return false;
          }
        `;
      }
    }

    case "union": {
      yield itt`
        (()=>{
          ${generateAdvancedRules()}
        })()
      `;
      break;

      function* generateAdvancedRules() {
        assert(typeItem.type === "union");

        yield itt`
          let count = 0;
        `;
        for (const element of typeItem.elements) {
          yield itt`
            if(${generateValidatorReference(specification, element, valueExpression)}) {
              count++;
              // if(count > 1) {
              //   return false;
              // }
            }
          `;
        }
        yield itt`
          return count === 1;
        `;
      }
    }

    case "alias": {
      yield generateValidatorReference(specification, typeItem.target, valueExpression);
      break;
    }

    default:
      throw new TypeError(`${typeItem.type} not supported`);
  }
}
