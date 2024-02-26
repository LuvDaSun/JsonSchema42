use super::json_pointer::JsonPointer;
use std::hash::{Hash, Hasher};
use url::{ParseError, Url};

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct ServerUrl(Url);

impl From<UrlWithPointer> for ServerUrl {
    fn from(url: UrlWithPointer) -> Self {
        let mut url = url.0;
        url.set_fragment(None);
        Self(url)
    }
}

#[derive(Clone, Debug, Eq)]
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

    pub fn get_pointer(&self) -> &JsonPointer {
        &self.1
    }
}

impl Hash for UrlWithPointer {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.0.scheme().hash(state);
        self.0.host().hash(state);
        self.0.port_or_known_default().hash(state);
        self.0.path().hash(state);
        self.0.query().unwrap_or("").hash(state);
        self.1.hash(state);
    }
}

impl PartialEq for UrlWithPointer {
    fn eq(&self, other: &Self) -> bool {
        self.0.scheme() == other.0.scheme()
            && self.0.host() == other.0.host()
            && self.0.port_or_known_default() == other.0.port_or_known_default()
            && self.0.path() == other.0.path()
            && self.0.query().unwrap_or("") == other.0.query().unwrap_or("")
            && self.1 == other.1
    }
}

impl From<Url> for UrlWithPointer {
    fn from(url: Url) -> Self {
        let pointer = (&url).into();
        Self(url, pointer)
    }
}

impl ToString for UrlWithPointer {
    fn to_string(&self) -> String {
        self.0.to_string()
    }
}
