use jns42_core::utilities::banner;
use std::error::Error;

pub fn generate_file_content(
  package_name: &str,
  package_version: &str,
) -> Result<String, Box<dyn Error>> {
  let manifest = toml::toml! {
    [package]
    name = package_name
    version = package_version
    edition = "2024"

    [dependencies]
    jns42-lib = "0.1"
    clap = { version = "^4.1", features = ["derive"] }
    serde = { version = "^1.0", features = ["derive"] }
    serde_json = "1.0"

    [lib]
    path = "src/lib.rs"

    [[bin]]
    name = package_name
    path = "src/main.rs"

    [features]
    default = []
    deref = []
  };

  let content = toml::ser::to_string_pretty(&manifest)?;

  Ok(format!(
    "{}\n\n{}",
    banner("#", &format!("v{}", env!("CARGO_PKG_VERSION"))),
    content
  ))
}
