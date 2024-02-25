use std::iter::empty;

pub fn make_names<'f>(
    urls: impl Iterator<Item = &'f String>,
) -> impl Iterator<Item = (String, Vec<String>)> {
    empty()
}
