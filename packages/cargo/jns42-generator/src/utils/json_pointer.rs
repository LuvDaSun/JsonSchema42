use url::Url;

#[derive(Clone, Debug, PartialEq, Eq, Hash, Default)]
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
