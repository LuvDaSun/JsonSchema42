use hyper::body::Buf;
use serde_json::Deserializer;
use url::Url;

pub async fn load_yaml(url: &Url) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
    let response = reqwest::get(url.as_str()).await?.error_for_status()?;
    let bytes = response.bytes().await?;

    let deserializer = Deserializer::from_reader(bytes.reader());

    // let value = deserializer.next().unwrap();

    todo!()
}

mod test {

    #[tokio::test]
    async fn test_fetch() {
        use super::*;

        let url = "https://spec.openapis.org/oas/3.1/dialect/base"
            .parse()
            .unwrap();
        let _res = load_yaml(&url).await.unwrap();
    }
}
