use crate::imports::fetch::fetch;

#[derive(Default)]
pub struct DocumentContext {
  //
}

impl DocumentContext {
  pub fn new() -> Self {
    Default::default()
  }

  pub async fn load(&mut self, location: &str) -> String {
    fetch(location).await
  }
}
