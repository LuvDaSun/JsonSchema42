use crate::imports::fetch_file::fetch_file;

#[derive(Default)]
pub struct DocumentContext {
  //
}

impl DocumentContext {
  pub fn new() -> Self {
    Default::default()
  }

  pub async fn load(&mut self, location: &str) -> String {
    fetch_file(location).await
  }
}
