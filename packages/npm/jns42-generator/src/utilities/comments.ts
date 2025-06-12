import * as core from "@jns42/core";
import { encode } from "entities";
import * as models from "../models.js";
import { NestedText } from "./iterable-text-template.js";

export function* generateJsDocComments(
  item: models.TypeModel | core.ArenaSchemaItemContainer,
): Iterable<NestedText> {
  const { location: nodeId } = item;

  yield `/**\n`;
  if (item.title != null) {
    yield ` * @summary ${formatComment(item.title)}\n`;
  }

  if (item.description != null) {
    yield ` * @description ${formatComment(item.description)}\n`;
  }

  if (nodeId != null) {
    // TODO make this stable (relative paths)
    // yield ` * @see {@link ${nodeId}}\n`;
  }

  if (item.deprecated ?? false) {
    yield ` * @deprecated\n`;
  }

  yield ` */\n`;
}

function formatComment(value: string) {
  return encode(value, {}).replaceAll(/\*\//g, "*\\/").replaceAll(/\n/g, "<br />");
}
