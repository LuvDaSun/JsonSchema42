use jns42_core::utils::banner;
use std::error::Error;

pub fn generate_file_content(
  package_name: &str,
  package_version: &str,
) -> Result<String, Box<dyn Error>> {
  let package_table = toml::Value::Table({
    let mut map = toml::map::Map::new();
    map.insert(
      "name".to_owned(),
      toml::Value::String(package_name.to_owned()),
    );
    map.insert(
      "version".to_owned(),
      toml::Value::String(package_version.to_owned()),
    );
    map.insert("edition".to_owned(), toml::Value::String("2021".to_owned()));
    map
  });

  let dependencies_table = toml::Value::Table({
    let mut map = toml::map::Map::new();
    map.insert(
      "serde".to_owned(),
      toml::Value::Table({
        let mut map = toml::map::Map::new();
        map.insert("version".to_owned(), toml::Value::String("1.0".to_owned()));
        map.insert(
          "features".to_owned(),
          toml::Value::Array(vec![toml::Value::String("derive".to_owned())]),
        );
        map
      }),
    );
    map.insert(
      "serde_json".to_owned(),
      toml::Value::Table({
        let mut map = toml::map::Map::new();
        map.insert("version".to_owned(), toml::Value::String("1.0".to_owned()));
        map
      }),
    );
    map.insert(
      "clap".to_owned(),
      toml::Value::Table({
        let mut map = toml::map::Map::new();
        map.insert("version".to_owned(), toml::Value::String("4.1".to_owned()));
        map.insert(
          "features".to_owned(),
          toml::Value::Array(vec![toml::Value::String("derive".to_owned())]),
        );
        map
      }),
    );
    map.insert(
      "tokio".to_owned(),
      toml::Value::Table({
        let mut map = toml::map::Map::new();
        map.insert(
          "version".to_owned(),
          toml::Value::String("1.36.0".to_owned()),
        );
        map.insert(
          "features".to_owned(),
          toml::Value::Array(vec![toml::Value::String("full".to_owned())]),
        );
        map
      }),
    );
    map
  });

  let lib_table = toml::Value::Table({
    let mut map = toml::map::Map::new();
    map.insert(
      "path".to_owned(),
      toml::Value::String("src/lib.rs".to_owned()),
    );
    map
  });

  let bin_table = toml::Value::Array(vec![toml::Value::Table({
    let mut map = toml::map::Map::new();
    map.insert(
      "name".to_owned(),
      toml::Value::String(package_name.to_owned()),
    );
    map.insert(
      "path".to_owned(),
      toml::Value::String("src/main.rs".to_owned()),
    );
    map
  })]);

  let features_table = toml::Value::Table({
    let mut map = toml::map::Map::new();
    map.insert("default".to_owned(), toml::Value::Array(vec![]));
    map.insert("deref".to_owned(), toml::Value::Array(vec![]));
    map
  });

  let manifest_table = toml::Value::Table({
    let mut map = toml::map::Map::new();
    map.insert("package".to_owned(), package_table);
    map.insert("dependencies".to_owned(), dependencies_table);
    map.insert("lib".to_owned(), lib_table);
    map.insert("bin".to_owned(), bin_table);
    map.insert("features".to_string(), features_table);
    map
  });

  let content = toml::ser::to_string_pretty(&manifest_table)?;

  Ok(format!(
    "{}\n\n{}",
    banner("#", &format!("v{}", env!("CARGO_PKG_VERSION"))),
    content
  ))
}
