use super::Word;
use std::{
  iter::{empty, once},
  slice::Iter,
};

#[derive(Debug, Default, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct Sentence(Vec<Word>);

impl Sentence {
  pub fn empty() -> Self {
    Self(Vec::new())
  }

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

  pub fn is_empty(&self) -> bool {
    self.0.is_empty()
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

mod ffi {
  use std::ffi::{c_char, CStr, CString};

  use super::*;

  /// get the name as camelCase
  #[no_mangle]
  extern "C" fn to_camel_case(value: *const c_char) -> *mut c_char {
    let value = unsafe { CStr::from_ptr(value) };
    let value = value.to_str().unwrap();

    let sentence = Sentence::new(value);
    let result = sentence.to_camel_case();
    let result = CString::new(result).unwrap();

    result.into_raw()
  }

  /// get the name as PascalCase
  #[no_mangle]
  extern "C" fn to_pascal_case(value: *const c_char) -> *mut c_char {
    let value = unsafe { CStr::from_ptr(value) };
    let value = value.to_str().unwrap();

    let sentence = Sentence::new(value);

    let result = sentence.to_pascal_case();
    let result = CString::new(result).unwrap();

    result.into_raw()
  }

  /// get the name as snake_case
  #[no_mangle]
  extern "C" fn to_snake_case(value: *const c_char) -> *mut c_char {
    let value = unsafe { CStr::from_ptr(value) };
    let value = value.to_str().unwrap();

    let sentence = Sentence::new(value);

    let result = sentence.to_snake_case();
    let result = CString::new(result).unwrap();

    result.into_raw()
  }

  /// get the name as SCREAMING_SNAKE_CASE
  #[no_mangle]
  extern "C" fn to_screaming_snake_case(value: *const c_char) -> *mut c_char {
    let value = unsafe { CStr::from_ptr(value) };
    let value = value.to_str().unwrap();

    let sentence = Sentence::new(value);

    let result = sentence.to_screaming_snake_case();
    let result = CString::new(result).unwrap();

    result.into_raw()
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
    let expected = "AaBcDEF";
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_camel_case() {
    let actual = Sentence::new("   Aa  bc dE_f    ").to_camel_case();
    let expected = "aaBcDEF";
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_snake_case() {
    let actual = Sentence::new("   Aa  bc dE_f    ").to_snake_case();
    let expected = "aa_bc_d_e_f";
    assert_eq!(actual, expected)
  }

  #[test]
  fn test_to_screaming_snake_case() {
    let actual = Sentence::new("   Aa  bc dE_f    ").to_screaming_snake_case();
    let expected = "AA_BC_D_E_F";
    assert_eq!(actual, expected)
  }
}
