impl crate::exports::jns42::core::utilities::Guest for crate::Host {
  fn banner(prefix: String, version: String) -> String {
    super::banner(&prefix, &version)
  }
}
