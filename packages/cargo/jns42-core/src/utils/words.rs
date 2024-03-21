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

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_split_words() {
    let actual = split_words(" a-b c dEf - 123abcDEF456");
    let expected = vec!["a", "b", "c", "d", "Ef", "123", "abc", "DEF", "456"];
    assert_eq!(actual, expected)
  }
}
