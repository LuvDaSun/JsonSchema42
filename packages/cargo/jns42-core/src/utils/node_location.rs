use once_cell::sync::Lazy;
use regex::{Regex, RegexBuilder};
use std::{
  error::Error,
  ffi::{c_char, CStr, CString},
  fmt::Display,
  hash::Hash,
  iter::once,
  ptr::null,
  str::FromStr,
};

pub static URL_REGEX: Lazy<Regex> = Lazy::new(|| {
  RegexBuilder::new(r"^([a-z]+\:(?:\/\/)?[^\/]*)?([^\?\#]*?)?(\?.*?)?(\#.*?)?$")
    .unicode(true)
    .case_insensitive(true)
    .build()
    .unwrap()
});

#[derive(
  Clone, Debug, Hash, PartialEq, Eq, PartialOrd, Ord, serde::Serialize, serde::Deserialize,
)]
#[serde(try_from = "&str")]
#[serde(into = "String")]

pub struct NodeLocation {
  origin: String,
  path: Vec<String>,
  query: String,
  hash: Vec<String>,
}

impl NodeLocation {
  fn new(origin: String, path: Vec<String>, query: String, hash: Vec<String>) -> Self {
    Self {
      origin,
      path: normalize_path(path),
      query,
      hash,
    }
  }

  pub fn get_anchor(&self) -> Option<&str> {
    return self.hash.first().map(|part| part.as_str());
  }

  pub fn get_pointer(&self) -> Option<Vec<&str>> {
    if self.hash.len() > 1 {
      Some(self.hash.iter().skip(1).map(|part| part.as_str()).collect())
    } else {
      None
    }
  }

  pub fn get_path(&self) -> Vec<&str> {
    self.path.iter().map(|value| value.as_str()).collect()
  }

  pub fn get_hash(&self) -> Vec<&str> {
    self.hash.iter().map(|value| value.as_str()).collect()
  }

  pub fn set_anchor(&mut self, value: impl Into<String>) {
    self.hash = once(value).map(|part| part.into()).collect();
  }

  pub fn set_pointer(&mut self, value: impl IntoIterator<Item = impl Into<String>>) {
    self.hash = once(String::new())
      .chain(value.into_iter().map(|part| part.into()))
      .collect();
  }

  pub fn set_root(&mut self) {
    self.hash = Vec::new();
  }

  pub fn to_retrieval_string(&self) -> String {
    let origin = &self.origin;
    let path = self
      .path
      .iter()
      .map(|part| urlencoding::encode(part))
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
        );
      }
    }

    if !other.query.is_empty() {
      return NodeLocation::new(
        self.origin.clone(),
        self.path.clone(),
        other.query.clone(),
        other.hash.clone(),
      );
    }

    NodeLocation::new(
      self.origin.clone(),
      self.path.clone(),
      self.query.clone(),
      other.hash.clone(),
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
        .map(|part| urlencoding::decode(part).map_err(|_error| ParseError::DecodeError))
        .map(|part| part.map(unescape_hash))
        .collect::<Result<_, _>>()?
    };

    let query = query_capture
      .map(|capture| capture.as_str())
      .map(|capture| capture.to_string())
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
        .map(|part| urlencoding::decode(part).map_err(|_error| ParseError::DecodeError))
        .map(|part| part.map(unescape_hash))
        .collect::<Result<_, _>>()?
    };

    Ok(Self::new(origin, path, query, hash))
  }
}

impl From<&NodeLocation> for String {
  fn from(value: &NodeLocation) -> Self {
    let origin = &value.origin;
    let path = value
      .path
      .iter()
      .map(|part| urlencoding::encode(part))
      .collect::<Vec<_>>()
      .join("/");
    let query = &value.query;

    let hash = "#".to_string()
      + &value
        .hash
        .iter()
        .map(escape_hash)
        .map(|part| urlencoding::encode(&part).into_owned())
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

#[no_mangle]
extern "C" fn node_location_drop(node_location: *mut NodeLocation) {
  assert!(!node_location.is_null());

  drop(unsafe { Box::from_raw(node_location) });
}

#[no_mangle]
extern "C" fn node_location_clone(node_location: *const NodeLocation) -> *mut NodeLocation {
  assert!(!node_location.is_null());

  let node_location = unsafe { &*node_location };

  let result = node_location.clone();
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_parse(input: *const c_char) -> *mut NodeLocation {
  assert!(!input.is_null());

  let input = unsafe { CStr::from_ptr(input) };
  let input = input.to_str().unwrap();

  let node_location = input.parse().unwrap();
  let node_location = Box::new(node_location);

  Box::into_raw(node_location)
}

#[no_mangle]
extern "C" fn node_location_join(
  node_location: *const NodeLocation,
  other_node_location: *const NodeLocation,
) -> *mut NodeLocation {
  assert!(!node_location.is_null());
  assert!(!other_node_location.is_null());

  let node_location = unsafe { &*node_location };
  let other_node_location = unsafe { &*other_node_location };

  let result = node_location.join(other_node_location);
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_to_string(node_location: *const NodeLocation) -> *mut c_char {
  assert!(!node_location.is_null());

  let node_location = unsafe { &*node_location };

  let result = node_location.to_string();
  let result = CString::new(result).unwrap();

  result.into_raw()
}

#[no_mangle]
extern "C" fn node_location_to_retrieval_string(node_location: *const NodeLocation) -> *mut c_char {
  assert!(!node_location.is_null());

  let node_location = unsafe { &*node_location };

  let result = node_location.to_retrieval_string();
  let result = CString::new(result).unwrap();

  result.into_raw()
}

#[no_mangle]
extern "C" fn node_location_get_anchor(node_location: *mut NodeLocation) -> *const c_char {
  assert!(!node_location.is_null());

  let node_location = unsafe { &mut *node_location };

  let result = node_location.get_anchor();
  let Some(result) = result else {
    return null();
  };
  let result = result.to_owned();
  let result = CString::new(result).unwrap();

  result.into_raw()
}

#[no_mangle]
extern "C" fn node_location_get_pointer(node_location: *mut NodeLocation) -> *const Vec<String> {
  let node_location = unsafe { &mut *node_location };

  let result = node_location.get_pointer();
  let Some(result) = result else {
    return null();
  };
  let result = result.into_iter().map(|value| value.to_owned()).collect();
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_get_path(node_location: *mut NodeLocation) -> *const Vec<String> {
  let node_location = unsafe { &mut *node_location };

  let result = node_location.get_path();
  let result = result.into_iter().map(|value| value.to_owned()).collect();
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_get_hash(node_location: *mut NodeLocation) -> *const Vec<String> {
  let node_location = unsafe { &mut *node_location };

  let result = node_location.get_hash();
  let result = result.into_iter().map(|value| value.to_owned()).collect();
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_set_anchor(node_location: *mut NodeLocation, anchor: *const c_char) {
  assert!(!node_location.is_null());
  assert!(!anchor.is_null());

  let node_location = unsafe { &mut *node_location };
  let anchor = unsafe { CStr::from_ptr(anchor) };
  let anchor = anchor.to_str().unwrap();

  node_location.set_anchor(anchor);
}

#[no_mangle]
extern "C" fn node_location_set_pointer(
  node_location: *mut NodeLocation,
  pointer: *const Vec<String>,
) {
  assert!(!node_location.is_null());
  assert!(!pointer.is_null());

  let node_location = unsafe { &mut *node_location };
  let pointer = unsafe { &*pointer };

  node_location.set_pointer(pointer);
}

#[no_mangle]
extern "C" fn node_location_set_root(node_location: *mut NodeLocation) {
  assert!(!node_location.is_null());

  let node_location = unsafe { &mut *node_location };

  node_location.set_root();
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
