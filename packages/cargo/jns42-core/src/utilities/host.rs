use crate::{Host, exports};

impl exports::jns42::core::utilities::Guest for Host {
  fn banner(prefix: String, version: String) -> String {
    super::banner(&prefix, &version)
  }
}
