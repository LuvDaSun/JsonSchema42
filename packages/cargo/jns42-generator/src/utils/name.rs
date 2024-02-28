use inflector::Inflector;
use once_cell::sync::Lazy;
use regex::Regex;

pub static NON_IDENTIFIER_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"[^a-zA-Z0-9]").unwrap());

pub fn to_snake(parts: impl IntoIterator<Item = impl ToString>) -> String {
  parts
    .into_iter()
    .map(|value| value.to_string())
    .map(|part| NON_IDENTIFIER_REGEX.replace_all(&part, "").into_owned())
    .collect::<Vec<_>>()
    .join(" ")
    .to_snake_case()
}

pub fn to_pascal(parts: impl IntoIterator<Item = impl ToString>) -> String {
  parts
    .into_iter()
    .map(|value| value.to_string())
    .map(|part| NON_IDENTIFIER_REGEX.replace_all(&part, "").into_owned())
    .collect::<Vec<_>>()
    .join(" ")
    .to_pascal_case()
}
