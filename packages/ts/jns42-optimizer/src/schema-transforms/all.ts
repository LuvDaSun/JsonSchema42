import { SchemaTransform } from "../schema/index.js";
import { alias } from "./alias.js";
import { explode } from "./explode.js";
import { flatten } from "./flatten.js";
import { flipAllOfOneOf } from "./flip-all-of-one-of.js";
import { flipAnyOfOneOf } from "./flip-any-of-one-of.js";
import { flushParent } from "./flush-parent.js";
import { resolveAllOf } from "./resolve-all-of.js";
import { resolveAnyOf } from "./resolve-any-of.js";
import { resolveOneOf } from "./resolve-one-of.js";
import { resolveParent } from "./resolve-parent.js";
import { singleType } from "./single-type.js";
import { unique } from "./unique.js";

export const all: SchemaTransform = (arena, model, modelKey) => {
  /* 
  order matters here!
  */
  model = explode(arena, model, modelKey);
  model = singleType(arena, model, modelKey);

  model = flatten(arena, model, modelKey);
  model = unique(arena, model, modelKey);
  model = alias(arena, model, modelKey);

  model = flipAllOfOneOf(arena, model, modelKey);
  model = flipAnyOfOneOf(arena, model, modelKey);

  model = resolveAllOf(arena, model, modelKey);
  model = resolveAnyOf(arena, model, modelKey);
  model = resolveOneOf(arena, model, modelKey);
  model = resolveParent(arena, model, modelKey);

  model = flushParent(arena, model, modelKey);

  return model;
};
