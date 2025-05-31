import * as core from "@jns42/core";
import assert from "assert";
import * as models from "../models.js";
import {
  NestedText,
  generateJsDocComments,
  itt,
  joinIterable,
  mapIterable,
  packageInfo,
} from "../utilities.js";

export function* generateValidatorsTsCode(specification: models.Specification) {
  yield core.utilities.banner("//", `v${packageInfo.version}`);

  const { names, validatorsArena } = specification;

  yield itt`
    import * as types from "./types.js";
    import * as lib from "@jns42/lib";
  `;

  for (let itemKey = 0; itemKey < validatorsArena.count(); itemKey++) {
    const item = validatorsArena.getItem(itemKey);

    const name = names.getName(itemKey);
    if (name == null) {
      continue;
    }

    const statements = generateValidatorStatements(itemKey, "value");

    yield itt`
      ${generateJsDocComments(item)}
      export const is${name.toPascalCase()} =
        (value: unknown): value is types.${name.toPascalCase()} => lib.validation.withValidationType(
          ${JSON.stringify(name.toPascalCase())},
          () => {
            ${statements};
          },
        );
    `;
  }

  function* generateValidatorReference(
    itemKey: number,
    valueExpression: string,
  ): Iterable<NestedText> {
    const name = names.getName(itemKey);
    if (name == null) {
      yield itt`
        ((value: unknown) => {
            ${generateValidatorStatements(itemKey, "value")}
        })(${valueExpression})
      `;
    } else {
      yield itt`is${name.toPascalCase()}(${valueExpression})`;
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
            (item.options as any[]).map(
              (option) => itt`${valueExpression} !== ${JSON.stringify(option)}`,
            ),
            " &&\n",
          )}
        ) {
          lib.validation.recordValidationError("options");
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
        lib.validation.recordValidationError("types");
        return false;
      }
    `;
      function* generateSubAssertions() {
        for (const type of item.types ?? ([] as core.models.SchemaType[])) {
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

            case "str": {
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
              lib.validation.recordValidationError("minimumInclusive");
              return false;
            }
          `;
        }

        if (item.minimumExclusive != null) {
          yield itt`
            if(
              ${valueExpression} <= ${JSON.stringify(item.minimumExclusive)}
            ) {
              lib.validation.recordValidationError("minimumExclusive");
              return false;
            }
          `;
        }

        if (item.maximumInclusive != null) {
          yield itt`
            if(
              ${valueExpression} > ${JSON.stringify(item.maximumInclusive)}
            ) {
              lib.validation.recordValidationError("maximumInclusive");
              return false;
            }
          `;
        }

        if (item.maximumExclusive != null) {
          yield itt`
            if(
              ${valueExpression} >= ${JSON.stringify(item.maximumExclusive)}
            ) {
              lib.validation.recordValidationError("maximumExclusive");
              return false;
            }
          `;
        }

        if (item.multipleOf != null) {
          yield itt`
            if(
              ${valueExpression} % ${JSON.stringify(item.multipleOf)} !== 0
            ) {
              lib.validation.recordValidationError("multipleOf");
              return false;
            }
          `;
        }
      }
    }

    if (
      item.minimumLength != null ||
      item.maximumLength != null ||
      item.valuePattern != null ||
      item.valueFormat != null
    ) {
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
              lib.validation.recordValidationError("minimumLength");
              return false;
            }
          `;
        }

        if (item.maximumLength != null) {
          yield itt`
            if(
              value.length > ${JSON.stringify(item.maximumLength)}
            ) {
              lib.validation.recordValidationError("maximumLength");
              return false;
            }
          `;
        }

        if (item.valuePattern != null) {
          yield itt`
            if(
              !new RegExp(${JSON.stringify(item.valuePattern)}).test(${valueExpression})
            ) {
              lib.validation.recordValidationError("valuePattern");
              return false;
            }
          `;
        }

        if (item.valueFormat != null) {
          const isValueFormatExpression = getValueFormatExpression(
            item.valueFormat,
            valueExpression,
          );
          yield itt`
            if(
              !${isValueFormatExpression}
            ) {
              lib.validation.recordValidationError("valueFormat");
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
              lib.validation.recordValidationError("tupleItems");
              return false;
            }
          `;
        }

        if (item.minimumItems != null) {
          yield itt`
            if(${valueExpression}.length < ${JSON.stringify(item.minimumItems)}) {
              lib.validation.recordValidationError("minimumItems");
              return false;
            }
          `;
        }

        if (item.maximumItems != null) {
          yield itt`
            if(${valueExpression}.length > ${JSON.stringify(item.maximumItems)}) {
              lib.validation.recordValidationError("maximumItems");
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
              lib.validation.recordValidationError("uniqueItems");
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
                if(!lib.validation.withValidationPath(
                  String(elementIndex),
                  () => ${generateValidatorReference(elementKey, `elementValue`)},
                )) {
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
            if(!lib.validation.withValidationPath(
              String(elementIndex),
              () =>  ${generateValidatorReference(item.arrayItems, `elementValue`)},
            )) {
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
            if(!lib.validation.withValidationPath(
              ${JSON.stringify(propertyName)},
              () => {
                if(
                  !(${JSON.stringify(propertyName)} in ${valueExpression}) ||
                  ${valueExpression}[${JSON.stringify(propertyName)}] === undefined
                ) {
                  lib.validation.recordValidationError("required");
                  return false;
                }
                return true;
              }
            )) {
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
          for(const [propertyName, propertyValue] of Object.entries(${valueExpression})) {
            ${generateLoopContent()}
          }
        `;

        if (item.minimumProperties != null) {
          yield itt`
            if(propertyCount < ${JSON.stringify(item.minimumProperties)}) {
              lib.validation.recordValidationError("minimumProperties");
              return false;
              }
          `;
        }
      }

      function* generateLoopContent() {
        yield itt`
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
              lib.validation.recordValidationError("maximumProperties");
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
                if(!lib.validation.withValidationPath(
                  propertyName,
                  () => ${generateValidatorReference(
                    item.objectProperties[propertyName],
                    `propertyValue`,
                  )},
                )) {
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
                if(!lib.validation.withValidationPath(
                  propertyName,
                  () => ${generateValidatorReference(
                    item.patternProperties[propertyPattern],
                    `propertyValue`,
                  )},
                )) {
                  return false
                }
                continue;
              }
            `;
          }
        }

        if (item.mapProperties != null) {
          yield itt`
            if(!lib.validation.withValidationPath(
              propertyName,
              () => ${generateValidatorReference(item.mapProperties, `propertyValue`)},
            )) {
              return false
            }
          `;
        }
      }
    }

    if (item.reference != null) {
      yield itt`
        if(!${generateValidatorReference(item.reference, valueExpression)}) {
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
            lib.validation.recordValidationError("allOf");
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
          lib.validation.saveValidationErrors();

          ${generateInnerStatements()}

          if(counter < 1) {
            lib.validation.recordValidationError("anyOf");
            return false;
          }

          lib.validation.restoreValidationErrors();
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
          lib.validation.saveValidationErrors();

          ${generateInnerStatements()}

          if(counter !== 1) {
            lib.validation.recordValidationError("oneOf");
            return false;
          }
          
          lib.validation.restoreValidationErrors();
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

    if (item.ifSchema != null) {
      yield itt`
        if(${generateValidatorReference(item.ifSchema, valueExpression)}) {
          ${generateInnerThenStatements()}
        }
        else {
          ${generateInnerElseStatements()}
        }
      `;

      function* generateInnerThenStatements() {
        if (item.thenSchema != null) {
          yield itt`
            if(!${generateValidatorReference(item.thenSchema, valueExpression)}) {
              lib.validation.recordValidationError("then");
              return false;
            }
          `;
        }
      }

      function* generateInnerElseStatements() {
        if (item.elseSchema != null) {
          yield itt`
            if(!${generateValidatorReference(item.elseSchema, valueExpression)}) {
              lib.validation.recordValidationError("else");
              return false;
            }
          `;
        }
      }
    }

    if (item.not != null) {
      yield itt`
        if(${generateValidatorReference(item.not, valueExpression)}) {
          lib.validation.recordValidationError("not");
          return false;
        }
      `;
    }

    yield itt`
      return true;
    `;
  }
}

/**
 * @see https://json-schema.org/understanding-json-schema/reference/string#built-in-formats
 */
function getValueFormatExpression(format: string, expression: string) {
  switch (format) {
    case "date-time": // Date and time together, for example, 2018-11-13T20:20:39+00:00.
      return JSON.stringify(true);

    case "time": // New in draft 7
      // Time, for example, 20:20:39+00:00
      return JSON.stringify(true);

    case "date": // New in draft 7
      // Date, for example, 2018-11-13.
      return `/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(${expression})`;

    case "duration": // New in draft 2019-09
      // A duration as defined by the ISO 8601 ABNF for "duration". For example, P3D expresses a duration of 3 days.
      return JSON.stringify(true);

    case "email": // Internet email address, see RFC 5321, section 4.1.2.
      return JSON.stringify(true);

    case "idn-email": // New in draft 7
      // The internationalized form of an Internet email address, see RFC 6531.
      return JSON.stringify(true);

    case "hostname": // Internet host name, see RFC 1123, section 2.1.
      return JSON.stringify(true);

    case "idn-hostname": // New in draft 7
      // An internationalized Internet host name, see RFC5890, section 2.3.2.3.
      return JSON.stringify(true);

    case "ipv4": // IPv4 address, according to dotted-quad ABNF syntax as defined in RFC 2673, section 3.2.
      return JSON.stringify(true);

    case "ipv6": // IPv6 address, as defined in RFC 2373, section 2.2.
      return JSON.stringify(true);

    case "uuid": // New in draft 2019-09
      // A Universally Unique Identifier as defined by RFC 4122. Example: 3e4666bf-d5e5-4aa7-b8ce-cefe41c7568a
      return `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(${expression})`;

    case "uri": // A universal resource identifier (URI), according to RFC3986.
      return JSON.stringify(true);

    case "uri-reference": // New in draft 6
      // A URI Reference (either a URI or a relative-reference), according to RFC3986, section 4.1.
      return JSON.stringify(true);

    case "iri": // New in draft 7
      // The internationalized equivalent of a "uri", according to RFC3987.
      return JSON.stringify(true);

    case "iri-reference": //New in draft 7
      // The internationalized equivalent of a "uri-reference", according to RFC3987
      return JSON.stringify(true);

    case "uri-template": // New in draft 6
      // A URI Template (of any level) according to RFC6570. If you don't already know what a URI Template is, you probably don't need this value.
      return JSON.stringify(true);

    case "json-pointer": // New in draft 6
      // A JSON Pointer, according to RFC6901. There is more discussion on the use of JSON Pointer within JSON Schema in Structuring a complex schema. Note that this should be used only when the entire string contains only JSON Pointer content, e.g. /foo/bar. JSON Pointer URI fragments, e.g. #/foo/bar/ should use "uri-reference".
      return JSON.stringify(true);

    case "relative-json-pointer": // New in draft 7
      // A relative JSON pointer.
      return JSON.stringify(true);

    case "regex": // New in draft 7
      // A regular expression, which should be valid according to the ECMA 262 dialect.
      return JSON.stringify(true);

    default:
      return JSON.stringify(true);
  }
}
