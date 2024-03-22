use std::{
  iter::{empty, once},
  slice::Iter,
};

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct Word(String);

impl Word {
  fn new(value: &str) -> Self {
    assert!(!value.is_empty());

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
}

impl AsRef<str> for Word {
  fn as_ref(&self) -> &str {
    &self.0
  }
}

#[derive(Debug, Default, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct Sentence(Vec<Word>);

impl Sentence {
  pub fn new(input: &str) -> Self {
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

    let mut words = Vec::new();
    let mut offset = 0;
    let mut length = 0;
    let mut char_type_last = CharType::Unknown;

    macro_rules! flush_buffer {
      () => {
        if length > 0 {
          words.push(Word::new(&input[offset..offset + length]));
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

    Self(words)
  }

  pub fn join(&self, other: &Self) -> Self {
    Self(
      empty()
        .chain(self.iter())
        .chain(other.iter())
        .cloned()
        .collect(),
    )
  }

  pub fn push(&self, word: Word) -> Self {
    Self(self.0.iter().cloned().chain(once(word)).collect())
  }

  /// ToPascalCase
  pub fn to_pascal_case(&self) -> String {
    let mut output = String::new();

    for word in &self.0 {
      output.push_str(&word.to_pascal());
    }

    output
  }

  /// toCamelCase
  pub fn to_camel_case(&self) -> String {
    let mut output = String::new();

    for word in &self.0 {
      if output.is_empty() {
        output.push_str(word.as_lower());
      } else {
        output.push_str(&word.to_pascal());
      }
    }

    output
  }

  /// to_snake_case
  pub fn to_snake_case(&self) -> String {
    let mut output = String::new();

    for word in &self.0 {
      if !output.is_empty() {
        output.push('_');
      }

      output.push_str(word.as_lower());
    }

    output
  }

  /// TO_SCREAMING_SNAKE_CASE
  pub fn to_screaming_snake_case(&self) -> String {
    let mut output = String::new();

    for word in &self.0 {
      if !output.is_empty() {
        output += "_";
      }

      output.push_str(&word.to_upper());
    }

    output
  }

  pub fn iter(&self) -> Iter<Word> {
    self.0.iter()
  }
}

impl IntoIterator for Sentence {
  type Item = Word;
  type IntoIter = std::vec::IntoIter<Self::Item>;

  fn into_iter(self) -> Self::IntoIter {
    self.0.into_iter()
  }
}

impl FromIterator<Word> for Sentence {
  fn from_iter<T: IntoIterator<Item = Word>>(iter: T) -> Self {
    Self(iter.into_iter().collect())
  }
}

pub mod ffi {
  #[repr(C)]
  pub struct Sentence(Box<super::Sentence>);

  impl Sentence {
    /// ToPascalCase
    pub fn to_pascal_case(&self) -> safer_ffi::string::String {
      self.0.to_pascal_case().into()
    }

    /// toCamelCase
    pub fn to_camel_case(&self) -> safer_ffi::string::String {
      self.0.to_camel_case().into()
    }

    /// to_snake_case
    pub fn to_snake_case(&self) -> safer_ffi::string::String {
      self.0.to_snake_case().into()
    }

    /// TO_SCREAMING_SNAKE_CASE
    pub fn to_screaming_snake_case(&self) -> safer_ffi::string::String {
      self.0.to_screaming_snake_case().into()
    }
  }

  impl From<super::Sentence> for Sentence {
    fn from(value: super::Sentence) -> Self {
      Self(Box::new(value))
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_new() {
    let sentence = Sentence::new(" a-b c dEf - 123abcDEF456");
    let actual: Vec<_> = sentence.iter().map(|word| word.as_ref()).collect();
    let expected = vec!["a", "b", "c", "d", "ef", "123", "abc", "def", "456"];
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_pascal_case() {
    let actual = Sentence::new("   Aa  bc dE_f    ").to_pascal_case();
    let expected = "AbCdEf";
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_camel_case() {
    let actual = Sentence::new("   Aa  bc dE_f    ").to_camel_case();
    let expected = "abCdEf";
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_snake_case() {
    let actual = Sentence::new("   Aa  bc dE_f    ").to_snake_case();
    let expected = "ab_cd_ef";
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_screaming_snake_case() {
    let actual = Sentence::new("   Aa  bc dE_f    ").to_screaming_snake_case();
    let expected = "AB_CD_EF";
    assert_eq!(actual, expected)
  }
}
