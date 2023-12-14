import { TypeArena } from "jns42-optimizer";
import * as schemaIntermediateB from "schema-intermediate";

export interface Specification {
  names: Record<string, string>;
  nodes: Record<string, schemaIntermediateB.Node>;
  typeArena: TypeArena;
  options: {
    anyOfHack: boolean;
  };
}
