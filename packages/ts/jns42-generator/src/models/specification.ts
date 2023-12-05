import * as schemaIntermediateB from "schema-intermediate";

export interface Specification {
  names: Record<string, string>;
  nodes: Record<string, schemaIntermediateB.Node>;
  options: {
    anyOfHack: boolean;
  };
}
