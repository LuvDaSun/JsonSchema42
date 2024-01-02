import { Arena, ArenaTransform } from "../utils/arena.js";
import { SchemaModel } from "./model.js";

export type SchemaTransform = ArenaTransform<SchemaModel, SchemaArena>;

export class SchemaArena extends Arena<SchemaModel> {}
