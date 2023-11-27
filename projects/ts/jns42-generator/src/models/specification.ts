import * as schemaIntermediateB from "jns42-schema-intermediate";

export interface Specification {
  names: Record<string, string>;
  nodes: Record<string, schemaIntermediateB.Node>;
}
