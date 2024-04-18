import * as core from "@jns42/core";
import { encode } from "entities";
import { NestedText } from "./iterable-text-template.js";

export function* generateJsDocComments(typeItem: core.ArenaSchemaItemValue): Iterable<NestedText> {
  const { location: nodeId } = typeItem;

  yield `/**\n`;
  if (typeItem.title != null) {
    yield ` * @summary ${formatComment(typeItem.title)}\n`;
  }

  if (typeItem.description != null) {
    yield ` * @description ${formatComment(typeItem.description)}\n`;
  }

  if (nodeId != null) {
    yield ` * @see {@link ${nodeId}}\n`;
  }

  if (typeItem.deprecated ?? false) {
    yield ` * @deprecated\n`;
  }

  yield ` */\n`;
}

function formatComment(value: string) {
  return encode(value, {}).replaceAll(/\*\//g, "*\\/").replaceAll(/\n/g, "<br />");
}
