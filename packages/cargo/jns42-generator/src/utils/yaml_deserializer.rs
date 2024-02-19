use futures_util::stream::StreamExt;
use futures_util::Stream;
use serde::de::DeserializeOwned;
use serde_yaml::Deserializer;
use std::collections::VecDeque;
use std::error::Error;
use std::ops::Index;
use std::pin::Pin;
use std::task::{Context, Poll};

const DOCUMENT_DELIMITER: [u8; 3] = [45, 45, 45]; // ---

pub struct YamlDeserializer<T, S, I, E>
where
    T: DeserializeOwned,
    S: Stream<Item = Result<I, E>>,
    I: Into<Vec<u8>>,
    E: Error,
{
    inner: S,
    buffer: Vec<u8>,
    queue: VecDeque<T>,
    delimiter_search_offset: usize,
    at_end: bool,
}

impl<T, S, I, E> YamlDeserializer<T, S, I, E>
where
    T: DeserializeOwned,
    S: Stream<Item = Result<I, E>>,
    I: Into<Vec<u8>>,
    E: Error,
{
    pub fn new(inner: S) -> Self {
        Self {
            inner,
            buffer: Vec::new(),
            queue: VecDeque::new(),
            delimiter_search_offset: 0,
            at_end: false,
        }
    }
}

impl<T, S, I, E> Stream for YamlDeserializer<T, S, I, E>
where
    Self: Unpin,
    T: DeserializeOwned,
    S: Stream<Item = Result<I, E>> + Unpin,
    I: Into<Vec<u8>>,
    E: Error + 'static,
{
    type Item = Result<T, Box<dyn Error>>;

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
                    Poll::Ready(Some(Ok(chunk))) => {
                        // append read data to buffer
                        let mut chunk = chunk.into();
                        buffer.append(&mut chunk);
                    }
                    Poll::Ready(Some(Err(error))) => {
                        // Emit error and end stream
                        queue.clear();
                        self_mut.at_end = true;
                        return Poll::Ready(Some(Err(Box::new(error))));
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

            // figure out if we have a document in our buffer
            let has_document;

            if self_mut.at_end {
                // if we are at the end then we have a document, empty documents are
                // automagically handled by the serializer
                self_mut.delimiter_search_offset = buffer.len();
                has_document = self_mut.delimiter_search_offset > 0;
            } else if let Some(position) = buffer
                .as_slice()
                .windows(DOCUMENT_DELIMITER.len())
                .position(|window| window == DOCUMENT_DELIMITER)
            {
                // hurray! we found a document (well maybe)
                self_mut.delimiter_search_offset = position + DOCUMENT_DELIMITER.len();
                has_document = self_mut.delimiter_search_offset > 0;
            } else {
                has_document = false;
                self_mut.delimiter_search_offset =
                    buffer.len().saturating_sub(DOCUMENT_DELIMITER.len());
            }

            if has_document {
                // we have a document \o/
                let document_buffer: Vec<_> =
                    buffer.drain(..self_mut.delimiter_search_offset).collect();
                self_mut.delimiter_search_offset = 0;

                let deserializer = Deserializer::from_slice(&document_buffer);
                let item = T::deserialize(deserializer);

                match item {
                    Ok(item) => {
                        // push it to the queue
                        queue.push_front(item);
                    }
                    Err(error) => {
                        // Emit error and end stream
                        queue.clear();
                        self_mut.at_end = true;
                        return Poll::Ready(Some(Err(Box::new(error))));
                    }
                }
            }
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
    use std::path::PathBuf;
    use tokio::fs::File;
    use url::Url;

    #[tokio::test]
    async fn test_1() -> Result<(), Box<dyn std::error::Error>> {
        let url = Url::parse("https://api.chucknorris.io/jokes/random").unwrap();
        let response = reqwest::get(url).await?.error_for_status()?;

        let body = response.bytes_stream();

        let mut deserializer = YamlDeserializer::<serde_json::Value, _, _, _>::new(body);

        let mut count = 0;

        while let Some(item) = deserializer.next().await {
            item?;

            count += 1;
        }

        assert_eq!(count, 1);

        Ok(())
    }

    #[tokio::test]
    async fn test_2() -> Result<(), Box<dyn std::error::Error>> {
        let path = PathBuf::new();
        let path = path.join("..");
        let path = path.join("..");
        let path = path.join("..");
        let path = path.join("fixtures");
        let path = path.join("miscellaneous");
        let path = path.join("people.yaml");

        let file = File::open(path).await?;
        let file = ReadStream::new(file);

        let mut deserializer = YamlDeserializer::<serde_json::Value, _, _, _>::new(file);

        let mut count = 0;

        while let Some(item) = deserializer.next().await {
            item?;

            count += 1;
        }

        assert_eq!(count, 3);

        Ok(())
    }
}
