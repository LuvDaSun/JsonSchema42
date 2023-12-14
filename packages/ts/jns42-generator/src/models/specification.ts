import * as schemaIntermediate from "schema-intermediate";
import * as models from "../models/index.js";

export interface Specification {
  names: Record<string, string>;
  nodes: Record<string, schemaIntermediate.Node>;
  types: Record<string, models.Item | models.Alias>;
  options: {
    anyOfHack: boolean;
  };
}
