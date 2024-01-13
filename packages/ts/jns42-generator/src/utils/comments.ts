import { encode } from "entities";
import * as models from "../models/index.js";
import { NestedText } from "./iterable-text-template.js";

export function* generateJsDocComments(typeItem: models.Item | models.Alias): Iterable<NestedText> {
  const { id: nodeId } = typeItem;

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
