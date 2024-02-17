use http_body_util::BodyExt;
use http_body_util::Empty;
use hyper::body::Bytes;
use hyper::Request;
use hyper_util::rt::TokioIo;
use tokio::io::{self, AsyncWriteExt};
use tokio::net::TcpStream;
use url::Url;

pub async fn load_yaml(
    url: &Url,
) -> Result<serde_json::Value, Box<dyn std::error::Error + Send + Sync>> {
    // Get the host and the port
    let host = url.host().unwrap();
    let port = url.port().unwrap_or(80);

    let address = format!("{}:{}", host, port);

    // Open a TCP connection to the remote host
    let stream = TcpStream::connect(address).await?;

    // Use an adapter to access something implementing `tokio::io` traits as if they implement
    // `hyper::rt` IO traits.
    let io = TokioIo::new(stream);

    // Perform a TCP handshake
    let (mut sender, conn) = hyper::client::conn::http1::handshake(io).await?;

    // Spawn a task to poll the connection, driving the HTTP state
    tokio::task::spawn(async move {
        if let Err(err) = conn.await {
            println!("Connection failed: {:?}", err);
        }
    });

    let authority = url.authority();

    // Create an HTTP request with an empty body and a HOST header
    let req = Request::builder()
        .uri(url.as_str())
        .header(hyper::header::HOST, authority)
        .body(Empty::<Bytes>::new())?;

    // Await the response...
    let mut res = sender.send_request(req).await?;

    println!("Response status: {}", res.status());
    println!("{:?}", res.headers());

    while let Some(next) = res.frame().await {
        let frame = next?;
        if let Some(chunk) = frame.data_ref() {
            io::stdout().write_all(chunk).await?;
        }
    }

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
