use futures_util::{FutureExt, Stream};
use std::{
    pin::Pin,
    task::{Context, Poll},
};
use tokio::io::{AsyncRead, AsyncReadExt};

// small buffer! for testing purpose
const BUFFER_SIZE: usize = 16;

pub struct ReadStream<R>
where
    R: AsyncRead,
{
    reader: R,
    at_end: bool,
}

impl<R> ReadStream<R>
where
    R: AsyncRead + Unpin,
{
    pub fn new(reader: R) -> Self {
        Self {
            reader,
            at_end: false,
        }
    }
}

impl<R> Stream for ReadStream<R>
where
    Self: Unpin,
    R: AsyncRead + Unpin,
{
    type Item = std::io::Result<Vec<u8>>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        let self_mut = self.get_mut();

        let reader = &mut self_mut.reader;
        let mut chunk = [0; BUFFER_SIZE];

        // this is where we store data for this poll event
        let mut buffer = Vec::new();

        // loop only of we are not at the end
        while !self_mut.at_end {
            let mut read_future = Box::pin(reader.read(&mut chunk));
            match read_future.poll_unpin(cx) {
                // no data read, we assume that the reader is at it's end
                Poll::Ready(Ok(0)) => {
                    self_mut.at_end = true;
                    break;
                }
                // read some data
                Poll::Ready(Ok(count)) => {
                    buffer.extend_from_slice(&chunk[..count]);
                }
                // something is wrong!
                Poll::Ready(Err(error)) => {
                    return Poll::Ready(Some(Err(error)));
                }
                // nothing to read, come back later!
                Poll::Pending => {
                    if buffer.is_empty() {
                        // if there is nothing in the result buffer then come back later
                        return Poll::Pending;
                    } else {
                        // if there is something in the buffer then exit the loop and let the code that follows emit the buffer
                        break;
                    }
                }
            }
        }

        if self_mut.at_end && buffer.is_empty() {
            // we are done!
            Poll::Ready(None)
        } else {
            // emit whatever we just read
            Poll::Ready(Some(Ok(buffer)))
        }
    }
}
