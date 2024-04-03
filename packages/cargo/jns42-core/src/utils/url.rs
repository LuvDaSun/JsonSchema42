use super::json_pointer::JsonPointer;
use serde::{Deserialize, Serialize};
use url::{ParseError, Url};

#[derive(Clone, Debug, PartialOrd, Ord, Eq, PartialEq, Hash)]
pub struct ServerUrl(Url);

impl From<UrlWithPointer> for ServerUrl {
  fn from(url: UrlWithPointer) -> Self {
    let mut url = url.0;
    url.set_fragment(None);
    Self(url)
  }
}

#[derive(Clone, Debug, PartialOrd, Ord, Eq, PartialEq, Hash, Serialize, Deserialize)]
#[serde(from = "String")]
#[serde(into = "String")]
pub struct UrlWithPointer(Url, JsonPointer);

impl UrlWithPointer {
  pub fn join(&self, input: &str) -> Result<Self, ParseError> {
    let url = self.0.join(input)?;
    Ok(url.into())
  }

  pub fn parse(input: &str) -> Result<Self, ParseError> {
    let url = Url::parse(input)?;
    Ok(url.into())
  }

  pub fn get_url(&self) -> &Url {
    &self.0
  }

  pub fn get_pointer(&self) -> &Vec<String> {
    self.1.vec()
  }

  pub fn set_pointer(&mut self, pointer: Vec<String>) {
    let pointer: JsonPointer = pointer.into();
    let fragment = pointer.to_string();
    self.0.set_fragment(Some(&fragment));
    self.1 = pointer;
  }

  pub fn as_str(&self) -> &str {
    self.0.as_str()
  }
}

impl From<Url> for UrlWithPointer {
  fn from(url: Url) -> Self {
    let mut url = url;
    let pointer: JsonPointer = (&url).into();
    let fragment = pointer.to_string();
    url.set_fragment(Some(&fragment));
    Self(url, pointer)
  }
}

impl From<String> for UrlWithPointer {
  fn from(url: String) -> Self {
    let url: Url = url.parse().unwrap();
    url.into()
  }
}

impl From<UrlWithPointer> for String {
  fn from(val: UrlWithPointer) -> Self {
    val.to_string()
  }
}

impl ToString for UrlWithPointer {
  fn to_string(&self) -> String {
    self.0.to_string()
  }
}
