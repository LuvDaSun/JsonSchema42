pub enum FetchTextError {
  IoError,
  HttpError,
}

#[cfg(target_arch = "wasm32")]
impl From<crate::jns42::core::imports::FetchTextError> for FetchTextError {
  fn from(value: crate::jns42::core::imports::FetchTextError) -> Self {
    match value {
      crate::jns42::core::imports::FetchTextError::IoError => FetchTextError::IoError,
      crate::jns42::core::imports::FetchTextError::HttpError => FetchTextError::HttpError,
    }
  }
}

#[cfg(target_arch = "wasm32")]
pub fn fetch_text(location: &str) -> Result<String, FetchTextError> {
  let text = crate::jns42::core::imports::fetch_text(location)?;

  Ok(text)
}

#[cfg(not(target_arch = "wasm32"))]
impl From<std::io::Error> for FetchTextError {
  fn from(_value: std::io::Error) -> Self {
    Self::IoError
  }
}

#[cfg(not(target_arch = "wasm32"))]
pub fn fetch_text(location: &str) -> Result<String, FetchTextError> {
  if location.starts_with("http://") || location.starts_with("https://") {
    Err(FetchTextError::HttpError)
  } else {
    use std::{fs, io::Read};

    let mut file = fs::File::open(location)?;
    let metadata = file.metadata()?;
    let mut data = String::with_capacity(metadata.len() as usize);
    file.read_to_string(&mut data)?;
    Ok(data)
  }
}
