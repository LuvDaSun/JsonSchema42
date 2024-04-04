use core::hash::Hash;
use once_cell::sync::Lazy;
use percent_encoding::{percent_decode_str, utf8_percent_encode, NON_ALPHANUMERIC};
use regex::{Regex, RegexBuilder};
use std::{error::Error, fmt::Display, iter::once, str::FromStr};

pub static URL_REGEX: Lazy<Regex> = Lazy::new(|| {
  RegexBuilder::new(r"^([a-z]+\:(?:\/\/)?[^\/]*)?([^\?\#]*?)?(\?.*?)?(\#.*?)?$")
    .unicode(true)
    .case_insensitive(true)
    .build()
    .unwrap()
});

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
#[serde(try_from = "&str")]
#[serde(into = "String")]

pub struct NodeLocation {
  origin: String,
  path: Vec<String>,
  query: String,
  hash: Vec<String>,
  keep_hash: bool,
}

impl NodeLocation {
  fn new(
    origin: String,
    path: Vec<String>,
    query: String,
    hash: Vec<String>,
    keep_hash: bool,
  ) -> Self {
    Self {
      origin,
      path: normalize_path(path),
      query,
      hash,
      keep_hash,
    }
  }

  pub fn get_anchor(&self) -> Option<&str> {
    return self.hash.first().map(|part| part.as_str());
  }

  pub fn set_anchor(&mut self, value: impl ToString) {
    self.hash = once(value).map(|part| part.to_string()).collect();
  }

  pub fn get_pointer(&self) -> Option<Vec<&str>> {
    if self.hash.len() > 1 {
      Some(self.hash.iter().skip(1).map(|part| part.as_str()).collect())
    } else {
      None
    }
  }

  pub fn set_pointer(&mut self, value: impl IntoIterator<Item = impl ToString>) {
    self.hash = once(String::new())
      .chain(value.into_iter().map(|part| part.to_string()))
      .collect();
  }

  pub fn get_path(&self) -> Vec<&str> {
    self.path.iter().map(|value| value.as_str()).collect()
  }

  pub fn get_hash(&self) -> Vec<&str> {
    self.hash.iter().map(|value| value.as_str()).collect()
  }

  pub fn to_retrieval_location(&self) -> String {
    let origin = &self.origin;
    let path = self
      .path
      .iter()
      .map(|part| utf8_percent_encode(part, NON_ALPHANUMERIC).to_string())
      .collect::<Vec<_>>()
      .join("/");
    let query = &self.query;

    return origin.to_string() + path.as_str() + query.as_str();
  }

  pub fn join(&self, other: &NodeLocation) -> Self {
    if !other.origin.is_empty() {
      return other.clone();
    }

    if !other.path.is_empty() {
      if other.path.first().unwrap().is_empty() {
        return NodeLocation::new(
          self.origin.clone(),
          other.path.clone(),
          other.query.clone(),
          other.hash.clone(),
          self.keep_hash,
        );
      } else {
        return NodeLocation::new(
          self.origin.clone(),
          self
            .path
            .iter()
            .take(self.path.len() - 1)
            .chain(other.path.iter())
            .cloned()
            .collect(),
          other.query.clone(),
          other.hash.clone(),
          self.keep_hash,
        );
      }
    }

    if !other.query.is_empty() {
      return NodeLocation::new(
        self.origin.clone(),
        self.path.clone(),
        other.query.clone(),
        other.hash.clone(),
        self.keep_hash,
      );
    }

    NodeLocation::new(
      self.origin.clone(),
      self.path.clone(),
      self.query.clone(),
      other.hash.clone(),
      self.keep_hash,
    )
  }
}

impl TryFrom<&str> for NodeLocation {
  type Error = ParseError;

  fn try_from(value: &str) -> Result<Self, Self::Error> {
    let input = value.replace('\\', "/");

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
      .unwrap_or_default();
    let path = if path.is_empty() {
      Default::default()
    } else {
      path
        .split('/')
        .map(percent_decode_str)
        .map(|part| part.decode_utf8().map_err(|_error| ParseError::DecodeError))
        .map(|part| part.map(unescape_hash))
        .collect::<Result<_, _>>()?
    };

    let query = query_capture
      .map(|capture| capture.as_str())
      .map(|capture| capture.to_string())
      .unwrap_or_default();

    let keep_hash = hash_capture
      .map(|capture| capture.as_str())
      .map(|capture| capture.starts_with('#'))
      .unwrap_or_default();

    let hash = hash_capture
      .map(|capture| capture.as_str())
      .map(|capture| capture.trim_start_matches('#'))
      .unwrap_or_default();
    let hash = if hash.is_empty() {
      Default::default()
    } else {
      hash
        .split('/')
        .map(percent_decode_str)
        .map(|part| part.decode_utf8().map_err(|_error| ParseError::DecodeError))
        .map(|part| part.map(unescape_hash))
        .collect::<Result<_, _>>()?
    };

    Ok(Self::new(origin, path, query, hash, keep_hash))
  }
}

impl From<&NodeLocation> for String {
  fn from(value: &NodeLocation) -> Self {
    let origin = &value.origin;
    let path = value
      .path
      .iter()
      .map(|part| utf8_percent_encode(part, NON_ALPHANUMERIC).to_string())
      .collect::<Vec<_>>()
      .join("/");
    let query = &value.query;

    let hash = if value.keep_hash || !value.hash.is_empty() {
      "#".to_string()
    } else {
      String::new()
    } + &value
      .hash
      .iter()
      .map(escape_hash)
      .map(|part| utf8_percent_encode(part.as_str(), NON_ALPHANUMERIC).to_string())
      .collect::<Vec<_>>()
      .join("/");

    return origin.to_string() + path.as_str() + query.as_str() + hash.as_str();
  }
}

impl From<NodeLocation> for String {
  fn from(value: NodeLocation) -> Self {
    (&value).into()
  }
}

impl Display for NodeLocation {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    let s: String = self.into();
    write!(f, "{}", s)
  }
}

impl FromStr for NodeLocation {
  type Err = ParseError;

  fn from_str(input: &str) -> Result<Self, Self::Err> {
    input.try_into()
  }
}

impl Hash for NodeLocation {
  fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
    self.origin.hash(state);
    self.path.hash(state);
    self.query.hash(state);
    self.hash.hash(state);
  }
}

impl Eq for NodeLocation {}
impl PartialEq for NodeLocation {
  fn eq(&self, other: &Self) -> bool {
    self.origin == other.origin
      && self.path == other.path
      && self.query == other.query
      && self.hash == other.hash
  }
}

impl Ord for NodeLocation {
  fn cmp(&self, other: &Self) -> std::cmp::Ordering {
    match self.origin.cmp(&other.origin) {
      core::cmp::Ordering::Equal => {}
      ord => return ord,
    }
    match self.path.cmp(&other.path) {
      core::cmp::Ordering::Equal => {}
      ord => return ord,
    }
    match self.query.cmp(&other.query) {
      core::cmp::Ordering::Equal => {}
      ord => return ord,
    }
    match self.hash.cmp(&other.hash) {
      core::cmp::Ordering::Equal => {}
      ord => return ord,
    }
    core::cmp::Ordering::Equal
  }
}
impl PartialOrd for NodeLocation {
  fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
    Some(self.cmp(other))
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

fn escape_hash(input: impl AsRef<str>) -> String {
  input.as_ref().replace('~', "~0").replace('/', "~1")
}

fn unescape_hash(input: impl AsRef<str>) -> String {
  input.as_ref().replace("~1", "/").replace("~0", "~")
}

fn normalize_path(path: impl IntoIterator<Item = impl ToString>) -> Vec<String> {
  let mut path: Vec<_> = path.into_iter().map(|part| part.to_string()).collect();

  let mut path_index = 0;

  while path_index < path.len() {
    // first or last parts may be empty
    if (path_index == 0 || path_index == path.len() - 1) && path[path_index].is_empty() {
      path_index += 1;
      continue;
    }

    // empty parts, or paths that are a dot are removed
    if path[path_index].is_empty() || path[path_index] == "." {
      path.remove(path_index);
      continue;
    }

    if path[path_index] == ".." && path_index > 0 && path[path_index - 1].is_empty() {
      path.remove(path_index);
      continue;
    }

    if path[path_index] == ".." && path_index > 0 && path[path_index - 1] != ".." {
      path.remove(path_index);
      path_index -= 1;
      path.remove(path_index);
      continue;
    }

    path_index += 1;
  }

  path
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_escape_hash() {
    let actual = escape_hash("~~//:-)");
    let expected = "~0~0~1~1:-)".to_string();

    assert_eq!(actual, expected);
  }

  #[test]
  fn test_unescape_hash() {
    let actual = unescape_hash("~~~0~~~1~01:-)");
    let expected = "~~~~~/~1:-)".to_string();

    assert_eq!(actual, expected);
  }

  #[test]
  fn test_normalize_path() {
    do_test(vec!["", "a", "b", "..", "c"], vec!["", "a", "c"]);

    do_test(vec!["", "..", "..", "a", "b", "c"], vec!["", "a", "b", "c"]);

    do_test(
      vec!["..", "..", "a", "b", "c"],
      vec!["..", "..", "a", "b", "c"],
    );

    do_test(
      vec!["a", "b", "c", "..", "..", "..", "..", "x"],
      vec!["..", "x"],
    );

    fn do_test(actual: Vec<&str>, expected: Vec<&str>) {
      let actual = normalize_path(actual);
      assert_eq!(actual, expected);
    }
  }

  #[test]
  fn test_url_regex() {
    do_test(
      "http://www.example.com",
      vec!["http://www.example.com", "", "", ""],
    );

    do_test(
      "http://www.example.com/",
      vec!["http://www.example.com", "/", "", ""],
    );

    do_test(
      "http://www.example.com/a/b/c",
      vec!["http://www.example.com", "/a/b/c", "", ""],
    );

    do_test(
      "http://www.example.com/a/b/c?123",
      vec!["http://www.example.com", "/a/b/c", "?123", ""],
    );

    do_test(
      "http://www.example.com/a/b/c?123#xxx",
      vec!["http://www.example.com", "/a/b/c", "?123", "#xxx"],
    );

    do_test(
      "http://www.example.com/a/b/c#xxx",
      vec!["http://www.example.com", "/a/b/c", "", "#xxx"],
    );

    do_test("/a/b/c#xxx", vec!["", "/a/b/c", "", "#xxx"]);

    do_test("a/b/c?xxx", vec!["", "a/b/c", "?xxx", ""]);

    do_test("whoop", vec!["", "whoop", "", ""]);

    do_test("#", vec!["", "", "", "#"]);

    fn do_test(actual: &str, expected: Vec<&str>) {
      let actual: Vec<_> = URL_REGEX
        .captures(actual)
        .unwrap()
        .iter()
        .skip(1)
        .map(|capture| capture.map(|capture| capture.as_str()))
        .map(|capture| capture.unwrap_or_default())
        .collect();

      assert_eq!(actual, expected);
    }
  }

  #[test]
  fn node_location_parse_path() {
    do_test("a", vec!["a"]);

    do_test("a#", vec!["a"]);

    do_test("a#/", vec!["a"]);

    do_test("a#/1/2/3", vec!["a"]);

    do_test("a#/1/2/3#", vec!["a"]);

    fn do_test(actual: &str, expected: Vec<&str>) {
      let actual = actual.parse::<NodeLocation>().unwrap().path;
      assert_eq!(actual, expected);
    }
  }

  #[test]
  fn node_location_parse_pointer() {
    do_test("", vec![]);

    do_test("#", vec![]);

    do_test("#/", vec!["", ""]);

    do_test("#/1/2/3", vec!["", "1", "2", "3"]);

    fn do_test(actual: &str, expected: Vec<&str>) {
      let actual = actual.parse::<NodeLocation>().unwrap().hash;
      assert_eq!(actual, expected);
    }
  }

  #[test]
  fn node_location_join() {
    do_test(
      "http://a.b.c/d/e/f#/g/h/i",
      "http://x.y.z/",
      "http://x.y.z/",
    );

    do_test("http://a.b.c/d/e/f#/g/h/i", "c:\\x", "c:/x");

    do_test("http://a.b.c/d/e/f#/g/h/i", "/x/y/z", "http://a.b.c/x/y/z#");

    do_test(
      "http://a.b.c/d/e/f#/g/h/i",
      "/x/y/z/",
      "http://a.b.c/x/y/z/#",
    );

    do_test("c:\\a\\d\\e\\f", "/x/y/z/", "c:/x/y/z/#");

    do_test(
      "http://a.b.c/d/e/f#/g/h/i",
      "x/y/z/",
      "http://a.b.c/d/e/x/y/z/#",
    );

    do_test("c:\\a\\d\\e\\f", "x/y/z/", "c:/a/d/e/x/y/z/#");

    do_test(
      "http://a.b.c/d/e/f/#/g/h/i",
      "x/y/z/",
      "http://a.b.c/d/e/f/x/y/z/#",
    );

    do_test(
      "http://a.b.c/d/e/f/#/g/h/i",
      "#/x/y/z/",
      "http://a.b.c/d/e/f/#/x/y/z/",
    );

    do_test(
      "http://a.b.c/d/e/f/#/g/h/i",
      "?x=y",
      "http://a.b.c/d/e/f/?x=y",
    );

    do_test("http://a.b.c/d/e?f#/g/h/i", "?x=y", "http://a.b.c/d/e?x=y");

    fn do_test(base: &str, other: &str, expected: &str) {
      let actual = base
        .parse::<NodeLocation>()
        .unwrap()
        .join(&other.parse().unwrap());
      let expected = expected.parse::<NodeLocation>().unwrap();
      assert_eq!(actual, expected);
    }
  }
}
