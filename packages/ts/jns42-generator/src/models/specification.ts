import * as schemaIntermediate from "schema-intermediate";
import * as models from "../models/index.js";

export interface Specification {
  names: Record<string, string>;
  types: Record<string, models.Item | models.Alias>;
  nodes: Record<string, schemaIntermediate.Node>;
  options: {};
}
