use super::read_stream::ReadStream;
use futures_util::{Stream, StreamExt};
use std::{error::Error, fmt::Display};
use tokio::fs::File;
use url::Url;

pub type ReadUrlItem = Result<Vec<u8>, Box<dyn Error>>;

pub async fn read_url(
  url: &Url,
) -> Result<Box<dyn Stream<Item = ReadUrlItem> + Unpin>, Box<dyn Error>> {
  let scheme = url.scheme();
  match scheme {
    "file" => {
      let file = File::open(url.to_file_path().unwrap()).await?;
      let stream = ReadStream::new(file);
      let stream = stream.map(|item| item.map_err(|error| Box::new(error) as Box<dyn Error>));

      Ok(Box::new(stream))
    }
    "http" | "https" => {
      let response = reqwest::get(url.as_str()).await?.error_for_status()?;
      let stream = response.bytes_stream();
      let stream = stream.map(|item| {
        item
          .map(|value| value.into())
          .map_err(|error| Box::new(error) as Box<dyn Error>)
      });

      Ok(Box::new(stream))
    }
    _ => Err(Box::new(SchemeNotSupportedError::new(scheme.into()))),
  }
}

#[derive(Debug)]
pub struct SchemeNotSupportedError {
  scheme: String,
}

impl SchemeNotSupportedError {
  pub fn new(scheme: String) -> Self {
    Self { scheme }
  }
}

impl Display for SchemeNotSupportedError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "Scheme {} not supported", self.scheme)
  }
}

impl Error for SchemeNotSupportedError {}
