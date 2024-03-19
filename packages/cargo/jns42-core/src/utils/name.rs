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

  macro_rules! flush_buffer {
    () => {
      if !buffer.is_empty() {
        parts.push(buffer);
        buffer = String::new();
      }
    };
  }

  for ch in input.chars() {
    let char_type: CharType = ch.into();

    match (char_type_last, char_type) {
      (_, CharType::Unknown) => flush_buffer!(),
      (CharType::Lower, CharType::Upper)
      | (CharType::Upper, CharType::Number)
      | (CharType::Lower, CharType::Number)
      | (CharType::Number, CharType::Upper)
      | (CharType::Number, CharType::Lower) => {
        flush_buffer!();
        buffer.push(ch.to_ascii_lowercase());
      }
      (_, _) => buffer.push(ch.to_ascii_lowercase()),
    }

    char_type_last = char_type;
  }

  flush_buffer!();

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

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_split_name() {
    let actual = split_name(" a b c dEf - 123abcDEF456");
    let expected = vec!["a", "b", "c", "d", "ef", "123", "abc", "def", "456"];
    assert_eq!(actual, expected)
  }
}
