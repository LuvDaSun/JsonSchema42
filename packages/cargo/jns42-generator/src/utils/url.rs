use std::hash::{Hash, Hasher};
use url::Url;

pub fn normalize_url(url: &Url) -> Url {
    if url.fragment().unwrap_or("") == "" {
        url.join("#").unwrap()
    } else {
        url.clone()
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ServerUrl(Url);

impl From<Url> for ServerUrl {
    fn from(mut url: Url) -> Self {
        url.set_fragment(None);
        Self(url)
    }
}

impl AsRef<Url> for ServerUrl {
    fn as_ref(&self) -> &Url {
        &self.0
    }
}

#[derive(Clone, Debug, Eq)]
pub struct UrlWithPointer(Url, JsonPointer);

impl UrlWithPointer {
    pub fn push_pointer(&self, input: String) -> Self {
        let pointer = self.1.push(input);
        let mut url = self.0.clone();
        url.set_fragment(Some(&pointer.to_string()));
        Self(url, pointer)
    }
}

impl Hash for UrlWithPointer {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.0.scheme().hash(state);
        self.0.host().hash(state);
        self.0.port_or_known_default().hash(state);
        self.0.path().hash(state);
        self.0.query().unwrap_or("?").hash(state);
        self.1.hash(state);
    }
}

impl PartialEq for UrlWithPointer {
    fn eq(&self, other: &Self) -> bool {
        self.0.scheme() == other.0.scheme()
            && self.0.host() == other.0.host()
            && self.0.port_or_known_default() == other.0.port_or_known_default()
            && self.0.path() == other.0.path()
            && self.0.query().unwrap_or("?") == other.0.query().unwrap_or("?")
            && self.1 == other.1
    }
}

impl From<Url> for UrlWithPointer {
    fn from(url: Url) -> Self {
        let pointer = (&url).into();
        Self(url, pointer)
    }
}

impl AsRef<Url> for UrlWithPointer {
    fn as_ref(&self) -> &Url {
        &self.0
    }
}

impl AsRef<JsonPointer> for UrlWithPointer {
    fn as_ref(&self) -> &JsonPointer {
        &self.1
    }
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct JsonPointer(Vec<String>);

impl JsonPointer {
    pub fn push(&self, input: String) -> Self {
        let mut pointer = self.clone();
        pointer.0.push(input);
        pointer
    }
}

impl From<&Url> for JsonPointer {
    fn from(url: &Url) -> Self {
        let fragment = url.fragment();

        if let Some(mut fragment) = fragment {
            fragment = fragment.strip_prefix('#').unwrap_or(fragment);
            let path = fragment.split('/').map(|part| part.to_string()).collect();
            Self(path)
        } else {
            Self(Default::default())
        }
    }
}

impl ToString for JsonPointer {
    fn to_string(&self) -> String {
        self.0.join("/")
    }
}
