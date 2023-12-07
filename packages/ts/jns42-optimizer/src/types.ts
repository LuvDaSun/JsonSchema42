export type Union =
  | Unknown
  | Never
  | Any
  | Boolean
  | Integer
  | Number
  | String
  | Tuple
  | Array
  | Object
  | Map
  | Alias
  | OneOf
  | AnyOf
  | AllOf;

export interface Base<Type extends string> {
  uri?: string;
  type: Type;
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

export interface Boolean extends Base<"boolean"> {
  //
}

export interface Integer extends Base<"integer"> {
  //
}

export interface Number extends Base<"number"> {
  //
}

export interface String extends Base<"string"> {
  //
}

export interface Tuple extends Base<"tuple"> {
  // TODO
}

export interface Array extends Base<"array"> {
  // TODO
}

export interface Object extends Base<"object"> {
  // TODO
}

export interface Map extends Base<"map"> {
  // TODO
}

export interface Alias extends Base<"alias"> {
  target: number;
}

export interface OneOf extends Base<"oneOf"> {
  elements: number[];
}

export interface AnyOf extends Base<"anyOf"> {
  elements: number[];
}

export interface AllOf extends Base<"allOf"> {
  elements: number[];
}
