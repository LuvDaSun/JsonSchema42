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

// #[cfg(target_arch = "wasm32")]
mod wasm {
  use wasm_bindgen::prelude::*;

  #[wasm_bindgen]
  pub fn to_snake(parts: Vec<String>) -> String {
    super::to_snake(parts)
  }

  #[wasm_bindgen]
  pub fn to_pascal(parts: Vec<String>) -> String {
    super::to_pascal(parts)
  }

  #[wasm_bindgen]
  pub fn to_camel(parts: Vec<String>) -> String {
    super::to_camel(parts)
  }
}
