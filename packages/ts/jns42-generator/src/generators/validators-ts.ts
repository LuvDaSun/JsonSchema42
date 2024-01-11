import assert from "assert";
import * as models from "../models/index.js";
import {
  NestedText,
  banner,
  itt,
  joinIterable,
  mapIterable,
  toCamel,
  toPascal,
} from "../utils/index.js";

const rules = {
  minimumInclusive: undefined,
  minimumExclusive: undefined,
  maximumInclusive: undefined,
  maximumExclusive: undefined,
  multipleOf: undefined,
  minimumLength: undefined,
  maximumLength: undefined,
  valuePattern: undefined,
  required: [],
  unique: undefined,
  minimumProperties: undefined,
  maximumProperties: undefined,
  minimumItems: undefined,
  maximumItems: undefined,
};

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
      // ${nodeId}
    `;

    yield itt`
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

      if (rules.minimumInclusive != null) {
        yield itt`${valueExpression} >= ${JSON.stringify(rules.minimumInclusive)}`;
      }

      if (rules.minimumExclusive != null) {
        yield itt`${valueExpression} > ${JSON.stringify(rules.minimumExclusive)}`;
      }

      if (rules.maximumInclusive != null) {
        yield itt`${valueExpression} <= ${JSON.stringify(rules.maximumInclusive)}`;
      }

      if (rules.maximumExclusive != null) {
        yield itt`${valueExpression} < ${JSON.stringify(rules.maximumExclusive)}`;
      }

      if (rules.multipleOf != null) {
        yield itt`${valueExpression} % ${JSON.stringify(rules.multipleOf)} === 0`;
      }

      break;

    case "number": {
      yield itt`typeof ${valueExpression}`;
      yield itt`!isNaN(${valueExpression})`;

      if (typeItem.options != null) {
        yield joinIterable(
          typeItem.options.map((option) => itt`${valueExpression} === ${JSON.stringify(option)}`),
          " ||\n",
        );
      }

      if (rules.minimumInclusive != null) {
        yield itt`${valueExpression} >= ${JSON.stringify(rules.minimumInclusive)}`;
      }

      if (rules.minimumExclusive != null) {
        yield itt`${valueExpression} > ${JSON.stringify(rules.minimumExclusive)}`;
      }

      if (rules.maximumInclusive != null) {
        yield itt`${valueExpression} <= ${JSON.stringify(rules.maximumInclusive)}`;
      }

      if (rules.maximumExclusive != null) {
        yield itt`${valueExpression} < ${JSON.stringify(rules.maximumExclusive)}`;
      }

      if (rules.multipleOf != null) {
        yield itt`${valueExpression} % ${JSON.stringify(rules.multipleOf)} === 0`;
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

      if (rules.minimumLength != null) {
        yield itt`${valueExpression}.length >= ${JSON.stringify(rules.minimumLength)}`;
      }

      if (rules.maximumLength != null) {
        yield itt`value.length <= ${JSON.stringify(rules.maximumLength)}`;
      }

      if (rules.valuePattern != null) {
        yield itt`new RegExp(${JSON.stringify(rules.valuePattern)}).test(${valueExpression})`;
      }

      break;

    case "tuple": {
      const unique = rules.unique ?? false;

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
        return true;
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
      const unique = rules.unique ?? false;

      yield itt`Array.isArray(${valueExpression})`;

      if (rules.minimumItems != null) {
        yield itt`${valueExpression}.length >= ${JSON.stringify(rules.minimumItems)}`;
      }

      if (rules.minimumItems != null) {
        yield itt`${valueExpression}.length <= ${JSON.stringify(rules.maximumItems)}`;
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
      const countProperties = rules.minimumProperties != null || rules.maximumProperties != null;

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
          if (rules.minimumProperties != null) {
            yield itt`
              if(propertyCount < ${JSON.stringify(rules.minimumProperties)}) {
                return false;
              }
            `;
          }

          if (rules.maximumProperties != null) {
            yield itt`
              if(propertyCount > ${JSON.stringify(rules.maximumProperties)}) {
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
      const countProperties = rules.minimumProperties != null || rules.maximumProperties != null;

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
          if (rules.minimumProperties != null) {
            yield itt`
              if(propertyCount < ${JSON.stringify(rules.minimumProperties)}) {
                return false;
              }
            `;
          }

          if (rules.maximumProperties != null) {
            yield itt`
              if(propertyCount > ${JSON.stringify(rules.maximumProperties)}) {
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
      yield joinIterable(
        typeItem.elements.map(
          (element) => itt`${generateValidatorReference(specification, element, valueExpression)}`,
        ),
        " ||\n",
      );
      break;
    }

    default:
      throw new TypeError(`${typeItem.type} not supported`);
  }
}
