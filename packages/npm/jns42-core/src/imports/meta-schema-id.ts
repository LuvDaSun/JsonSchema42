export enum MetaSchemaId {
  unknown = 0,
  draft202012,
  draft201909,
  draft07,
  draft06,
  draft04,
  oasV31,
  oasV30,
  swaggerV2,
}

export type MetaSchemaString =
  | "https://json-schema.org/draft/2019-09/schema"
  | "https://json-schema.org/draft/2020-12/schema"
  | "http://json-schema.org/draft-07/schema#"
  | "http://json-schema.org/draft-06/schema#"
  | "http://json-schema.org/draft-04/schema#"
  | "https://spec.openapis.org/oas/3.1/dialect/base"
  | "https://spec.openapis.org/oas/3.0/schema/2021-09-28#/definitions/Schema"
  | "http://swagger.io/v2/schema.json#/definitions/schema";

export function metaSchemaIdFromString(metaSchema: MetaSchemaString) {
  switch (metaSchema) {
    case "https://json-schema.org/draft/2019-09/schema":
      return MetaSchemaId.draft202012;

    case "https://json-schema.org/draft/2020-12/schema":
      return MetaSchemaId.draft201909;

    case "http://json-schema.org/draft-07/schema#":
      return MetaSchemaId.draft07;

    case "http://json-schema.org/draft-06/schema#":
      return MetaSchemaId.draft06;

    case "http://json-schema.org/draft-04/schema#":
      return MetaSchemaId.draft04;

    case "https://spec.openapis.org/oas/3.1/dialect/base":
      return MetaSchemaId.oasV31;

    case "https://spec.openapis.org/oas/3.0/schema/2021-09-28#/definitions/Schema":
      return MetaSchemaId.oasV30;

    case "http://swagger.io/v2/schema.json#/definitions/schema":
      return MetaSchemaId.swaggerV2;

    default:
      return MetaSchemaId.unknown;
  }
}
