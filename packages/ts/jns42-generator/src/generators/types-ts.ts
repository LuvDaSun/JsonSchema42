import * as models from "../models/index.js";
import {
  NestedText,
  banner,
  choose,
  itt,
  joinIterable,
  mapIterable,
  toPascal,
} from "../utils/index.js";

export function* generateTypesTsCode(specification: models.Specification) {
  yield banner;

  for (const nodeId in specification.nodes) {
    const node = specification.nodes[nodeId];
    const typeName = toPascal(specification.names[nodeId]);

    const typeDefinition = generateDeclaration(specification, nodeId);

    const comments = [
      node.title ?? "",
      node.description ?? "",
      node.deprecated ? "@deprecated" : "",
    ]
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    yield itt`
        // ${nodeId}
      `;

    if (comments.length > 0) {
      yield itt`
        /**
        ${comments}
        */
      `;
    }
    yield itt`
      export type ${typeName} = ${typeDefinition};
    `;
  }
}

function* generateDeclaration(specification: models.Specification, nodeId: string) {
  const typeElements = [...generateTypeDefinitionElements(specification, nodeId)];
  const compoundElements = [...generateCompoundDefinitionElements(specification, nodeId)];

  if (typeElements.length > 0) {
    compoundElements.push(
      joinIterable(
        mapIterable(typeElements, (element) => itt`(${element})`),
        " |\n",
      ),
    );
  }

  if (compoundElements.length > 0) {
    yield joinIterable(
      mapIterable(compoundElements, (element) => itt`(${element})`),
      " &\n",
    );
    return;
  }

  yield "unknown";
}

function* generateTypeDefinitionElements(specification: models.Specification, nodeId: string) {
  const node = specification.nodes[nodeId];
  for (const type of node.types) {
    switch (type) {
      case "never":
        yield* generateNeverTypeDefinition(specification, nodeId);
        break;

      case "any":
        yield* generateAnyTypeDefinition(specification, nodeId);
        break;

      case "null":
        yield* generateNullTypeDefinition(specification, nodeId);
        break;

      case "boolean":
        yield* generateBooleanTypeDefinition(specification, nodeId);
        break;

      case "integer":
        yield* generateIntegerTypeDefinition(specification, nodeId);
        break;

      case "number":
        yield* generateNumberTypeDefinition(specification, nodeId);
        break;

      case "string":
        yield* generateStringTypeDefinition(specification, nodeId);
        break;

      case "array":
        yield* generateArrayTypeDefinition(specification, nodeId);
        break;

      case "map":
        yield* generateMapTypeDefinition(specification, nodeId);
        break;

      default:
        throw new Error("type not supported");
    }
  }
}
function* generateCompoundDefinitionElements(specification: models.Specification, nodeId: string) {
  const node = specification.nodes[nodeId];

  if (node.reference != null) {
    yield* generateReferenceCompoundDefinition(specification, node.reference);
  }
  if (node.oneOf != null) {
    yield* generateOneOfCompoundDefinition(specification, node.oneOf);
  }
  if (node.anyOf != null) {
    yield* generateAnyOfCompoundDefinition(specification, node.anyOf);
  }
  if (node.allOf != null) {
    yield* generateAllOfCompoundDefinition(specification, node.allOf);
  }
  if (node.if != null) {
    yield* generateIfCompoundDefinition(specification, node.if, node.then, node.else);
  }
  if (node.not != null) {
    yield* generateNotCompoundDefinition(specification, node.not);
  }
}

function* generateNeverTypeDefinition(specification: models.Specification, nodeId: string) {
  yield "never";
}
function* generateAnyTypeDefinition(specification: models.Specification, nodeId: string) {
  yield "any";
}
function* generateNullTypeDefinition(specification: models.Specification, nodeId: string) {
  yield "null";
}
function* generateBooleanTypeDefinition(specification: models.Specification, nodeId: string) {
  const node = specification.nodes[nodeId];
  const options = node.options?.filter((option) => typeof option === "boolean");

  if (options != null) {
    yield joinIterable(
      options.map((option) => JSON.stringify(option)),
      " |\n",
    );
    return;
  }

  yield "boolean";
}
function* generateIntegerTypeDefinition(specification: models.Specification, nodeId: string) {
  const node = specification.nodes[nodeId];
  const options = node.options?.filter((option) => typeof option === "number");

  if (options != null) {
    yield joinIterable(
      options.map((option) => JSON.stringify(option)),
      " |\n",
    );
    return;
  }

  yield "number";
}

function* generateNumberTypeDefinition(specification: models.Specification, nodeId: string) {
  const node = specification.nodes[nodeId];
  const options = node.options?.filter((option) => typeof option === "number");

  if (options != null) {
    yield joinIterable(
      options.map((option) => JSON.stringify(option)),
      " |\n",
    );
    return;
  }

  yield "number";
}
function* generateStringTypeDefinition(specification: models.Specification, nodeId: string) {
  const node = specification.nodes[nodeId];
  const options = node.options?.filter((option) => typeof option === "string");

  if (options != null) {
    yield joinIterable(
      options.map((option) => JSON.stringify(option)),
      " |\n",
    );
    return;
  }

  yield "string";
}
function* generateArrayTypeDefinition(specification: models.Specification, nodeId: string) {
  const node = specification.nodes[nodeId];
  const tupleItems = node.tupleItems;
  const arrayItems = node.arrayItems;

  if (arrayItems != null) {
    const elements = [...(tupleItems || []), arrayItems]
      .filter((nodeId) => nodeId != null)
      .map((nodeId) => nodeId as string)
      .map((nodeId) => toPascal(specification.names[nodeId]));

    yield itt`(${joinIterable(elements, " |\n")})[]`;
    return;
  }

  if (tupleItems != null) {
    const elements = tupleItems.map((nodeId) => toPascal(specification.names[nodeId]));
    yield itt`[${joinIterable(elements, ", ")}]`;
    return;
  }

  yield "unknown[]";
}
function* generateMapTypeDefinition(specification: models.Specification, nodeId: string) {
  const node = specification.nodes[nodeId];
  const objectProperties = node.objectProperties;
  const patternProperties = node.patternProperties;
  const mapProperties = node.mapProperties;
  const propertyNames = node.propertyNames;
  const required = new Set(node.required);

  const members = Array<NestedText>();
  const indexTypeUnionElements = new Array<NestedText>();

  let hasIndexSignature = false;
  let indexMaybeUndefined = false;

  const nameTypeElement =
    propertyNames == null ? "string" : toPascal(specification.names[propertyNames]);

  if (mapProperties != null) {
    hasIndexSignature = true;

    const typeElement = toPascal(specification.names[mapProperties]);
    indexTypeUnionElements.push(typeElement);
  }

  if (patternProperties != null) {
    hasIndexSignature = true;

    for (const patternProperty of Object.values(patternProperties)) {
      const typeElement = toPascal(specification.names[patternProperty]);
      indexTypeUnionElements.push(typeElement);
    }
  }

  if (objectProperties != null) {
    for (const name in objectProperties) {
      const nodeId = objectProperties[name];
      const typeElement = toPascal(specification.names[nodeId]);
      const memberRequired = required.has(name);
      members.push(`
        "${name}"${memberRequired ? "" : "?"}: ${typeElement},
      `);

      if (hasIndexSignature) {
        indexTypeUnionElements.push(typeElement);
      }

      if (!memberRequired) {
        indexMaybeUndefined = true;
      }
    }
  }

  if (indexMaybeUndefined) {
    indexTypeUnionElements.push("undefined");
  }

  if (hasIndexSignature) {
    members.push(itt`[key: ${nameTypeElement}]: ${joinIterable(indexTypeUnionElements, " |\n")},`);
  }

  yield itt`
    {
      ${members}
    }
  `;
}

function* generateOneOfCompoundDefinition(specification: models.Specification, oneOf: string[]) {
  const types = oneOf.map((nodeId) => toPascal(specification.names[nodeId]));
  yield joinIterable(types, " |\n");
}
function* generateAnyOfCompoundDefinition(specification: models.Specification, anyOf: string[]) {
  const { anyOfHack } = specification.options;

  if (anyOfHack) {
    /*
    this is a more efficient implementation, it is less perfect but many times faster,
    especially with a lot of anyof types
    */
    const intersectionTypes = anyOf.map((nodeId) => toPascal(specification.names[nodeId]));

    yield joinIterable(
      mapIterable(intersectionTypes, (type) => itt`(Partial<${type}>)`),
      " &\n",
    );
  } else {
    /*
    this is the correct implementation of anyof, it may yield an incredibel amount of code.
    */
    const unionTypes = new Array<NestedText>();

    for (let count = 0; count < anyOf.length; count++) {
      for (const intersectionTypes of choose(anyOf, count + 1)) {
        const types = intersectionTypes.map((nodeId) => toPascal(specification.names[nodeId]));
        unionTypes.push(joinIterable(types, " & "));
      }
    }

    yield joinIterable(
      mapIterable(unionTypes, (type) => itt`(${type})`),
      " |\n",
    );
  }
}
function* generateAllOfCompoundDefinition(specification: models.Specification, allOf: string[]) {
  const types = allOf.map((nodeId) => toPascal(specification.names[nodeId]));
  yield joinIterable(types, " &\n");
}
function* generateReferenceCompoundDefinition(
  specification: models.Specification,
  reference: string,
) {
  const type = toPascal(specification.names[reference]);
  yield type;
}
function* generateIfCompoundDefinition(
  specification: models.Specification,
  $if: string,
  then?: string,
  $else?: string,
) {
  const elements = new Array<NestedText>();
  if (then != null) {
    const type = toPascal(specification.names[then]);
    elements.push(type);
  }

  if ($else != null) {
    const type = toPascal(specification.names[$else]);
    elements.push(type);
  }

  if (elements.length > 0) {
    yield joinIterable(elements, " |\n");
    return;
  }

  yield "unknown";
}
function* generateNotCompoundDefinition(specification: models.Specification, not: string) {
  const type = toPascal(specification.names[not]);
  yield type;
}
