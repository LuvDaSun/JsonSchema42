use futures_util::stream::StreamExt;
use futures_util::Stream;
use serde::de::DeserializeOwned;
use serde_json::Deserializer;
use std::collections::VecDeque;
use std::pin::Pin;
use std::task::{Context, Poll};

pub struct JsonDeserializer<T, S, I>
where
    T: DeserializeOwned,
    S: Stream<Item = I>,
    I: Into<Vec<u8>>,
{
    inner: S,
    buffer: Vec<u8>,
    queue: VecDeque<T>,
    at_end: bool,
}
impl<T, S, I> JsonDeserializer<T, S, I>
where
    T: DeserializeOwned,
    S: Stream<Item = I>,
    I: Into<Vec<u8>>,
{
    pub fn new(inner: S) -> Self {
        Self {
            inner,
            buffer: Vec::new(),
            queue: VecDeque::new(),
            at_end: false,
        }
    }
}

impl<T, S, I> Stream for JsonDeserializer<T, S, I>
where
    Self: Unpin,
    T: DeserializeOwned,
    S: Stream<Item = I> + Unpin,
    I: Into<Vec<u8>>,
{
    type Item = Result<T, serde_json::Error>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        let self_mut = self.get_mut();

        let inner = &mut self_mut.inner;
        let buffer = &mut self_mut.buffer;
        let queue = &mut self_mut.queue;

        // if the queue would have some items then we don't need to fill it!
        if queue.is_empty() && !self_mut.at_end {
            // if the queue is empty then we need more data! so let's read
            loop {
                let next_future = inner.poll_next_unpin(cx);
                match next_future {
                    Poll::Ready(Some(chunk)) => {
                        // append read data to buffer
                        let mut chunk = chunk.into();
                        buffer.append(&mut chunk);
                    }
                    Poll::Ready(None) => {
                        // done!
                        self_mut.at_end = true;
                        break;
                    }
                    Poll::Pending => {
                        // all is read, for now...
                        break;
                    }
                }
            }

            let deserializer = Deserializer::from_slice(buffer);
            let mut deserializer = deserializer.into_iter();
            for item in deserializer.by_ref() {
                match item {
                    // we found some valid json
                    Ok(item) => {
                        // push it to the queue
                        queue.push_front(item);
                    }
                    Err(error) => match error.classify() {
                        // in this case this means we need more data, not really an error
                        serde_json::error::Category::Eof => {
                            break;
                        }
                        _ => {
                            // Emit error and end stream
                            queue.clear();
                            self_mut.at_end = true;
                            return Poll::Ready(Some(Err(error)));
                        }
                    },
                }
            }

            // cut off bytes in the buffer that are successfully parsed
            let offset = deserializer.byte_offset();
            let _: Vec<_> = buffer.drain(0..offset).collect();
        }

        if let Some(item) = queue.pop_back() {
            // emit whatever is in the queue
            Poll::Ready(Some(Ok(item)))
        } else if self_mut.at_end {
            // if nothing in the queue, and we are at the end
            Poll::Ready(None)
        } else {
            // no items in queue and not at the end, i guess we should come back later
            Poll::Pending
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::utils::read_stream::ReadStream;

    use super::*;
    use serde_json::Value;
    use std::path::PathBuf;
    use tokio::fs::File;

    // #[tokio::test]
    // async fn test_1() -> Result<(), String> {
    //     let https_connector = HttpsConnector::new();

    //     let client = Client::builder();
    //     let client = client.build::<_, Body>(https_connector);

    //     let url = Uri::from_static("https://api.chucknorris.io/jokes/random");
    //     let response = client
    //         .get(url)
    //         .await
    //         .map_err(|err| err.message().to_string())?;

    //     let body = response.into_body();
    //     let mut last_error = None;
    //     let body = body.map(|chunk| match chunk {
    //         Ok(chunk) => chunk,
    //         Err(error) => {
    //             last_error = Some(error);
    //             Default::default()
    //         }
    //     });

    //     let mut deserializer = JsonDeserializer::<Value, _, _>::new(body);

    //     let mut count = 0;

    //     while let Some(item) = deserializer.next().await {
    //         print!("{:?}", item);

    //         count += 1;
    //     }
    //     if let Some(last_error) = last_error {
    //         return Err(last_error.to_string());
    //     }

    //     assert_eq!(count, 1);

    //     Ok(())
    // }

    #[tokio::test]
    async fn test_2() -> Result<(), String> {
        let path = PathBuf::new();
        let path = path.join("..");
        let path = path.join("..");
        let path = path.join("..");
        let path = path.join("fixtures");
        let path = path.join("miscellaneous");
        let path = path.join("people.jsonl");

        let file = File::open(path).await.map_err(|err| err.to_string())?;
        let file = ReadStream::new(file);
        let mut last_error = None;
        let file = file.map(|chunk| match chunk {
            Ok(chunk) => chunk,
            Err(error) => {
                last_error = Some(error);
                Default::default()
            }
        });

        let mut deserializer = JsonDeserializer::<Value, _, _>::new(file);

        let mut count = 0;

        while let Some(item) = deserializer.next().await {
            print!("{:?}", item);

            count += 1;
        }
        if let Some(last_error) = last_error {
            return Err(last_error.to_string());
        }

        assert_eq!(count, 3);

        Ok(())
    }
}
