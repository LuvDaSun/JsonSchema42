use url::Url;

pub fn normalize_url(url: &Url) -> Url {
    if url.fragment().unwrap_or("") == "" {
        url.join("#").unwrap()
    } else {
        url.clone()
    }
}
