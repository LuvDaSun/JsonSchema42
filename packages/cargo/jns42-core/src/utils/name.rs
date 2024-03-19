use inflector::Inflector;

pub fn split_name(input: &str) -> Vec<String> {
  #[derive(Debug, Clone, Copy)]
  enum CharType {
    Unknown,
    Lower,
    Upper,
    Number,
  }

  impl From<char> for CharType {
    fn from(value: char) -> Self {
      if value.is_alphabetic() && value.is_uppercase() {
        return Self::Upper;
      }

      if value.is_alphabetic() && value.is_lowercase() {
        return Self::Lower;
      }

      if value.is_numeric() {
        return Self::Number;
      }

      Self::Unknown
    }
  }

  let mut parts = Vec::new();
  let mut buffer = String::new();
  let mut char_type_last = CharType::Unknown;

  for ch in input.chars() {
    let char_type: CharType = ch.into();

    match (char_type_last, char_type) {
      (_, CharType::Unknown) => {
        if !buffer.is_empty() {
          parts.push(buffer);
          buffer = String::new()
        }
      }
      (CharType::Lower, CharType::Upper)
      | (CharType::Lower, CharType::Number)
      | (CharType::Number, CharType::Lower)
      | (CharType::Number, CharType::Upper) => {
        {
          if !buffer.is_empty() {
            parts.push(buffer);
            buffer = String::new()
          }
        }
        buffer.push(ch);
      }
      (_, _) => buffer.push(ch),
    }

    char_type_last = char_type;
  }

  if !buffer.is_empty() {
    parts.push(buffer);
    buffer = String::new()
  }

  parts
}

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

#[cfg(target_arch = "wasm32")]
mod wasm {
  use wasm_bindgen::prelude::*;

  #[wasm_bindgen(js_name = "toSnake")]
  pub fn to_snake(parts: Vec<String>) -> String {
    super::to_snake(parts)
  }

  #[wasm_bindgen(js_name = "toPascal")]
  pub fn to_pascal(parts: Vec<String>) -> String {
    super::to_pascal(parts)
  }

  #[wasm_bindgen(js_name = "toCamel")]
  pub fn to_camel(parts: Vec<String>) -> String {
    super::to_camel(parts)
  }
}
