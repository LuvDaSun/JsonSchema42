import * as models from "../models/index.js";

export interface Specification {
  names: Record<string, string>;
  types: Record<string, models.Item | models.Alias>;
  options: {};
}
