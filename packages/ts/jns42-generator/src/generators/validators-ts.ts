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
      yield itt`typeof ${valueExpression} === "number" && !isNaN(${valueExpression}) && ${valueExpression} % 1 === 0`;

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
      yield itt`typeof ${valueExpression} === "number" && !isNaN(${valueExpression})`;

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

      yield itt`Array.isArray(${valueExpression}) && ${valueExpression}.length === ${JSON.stringify(
        typeItem.elements.length,
      )}`;

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
        `;
        return true;
      }

      function* generateAdvancedElementRules() {
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
          switch(elementIndex) {
            ${generateAdvancedElementCaseRules()}
          }
        `;
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

      yield itt`${valueExpression} !== null && typeof ${valueExpression} === "object" && !Array.isArray(${valueExpression})`;

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

      yield itt`${valueExpression} !== null && typeof ${valueExpression} === "object" && !Array.isArray(${valueExpression})`;

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

function* generateMapTypeValidationStatements(specification: models.Specification, nodeId: string) {
  const { nodes } = specification;
  const node = nodes[nodeId];

  const hasPropertyCounter = node.minimumProperties != null || node.maximumProperties != null;

  yield itt`
    if(typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
    }
  `;

  /**
   * we want to count the properties
   */
  if (hasPropertyCounter) {
    yield itt`
      let propertyCount = 0;
    `;
  }

  /**
   * check if all the required properties are present
   */
  for (const propertyName of node.required ?? []) {
    yield itt`
      if(!(${JSON.stringify(propertyName)} in value)) {
        return false;
      }
    `;
  }

  /**
   * loop through all the properties to validate em
   */
  yield itt`
    for(const propertyName in value) {
      ${generateMapTypeItemValidationStatements(specification, nodeId)}
    }
  `;

  /**
   * property count validation
   */
  if (hasPropertyCounter) {
    if (node.minimumProperties != null) {
      yield itt`
        if(propertyCount < ${JSON.stringify(node.minimumProperties)}) {
          return false;
        }
      `;
    }

    if (node.maximumProperties != null) {
      yield itt`
        if(propertyCount > ${JSON.stringify(node.maximumProperties)}) {
          return false;
        }
      `;
    }
  }

  yield itt`
    return true;
  `;
}
function* generateMapTypeItemValidationStatements(
  specification: models.Specification,
  nodeId: string,
) {
  const { nodes, names } = specification;
  const node = nodes[nodeId];

  const hasPropertyCounter = node.minimumProperties != null || node.maximumProperties != null;

  if (hasPropertyCounter) {
    yield itt`
      propertyCount++;
    `;
  }

  yield itt`
    const propertyValue = value[propertyName as keyof typeof value];

    if(propertyValue === undefined) {
      continue;
    }
  `;

  if (node.objectProperties != null) {
    yield itt`
      switch(propertyName) {
        ${generateMapTypeItemCaseClausesValidationStatements(specification, nodeId)}
      }
    `;
  }

  if (node.patternProperties != null) {
    for (const [pattern, typeNodeId] of Object.entries(node.patternProperties)) {
      const validatorFunctionName = toCamel("is", names[typeNodeId]);

      yield itt`
        if(new RegExp(${JSON.stringify(pattern)}).test(propertyName)) {
          if(!${validatorFunctionName}(propertyValue)) {
            return false;
          }
          continue;
        }
      `;
    }
  }

  if (node.propertyNames != null) {
    const validatorFunctionName = toCamel("is", names[node.propertyNames]);

    yield itt`
      if(!${validatorFunctionName}(propertyName)) {
        return false;
      }
      continue;
    `;
  }

  if (node.mapProperties != null) {
    const validatorFunctionName = toCamel("is", names[node.mapProperties]);

    yield itt`
      if(!${validatorFunctionName}(propertyValue)) {
        return false;
      }
      continue;
    `;
  }
}
function* generateMapTypeItemCaseClausesValidationStatements(
  specification: models.Specification,
  nodeId: string,
) {
  const { nodes, names } = specification;
  const node = nodes[nodeId];

  if (node.objectProperties == null) {
    return;
  }

  for (const propertyName in node.objectProperties) {
    const propertyTypeNodeId = node.objectProperties[propertyName];
    const validatorFunctionName = toCamel("is", names[propertyTypeNodeId]);

    yield itt`
      case ${JSON.stringify(propertyName)}:
        if(!${validatorFunctionName}(propertyValue)) {
          return false;
        }
        continue;
    `;
  }
}

function* generateReferenceCompoundValidationStatements(
  specification: models.Specification,
  reference: string,
) {
  const { nodes, names } = specification;
  const validatorFunctionName = toCamel("is", names[reference]);

  yield itt`
    if(!${validatorFunctionName}(value)) {
      return false;
    }
  `;

  yield itt`
    return true;
  `;
}
function* generateOneOfCompoundValidationStatements(
  specification: models.Specification,
  oneOf: string[],
) {
  const { nodes, names } = specification;

  yield itt`
    let validCounter = 0;
  `;

  for (const typeNodeId of oneOf) {
    const validatorFunctionName = toCamel("is", names[typeNodeId]);

    yield itt`
      if(${validatorFunctionName}(value)) {
        validCounter++;
      }

      if(validCounter > 1) {
        return false
      }
    `;
  }

  yield itt`
    if(validCounter < 1) {
      return false
    }
  `;

  yield itt`
    return true;
  `;
}
function* generateAnyOfCompoundValidationStatements(
  specification: models.Specification,
  anyOf: string[],
) {
  const { nodes, names } = specification;

  for (const typeNodeId of anyOf) {
    const validatorFunctionName = toCamel("is", names[typeNodeId]);

    yield itt`
      if(${validatorFunctionName}(value)) {
        return true;
      }
    `;
  }

  yield itt`
    return false;
  `;
}
function* generateAllOfCompoundValidationStatements(
  specification: models.Specification,
  allOf: string[],
) {
  const { nodes, names } = specification;

  for (const typeNodeId of allOf) {
    const validatorFunctionName = toCamel("is", names[typeNodeId]);

    yield itt`
      if(!${validatorFunctionName}(value)) {
        return false;
      }
    `;
  }

  yield itt`
    return true;
  `;
}
function* generateIfCompoundValidationStatements(
  specification: models.Specification,
  $if: string,
  then?: string,
  $else?: string,
) {
  const { nodes, names } = specification;
  const ifValidatorFunctionName = toCamel("is", names[$if]);

  if (then != null && $else != null) {
    const thenValidatorFunctionName = toCamel("is", names[then]);
    const elseValidatorFunctionName = toCamel("is", names[$else]);

    itt`
      if(${ifValidatorFunctionName}(value)) {
        if(!${thenValidatorFunctionName}(value)) {
          return false;
        }
      }
      else {
        if(!${elseValidatorFunctionName}(value)) {
          return false;
        }
      }
    `;
  }

  if (then != null && $else == null) {
    const thenValidatorFunctionName = toCamel("is", names[then]);

    itt`
      if(${ifValidatorFunctionName}(value)) {
        if(!${thenValidatorFunctionName}(value)) {
          return false;
        }
      }
    `;
  }

  if (then == null && $else != null) {
    const elseValidatorFunctionName = toCamel("is", names[$else]);

    itt`
      if(!${ifValidatorFunctionName}(value)) {
        if(!${elseValidatorFunctionName}(value)) {
          return false;
        }
      }
    `;
  }

  yield itt`
    return true;
  `;
}
function* generateNotCompoundValidationStatements(
  specification: models.Specification,
  not: string,
) {
  const { nodes, names } = specification;
  const validatorFunctionName = toCamel("is", names[not]);

  yield itt`
    if(${validatorFunctionName}(value)) {
      return false;
    }
  `;

  yield itt`
    return true;
  `;
}
