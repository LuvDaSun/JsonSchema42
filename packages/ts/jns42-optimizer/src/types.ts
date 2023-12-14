export type Item = Unknown | Never | Any | Primitive | Complex | Merge;

export type Primitive = Null | Boolean | Integer | Number | String;
export type Complex = Tuple | Array | Object | Map;
export type Merge = OneOf | AnyOf | AllOf;

export interface Base<Type extends string> {
  id: string | null;
  type: Type;
}

export interface Alias extends Base<"alias"> {
  alias: number;
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
  elements: number[];
}

export interface Array extends Base<"array"> {
  element: number;
}

export interface Object extends Base<"object"> {
  properties: { [name: string]: { element: number; required: boolean } };
}

export interface Map extends Base<"map"> {
  name: number;
  element: number;
}

export interface OneOf extends Base<"oneOf"> {
  oneOf: number[];
}

export interface AnyOf extends Base<"anyOf"> {
  anyOf: number[];
}

export interface AllOf extends Base<"allOf"> {
  allOf: number[];
}

/**
 * retrieves depenencies of a type item or alias
 *
 * @param item the type to get dependencies
 */
export function* dependencies(item: Item | Alias) {
  switch (item.type) {
    case "allOf":
      for (const element of item.allOf) {
        yield element;
      }
      break;

    case "anyOf":
      for (const element of item.anyOf) {
        yield element;
      }
      break;

    case "oneOf":
      for (const element of item.oneOf) {
        yield element;
      }
      break;

    case "alias":
      yield item.alias;
      break;

    case "tuple":
      for (const element of item.elements) {
        yield element;
      }
      break;
    case "array":
      yield item.element;
      break;
    case "object":
      for (const { element } of Object.values(item.properties)) {
        yield element;
      }
      break;
    case "map":
      yield item.name;
      yield item.element;
      break;
  }
}
