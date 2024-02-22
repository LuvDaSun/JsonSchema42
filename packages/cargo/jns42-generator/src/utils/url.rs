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

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct UrlWithPointer(Url, JsonPointer);

impl UrlWithPointer {
    pub fn push_pointer(&self, input: String) -> Self {
        let pointer = self.1.push(input);
        let mut url = self.0.clone();
        url.set_fragment(Some(&pointer.to_string()));
        Self(url, pointer)
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

#[derive(Clone, Debug, PartialEq, Eq)]
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
