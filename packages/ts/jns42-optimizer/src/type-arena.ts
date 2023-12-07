import * as types from "./types.js";
import { Arena, ArenaTransform } from "./utils/arena.js";

export type TypeArenaTransform = ArenaTransform<types.Union, TypeArena>;
export class TypeArena extends Arena<types.Union> {}
