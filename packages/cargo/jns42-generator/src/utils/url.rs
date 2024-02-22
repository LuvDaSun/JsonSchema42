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

impl TryFrom<Url> for ServerUrl {
    type Error = ();

    fn try_from(mut url: Url) -> Result<Self, Self::Error> {
        url.set_fragment(None);
        if url.cannot_be_a_base() {
            Err(())
        } else {
            Ok(Self(url))
        }
    }
}

impl AsRef<Url> for ServerUrl {
    fn as_ref(&self) -> &Url {
        &self.0
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct UrlWithPointer(Url, JsonPointer);

impl TryFrom<Url> for UrlWithPointer {
    type Error = ();

    fn try_from(url: Url) -> Result<Self, Self::Error> {
        if url.cannot_be_a_base() {
            Err(())
        } else {
            let pointer = (&url).into();
            Ok(Self(url, pointer))
        }
    }
}

impl AsRef<Url> for UrlWithPointer {
    fn as_ref(&self) -> &Url {
        &self.0
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct JsonPointer(Vec<String>);

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
