import { types } from "jns42-optimizer";
import * as schemaIntermediateB from "schema-intermediate";

export interface Specification {
  names: Record<string, string>;
  nodes: Record<string, schemaIntermediateB.Node>;
  typeMap: Map<number, types.Union | types.Alias | types.Merge>;
  options: {
    anyOfHack: boolean;
  };
}
