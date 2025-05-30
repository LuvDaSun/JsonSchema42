use wasm_bindgen::prelude::*;

pub enum FetchTextError {
  IoError,
  HttpError,
}

impl From<std::io::Error> for FetchTextError {
  fn from(_value: std::io::Error) -> Self {
    Self::IoError
  }
}

impl From<JsValue> for FetchTextError {
  fn from(_value: JsValue) -> Self {
    Self::HttpError
  }
}

#[cfg(not(target_arch = "wasm32"))]
impl From<surf::Error> for FetchTextError {
  fn from(_value: surf::Error) -> Self {
    Self::HttpError
  }
}

#[wasm_bindgen(module = "/src/utilities/fetch_text.js")]
extern "C" {
  #[wasm_bindgen(catch, js_name = "fetchText")]
  async fn fetch_text_js(location: &str) -> Result<JsValue, JsValue>;
}

#[cfg(target_arch = "wasm32")]
pub async fn fetch_text(location: &str) -> Result<String, FetchTextError> {
  let text = fetch_text_js(location).await?;
  let text = text.as_string().unwrap_or_default();

  Ok(text)
}

#[cfg(not(target_arch = "wasm32"))]
pub async fn fetch_text(location: &str) -> Result<String, FetchTextError> {
  use tokio::fs::File;
  use tokio::io::AsyncReadExt;

  if location.starts_with("http://") || location.starts_with("https://") {
    let mut response = surf::get(location)
      .middleware(surf::middleware::Redirect::new(5))
      .await?;
    let data = response.body_string().await?;
    Ok(data)
  } else {
    let mut file = File::open(location).await?;
    let metadata = file.metadata().await?;
    let mut data = String::with_capacity(metadata.len() as usize);
    file.read_to_string(&mut data).await?;
    Ok(data)
  }
}
