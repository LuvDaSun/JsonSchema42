pub fn join_json_pointer(parts: Vec<&str>) -> String {
    parts
        .iter()
        .map(|part| urlencoding::encode(part))
        .collect::<Vec<_>>()
        .join("/")
}
