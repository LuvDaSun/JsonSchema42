import { Arena, ArenaTransform } from "../utils/arena.js";
import { SchemaModel, isAliasSchemaModel } from "./model.js";

export type SchemaTransform = ArenaTransform<SchemaModel, SchemaArena>;

export class SchemaArena extends Arena<SchemaModel> {
  public resolveItem(key: number): [number, SchemaModel] {
    let resolvedKey = key;
    let resolvedItem = this.getItem(resolvedKey);
    while (isAliasSchemaModel(resolvedItem)) {
      resolvedKey = resolvedItem.alias;
      resolvedItem = this.getItem(resolvedKey);
    }
    return [resolvedKey, resolvedItem];
  }
}
