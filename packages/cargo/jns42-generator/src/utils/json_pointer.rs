use url::Url;

#[derive(Clone, Default, Debug, PartialOrd, Ord, Eq, PartialEq, Hash)]
pub struct JsonPointer(Vec<String>);

impl JsonPointer {
  pub fn push(&self, input: String) -> Self {
    let mut pointer = self.clone();
    pointer.0.push(input);
    pointer
  }

  pub fn tip(&self) -> Option<&str> {
    self.0.last().map(String::as_str)
  }

  pub fn escape(input: &str) -> String {
    // ~ -> ~0
    // / -> ~1
    input.replace('~', "~0").replace('/', "~1")
  }

  pub fn unescape(input: &str) -> String {
    // ~0 -> ~
    // ~1 -> /
    input.replace("~0", "~").replace("~1", "/")
  }
}

impl From<&Url> for JsonPointer {
  fn from(url: &Url) -> Self {
    let fragment = url.fragment();

    if let Some(fragment) = fragment {
      let path = fragment
        .strip_prefix('/')
        .unwrap_or_default()
        .split('/')
        .filter(|part| !part.is_empty())
        .map(Self::unescape)
        .collect();
      Self(path)
    } else {
      Self(Default::default())
    }
  }
}

impl AsRef<Vec<String>> for JsonPointer {
  fn as_ref(&self) -> &Vec<String> {
    &self.0
  }
}

impl ToString for JsonPointer {
  fn to_string(&self) -> String {
    self
      .0
      .iter()
      .map(|part| format!("/{}", Self::escape(part)))
      .reduce(|a, b| a + b.as_str())
      .unwrap_or_default()
  }
}
