pub fn split_words(input: &str) -> Vec<&str> {
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
  let mut offset = 0;
  let mut length = 0;
  let mut char_type_last = CharType::Unknown;

  macro_rules! flush_buffer {
    () => {
      if length > 0 {
        parts.push(&input[offset..offset + length]);
      }
    };
  }

  for ch in input.chars() {
    let char_type: CharType = ch.into();

    match (char_type_last, char_type) {
      (_, CharType::Unknown) => {
        flush_buffer!();
        offset += length;
        length = 0;
        offset += 1;
      }
      (CharType::Lower, CharType::Upper)
      | (CharType::Upper, CharType::Number)
      | (CharType::Lower, CharType::Number)
      | (CharType::Number, CharType::Upper)
      | (CharType::Number, CharType::Lower) => {
        flush_buffer!();
        offset += length;
        length = 0;
        length += 1;
      }
      (_, _) => length += 1,
    }

    char_type_last = char_type;
  }

  flush_buffer!();

  parts
}

/// ToPascalCase
pub fn to_pascal_case(words: impl IntoIterator<Item = impl AsRef<str>>) -> String {
  let mut output = String::new();

  for word in words {
    let word = word.as_ref();

    output.push_str(&word[0..1].to_uppercase());
    output.push_str(&word[1..].to_lowercase());
  }

  output
}

/// toCamelCase
pub fn to_camel_case(words: impl IntoIterator<Item = impl AsRef<str>>) -> String {
  let mut output = String::new();

  for word in words {
    let word = word.as_ref();

    if output.is_empty() {
      output.push_str(&word.to_lowercase());
    } else {
      output.push_str(&word[0..1].to_uppercase());
      output.push_str(&word[1..].to_lowercase());
    }
  }

  output
}

/// to_snake_case
pub fn to_snake_case(words: impl IntoIterator<Item = impl AsRef<str>>) -> String {
  let mut output = String::new();

  for word in words {
    let word = word.as_ref();

    if !output.is_empty() {
      output.push('_');
    }

    output.push_str(&word.to_lowercase());
  }

  output
}

/// TO_SCREAMING_SNAKE_CASE
pub fn to_screaming_snake_case(words: impl IntoIterator<Item = impl AsRef<str>>) -> String {
  let mut output = String::new();

  for word in words {
    let word = word.as_ref();

    if !output.is_empty() {
      output += "_";
    }

    output += &word.to_uppercase();
  }

  output
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_split_words() {
    let actual = split_words(" a-b c dEf - 123abcDEF456");
    let expected = vec!["a", "b", "c", "d", "Ef", "123", "abc", "DEF", "456"];
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_pascal_case() {
    let actual = to_pascal_case(["", "Ab", "cD", "", "EF"]);
    let expected = "AbCdEf";
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_camel_case() {
    let actual = to_camel_case(["", "Ab", "cD", "", "EF"]);
    let expected = "abCdEf";
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_snake_case() {
    let actual = to_snake_case(["", "Ab", "cD", "", "EF"]);
    let expected = "ab_cd_ef";
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_screaming_snake_case() {
    let actual = to_screaming_snake_case(["", "Ab", "cD", "", "EF"]);
    let expected = "AB_CD_EF";
    assert_eq!(actual, expected)
  }
}
