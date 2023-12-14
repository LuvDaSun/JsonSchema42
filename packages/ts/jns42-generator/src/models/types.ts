export type Union = Unknown | Never | Any | Primitive | Complex | Merge;

export type Primitive = Null | Boolean | Integer | Number | String;
export type Complex = Tuple | Array | Object | Map;
export type Merge = OneOf;

export interface Base<Type extends string> {
  id: string | null;
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

export interface Null extends Base<"null"> {
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
  elements: string[];
}

export interface Array extends Base<"array"> {
  element: string;
}

export interface Object extends Base<"object"> {
  properties: { [name: string]: { element: string; required: boolean } };
}

export interface Map extends Base<"map"> {
  name: string;
  element: string;
}

export interface OneOf extends Base<"oneOf"> {
  elements: string[];
}
