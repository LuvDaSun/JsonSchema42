use futures_util::stream::StreamExt;
use futures_util::Stream;
use serde::de::DeserializeOwned;
use serde_yaml::Deserializer;
use std::collections::VecDeque;
use std::error::Error;
use std::pin::Pin;
use std::task::{Context, Poll};

const DOCUMENT_DELIMITER: [u8; 3] = [45, 45, 45]; // ---
const NEWLINE_DELIMITER: u8 = 10; // \n
const NEWLINE_DELIMITER_PREFIX: u8 = 13; // \r

pub struct YamlDeserializer<T, S, I>
where
  T: DeserializeOwned,
  S: Stream<Item = Result<I, Box<dyn Error>>>,
  I: Into<Vec<u8>>,
{
  // source stream
  inner: S,
  // buffer with read data
  buffer: Vec<u8>,
  // queue of deserialized items to emit
  queue: VecDeque<T>,
  // this is where the next document starts
  document_offset: usize,
  // buffer is processed until here
  buffer_offset: usize,
  // source stream is at it end
  at_end: bool,
}

impl<T, S, I> YamlDeserializer<T, S, I>
where
  T: DeserializeOwned,
  S: Stream<Item = Result<I, Box<dyn Error>>>,
  I: Into<Vec<u8>>,
{
  #[allow(dead_code)]
  pub fn new(inner: S) -> Self {
    Self {
      inner,
      buffer: Vec::new(),
      queue: VecDeque::new(),
      document_offset: 0,
      buffer_offset: 0,
      at_end: false,
    }
  }
}

impl<T, S, I> Stream for YamlDeserializer<T, S, I>
where
  Self: Unpin,
  T: DeserializeOwned,
  S: Stream<Item = Result<I, Box<dyn Error>>> + Unpin,
  I: Into<Vec<u8>>,
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
            return Poll::Ready(Some(Err(error)));
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

      // figure out the length of a found document (0 means no document)
      let mut document_length = 0;

      // split lines
      let lines = buffer[self_mut.buffer_offset..].split(|value| *value == NEWLINE_DELIMITER); // split by \n

      // lets find the document delimiter line

      let mut next_buffer_offset = self_mut.buffer_offset;
      for line in lines {
        // the buffer_offset state is always one line behind
        self_mut.buffer_offset = next_buffer_offset;

        let mut line = line;
        if let Some(last) = line.last() {
          if *last == NEWLINE_DELIMITER_PREFIX {
            line = &line[..line.len() - 1];
            next_buffer_offset += line.len() + 2;
          } else {
            next_buffer_offset += line.len() + 1;
          }
        } else {
          // line is empty, we only advance the newline character
          next_buffer_offset += 1;
        }

        if line == DOCUMENT_DELIMITER {
          // hurray we found a document
          document_length = self_mut.buffer_offset - self_mut.document_offset;
          self_mut.buffer_offset = next_buffer_offset;
          break;
        }
      }

      if document_length == 0 && self_mut.at_end {
        // not found a document, but we are at the end!
        self_mut.buffer_offset = buffer.len();
        document_length = buffer.len() - self_mut.document_offset;
      }

      if document_length > 0 {
        // we have a document \o/
        let document_buffer: Vec<_> = buffer
          .drain(0..(self_mut.document_offset + document_length))
          .skip(self_mut.document_offset)
          .collect();
        self_mut.buffer_offset = 0;
        self_mut.document_offset = 0;

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
  use super::*;
  use crate::utils::read_stream::ReadStream;
  use futures_util::TryStreamExt;
  use std::path::PathBuf;
  use tokio::fs::File;
  use url::Url;

  #[tokio::test]
  async fn test_1() -> Result<(), Box<dyn std::error::Error>> {
    let url = Url::parse("https://api.chucknorris.io/jokes/random").unwrap();
    let response = reqwest::get(url).await?.error_for_status()?;

    let body = response
      .bytes_stream()
      .map_err(|error| Box::new(error) as Box<dyn Error>);

    let mut deserializer = YamlDeserializer::<serde_json::Value, _, _>::new(body);

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
    let file = ReadStream::new(file).map_err(|error| Box::new(error) as Box<dyn Error>);

    let mut deserializer = YamlDeserializer::<serde_json::Value, _, _>::new(file);

    let mut count = 0;

    while let Some(item) = deserializer.next().await {
      item?;

      count += 1;
    }

    assert_eq!(count, 3);

    Ok(())
  }
}
