use once_cell::sync::Lazy;
use percent_encoding::percent_decode_str;
use regex::{Regex, RegexBuilder};
use std::{error::Error, fmt::Display, str::FromStr};

pub static URL_REGEX: Lazy<Regex> = Lazy::new(|| {
  RegexBuilder::new(r"^([a-z]+\:(?:\/\/)?[^\/]*)?([^\?\#]*?)?(\?.*?)?(\#.*?)?$")
    .unicode(true)
    .ignore_whitespace(true)
    .build()
    .unwrap()
});

#[derive(
  Clone, Debug, PartialOrd, Ord, Eq, PartialEq, Hash, serde::Serialize, serde::Deserialize,
)]
#[serde(try_from = "String")]
#[serde(into = "String")]

pub struct NodeLocation {
  origin: String,
  path: Vec<String>,
  query: String,
  pointer: Vec<String>,
}

impl TryFrom<String> for NodeLocation {
  type Error = ParseError;

  fn try_from(value: String) -> Result<Self, Self::Error> {
    value.parse()
  }
}

impl From<NodeLocation> for String {
  fn from(value: NodeLocation) -> Self {
    value.to_string()
  }
}

impl ToString for NodeLocation {
  fn to_string(&self) -> String {
    todo!()
  }
}

impl FromStr for NodeLocation {
  type Err = ParseError;

  fn from_str(input: &str) -> Result<Self, Self::Err> {
    let input = input.replace('\\', "/");

    let input_captures = URL_REGEX.captures(&input).ok_or(ParseError::InvalidInput)?;

    let origin_capture = input_captures.get(1);
    let path_capture = input_captures.get(2);
    let query_capture = input_captures.get(3);
    let hash_capture = input_captures.get(4);

    let origin = origin_capture
      .map(|capture| capture.as_str())
      .map(|capture| capture.to_string())
      .unwrap_or_default();

    let path = path_capture
      .map(|capture| capture.as_str())
      .unwrap_or_default()
      .split('/')
      .map(percent_decode_str)
      .map(|part| part.decode_utf8().map_err(|_error| ParseError::DecodeError))
      .map(|part| part.map(unescape_pointer))
      .collect::<Result<_, _>>()?;

    let query = query_capture
      .map(|capture| capture.as_str())
      .map(|capture| capture.to_string())
      .unwrap_or_default();

    let pointer = hash_capture
      .map(|capture| capture.as_str())
      .map(|capture| capture.trim_start_matches('#'))
      .unwrap_or_default()
      .split('/')
      .map(percent_decode_str)
      .map(|part| part.decode_utf8().map_err(|_error| ParseError::DecodeError))
      .map(|part| part.map(unescape_pointer))
      .collect::<Result<_, _>>()?;

    Ok(Self {
      origin,
      path,
      query,
      pointer,
    })
  }
}

#[derive(PartialEq, Eq, Clone, Copy, Debug)]
pub enum ParseError {
  InvalidInput,
  DecodeError,
}

impl Display for ParseError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      ParseError::InvalidInput => write!(f, "Invalid input"),
      ParseError::DecodeError => write!(f, "Decode error"),
    }
  }
}

impl Error for ParseError {}

fn escape_pointer(input: impl AsRef<str>) -> String {
  input.as_ref().replace('~', "~0").replace('/', "~1")
}

fn unescape_pointer(input: impl AsRef<str>) -> String {
  input.as_ref().replace("~1", "/").replace("~0", "~")
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_escape_pointer() {
    let actual = escape_pointer("~~//:-)");
    let expected = "~0~0~1~1:-)".to_string();

    assert_eq!(actual, expected);
  }

  #[test]
  fn test_unescape_pointer() {
    let actual = unescape_pointer("~~~0~~~1~01:-)");
    let expected = "~~~~~/~1:-)".to_string();

    assert_eq!(actual, expected);
  }
}
