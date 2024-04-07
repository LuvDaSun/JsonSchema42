#[derive(Default)]
pub struct DocumentContext {
  //
}

impl DocumentContext {
  pub fn new() -> Self {
    Default::default()
  }

  pub async fn load(&mut self, location: &str) -> String {
    crate::ffi::fetch::fetch(location).await
  }
}
