use inflector::Inflector;

pub fn to_snake(parts: impl IntoIterator<Item = impl ToString>) -> String {
  parts
    .into_iter()
    .map(|value| value.to_string())
    .collect::<Vec<_>>()
    .join(" ")
    .to_snake_case()
}

pub fn to_pascal(parts: impl IntoIterator<Item = impl ToString>) -> String {
  parts
    .into_iter()
    .map(|value| value.to_string())
    .collect::<Vec<_>>()
    .join(" ")
    .to_pascal_case()
}

pub fn to_camel(parts: impl IntoIterator<Item = impl ToString>) -> String {
  parts
    .into_iter()
    .map(|value| value.to_string())
    .collect::<Vec<_>>()
    .join(" ")
    .to_camel_case()
}

pub(crate) fn neon_register(cx: &mut neon::context::ModuleContext) -> neon::result::NeonResult<()> {
  use neon::prelude::*;

  fn to_pascal_js(mut cx: FunctionContext) -> JsResult<JsString> {
    let parts_count = cx.len();

    let mut parts = Vec::with_capacity(parts_count);
    for index in 0..parts_count {
      let part_js: Handle<JsString> = cx.argument(index)?;
      let part = part_js.value(&mut cx);
      parts.push(part);
    }

    let result = to_pascal(parts);

    Ok(cx.string(result))
  }

  fn to_snake_js(mut cx: FunctionContext) -> JsResult<JsString> {
    let parts_count = cx.len();

    let mut parts = Vec::with_capacity(parts_count);
    for index in 0..parts_count {
      let part_js: Handle<JsString> = cx.argument(index)?;
      let part = part_js.value(&mut cx);
      parts.push(part);
    }

    let result = to_snake(parts);

    Ok(cx.string(result))
  }

  fn to_camel_js(mut cx: FunctionContext) -> JsResult<JsString> {
    let parts_count = cx.len();

    let mut parts = Vec::with_capacity(parts_count);
    for index in 0..parts_count {
      let part_js: Handle<JsString> = cx.argument(index)?;
      let part = part_js.value(&mut cx);
      parts.push(part);
    }

    let result = to_camel(parts);

    Ok(cx.string(result))
  }

  cx.export_function("toPascal", to_pascal_js)?;
  cx.export_function("toSnake", to_snake_js)?;
  cx.export_function("toCamel", to_camel_js)?;

  Ok(())
}
