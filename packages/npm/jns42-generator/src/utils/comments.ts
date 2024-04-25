import * as core from "@jns42/core";
import { encode } from "entities";
import { NestedText } from "./iterable-text-template.js";

export function* generateJsDocComments(item: core.ArenaSchemaItem): Iterable<NestedText> {
  const itemValue = item.toValue();
  const { location: nodeId } = itemValue;

  yield `/**\n`;
  if (itemValue.title != null) {
    yield ` * @summary ${formatComment(itemValue.title)}\n`;
  }

  if (itemValue.description != null) {
    yield ` * @description ${formatComment(itemValue.description)}\n`;
  }

  if (nodeId != null) {
    yield ` * @see {@link ${nodeId}}\n`;
  }

  if (itemValue.deprecated ?? false) {
    yield ` * @deprecated\n`;
  }

  yield ` */\n`;
}

function formatComment(value: string) {
  return encode(value, {}).replaceAll(/\*\//g, "*\\/").replaceAll(/\n/g, "<br />");
}
