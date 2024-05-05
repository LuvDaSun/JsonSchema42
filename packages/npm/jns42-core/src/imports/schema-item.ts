import { SchemaType } from "./schema-type.js";

export type ArenaSchemaItemValue = SchemaItemValue<number>;
export type DocumentSchemaItemValue = SchemaItemValue<string>;

export type SchemaItemValue<K> = {
  name?: string;
  exact?: boolean;

  primary?: boolean;
  parent?: K;
  location?: string;

  title?: string;
  description?: string;
  examples?: any[];
  deprecated?: boolean;

  types?: SchemaType[];

  reference?: K;

  if?: K;
  then?: K;
  else?: K;

  not?: K;

  propertyNames?: K;
  mapProperties?: K;
  arrayItems?: K;
  contains?: K;

  oneOf?: K[];
  anyOf?: K[];
  allOf?: K[];
  tupleItems?: K[];

  objectProperties?: Record<string, K>;
  patternProperties?: Record<string, K>;
  dependentSchemas?: Record<string, K>;

  options?: any[];
  required?: string[];

  minimumInclusive?: number;
  minimumExclusive?: number;
  maximumInclusive?: number;
  maximumExclusive?: number;
  multipleOf?: number;
  minimumLength?: number;
  maximumLength?: number;
  valuePattern?: string;
  valueFormat?: string;
  minimumItems?: number;
  maximumItems?: number;
  uniqueItems?: boolean;
  minimumProperties?: number;
  maximumProperties?: number;
};
