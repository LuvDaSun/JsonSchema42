use crate::utils::yaml_deserializer::YamlDeserializer;
use futures_util::StreamExt;

use super::read_url::read_url;

pub async fn load_yaml(url: &str) -> Result<Option<serde_json::Value>, Box<dyn std::error::Error>> {
  let stream = read_url(url).await?;

  let mut deserializer = YamlDeserializer::new(stream);
  if let Some(item) = deserializer.next().await {
    let item = item?;

    Ok(Some(item))
  } else {
    Ok(None)
  }
}

mod test {

  #[tokio::test]
  async fn test_fetch() {
    use super::*;

    let url = "https://spec.openapis.org/oas/3.1/dialect/base";
    let response = load_yaml(url).await.unwrap();

    assert!(response.is_some())
  }
}
