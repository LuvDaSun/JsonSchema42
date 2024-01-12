export type Item = Unknown | Never | Any | Primitive | Complex | Merge;

export type Primitive = Null | Boolean | Integer | Number | String;
export type Complex = Tuple | Array | Object | Map;
export type Merge = Union;

export interface Base<Type extends string> {
  type: Type;

  id?: string;
  title?: string;
  description?: string;
  examples?: any[];
  deprecated?: boolean;
}

export interface Unknown extends Base<"unknown"> {
  //
}

export interface Never extends Base<"never"> {
  //
}

export interface Any extends Base<"any"> {
  //
}

export interface Null extends Base<"null"> {
  //
}

export interface Boolean extends Base<"boolean"> {
  options?: boolean[];
}

export interface Integer extends Base<"integer"> {
  options?: number[];

  minimumInclusive?: number;
  minimumExclusive?: number;
  maximumInclusive?: number;
  maximumExclusive?: number;
  multipleOf?: number[];
}

export interface Number extends Base<"number"> {
  options?: number[];

  minimumInclusive?: number;
  minimumExclusive?: number;
  maximumInclusive?: number;
  maximumExclusive?: number;
  multipleOf?: number[];
}

export interface String extends Base<"string"> {
  options?: string[];

  minimumLength?: number;
  maximumLength?: number;
  valuePattern?: string[];
  valueFormat?: string[];
}

export interface Tuple extends Base<"tuple"> {
  elements: string[];

  uniqueItems?: boolean;
}

export interface Array extends Base<"array"> {
  element: string;

  uniqueItems?: boolean;
  minimumItems?: number;
  maximumItems?: number;
}

export interface Object extends Base<"object"> {
  properties: { [name: string]: { element: string; required: boolean } };

  minimumProperties?: number;
  maximumProperties?: number;
}

export interface Map extends Base<"map"> {
  name: string;
  element: string;

  minimumProperties?: number;
  maximumProperties?: number;
}

export interface Union extends Base<"union"> {
  elements: string[];
}

export interface Alias extends Base<"alias"> {
  target: string;
}
