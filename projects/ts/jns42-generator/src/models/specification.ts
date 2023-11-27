import * as schemaIntermediateB from "@jns42/jns42-schema-intermediate-b";

export interface Specification {
  names: Record<string, string>;
  nodes: Record<string, schemaIntermediateB.Node>;
}
