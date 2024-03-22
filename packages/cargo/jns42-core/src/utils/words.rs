#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Word(String);

impl Word {
  fn new(value: &str) -> Self {
    Self(value.to_lowercase())
  }

  pub fn as_lower(&self) -> &str {
    &self.0
  }

  pub fn to_upper(&self) -> String {
    self.0.to_uppercase()
  }

  pub fn to_pascal(&self) -> String {
    self.0[0..1].to_uppercase() + &self.0[1..]
  }

  pub fn from_str(input: &str) -> Vec<Word> {
    let mut parts = Vec::new();
    let mut offset = 0;
    let mut length = 0;
    let mut char_type_last = CharType::Unknown;

    macro_rules! flush_buffer {
      () => {
        if length > 0 {
          parts.push(Word::new(&input[offset..offset + length]));
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
}

impl AsRef<str> for Word {
  fn as_ref(&self) -> &str {
    return &self.0;
  }
}

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

/// ToPascalCase
pub fn to_pascal_case(words: impl IntoIterator<Item = Word>) -> String {
  let mut output = String::new();

  for word in words {
    output.push_str(&word.to_pascal());
  }

  output
}

/// toCamelCase
pub fn to_camel_case(words: impl IntoIterator<Item = Word>) -> String {
  let mut output = String::new();

  for word in words {
    if output.is_empty() {
      output.push_str(word.as_lower());
    } else {
      output.push_str(&word.to_pascal());
    }
  }

  output
}

/// to_snake_case
pub fn to_snake_case(words: impl IntoIterator<Item = Word>) -> String {
  let mut output = String::new();

  for word in words {
    if !output.is_empty() {
      output.push('_');
    }

    output.push_str(word.as_lower());
  }

  output
}

/// TO_SCREAMING_SNAKE_CASE
pub fn to_screaming_snake_case(words: impl IntoIterator<Item = Word>) -> String {
  let mut output = String::new();

  for word in words {
    if !output.is_empty() {
      output += "_";
    }

    output.push_str(&word.to_upper());
  }

  output
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_split_words() {
    let actual: Vec<_> = Word::from_str(" a-b c dEf - 123abcDEF456")
      .into_iter()
      .map(|word| word.as_ref())
      .collect();
    let expected = vec!["a", "b", "c", "d", "ef", "123", "abc", "def", "456"];
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_pascal_case() {
    let actual = to_pascal_case(Word::from_str("   Aa  bc dE_f    "));
    let expected = "AbCdEf";
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_camel_case() {
    let actual = to_pascal_case(Word::from_str("   Aa  bc dE_f    "));
    let expected = "abCdEf";
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_snake_case() {
    let actual = to_pascal_case(Word::from_str("   Aa  bc dE_f    "));
    let expected = "ab_cd_ef";
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_screaming_snake_case() {
    let actual = to_pascal_case(Word::from_str("   Aa  bc dE_f    "));
    let expected = "AB_CD_EF";
    assert_eq!(actual, expected)
  }
}
