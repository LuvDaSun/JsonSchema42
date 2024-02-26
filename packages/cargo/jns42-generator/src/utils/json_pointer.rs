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

        if let Some(fragment) = fragment {
            let path = fragment
                .split('/')
                .filter(|part| !part.is_empty())
                .map(|part| part.to_string())
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
        self.0.join("/")
    }
}
