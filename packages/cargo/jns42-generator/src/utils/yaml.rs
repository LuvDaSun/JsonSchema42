use crate::utils::yaml_deserializer::YamlDeserializer;
use futures_util::StreamExt;
use futures_util::TryStreamExt;
use std::error::Error;
use url::Url;

pub async fn load_yaml(url: &Url) -> Result<Option<serde_json::Value>, Box<dyn std::error::Error>> {
    let response = reqwest::get(url.as_str()).await?.error_for_status()?;
    let body = response
        .bytes_stream()
        .map_err(|error| Box::new(error) as Box<dyn Error>);

    let mut deserializer = YamlDeserializer::new(body);
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

        let url = "https://spec.openapis.org/oas/3.1/dialect/base"
            .parse()
            .unwrap();
        let response = load_yaml(&url).await.unwrap();

        assert!(response.is_some())
    }
}
