use hyper::Request;
use std::{iter::empty, net::TcpStream};
use url::Url;

pub async fn load_yaml(url: &Url) -> serde_json::Value {
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

    let authority = url.authority();

    // Create an HTTP request with an empty body and a HOST header
    let req = Request::builder()
        .uri(url.into())
        .header(hyper::header::HOST, authority)
        .body(empty());

    // Await the response...
    let mut res = sender.send_request(req).await?;

    todo!()
}
