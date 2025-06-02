use super::*;
use crate::{Host, exports};
use std::cell;

impl exports::jns42::core::naming::Guest for Host {
  type Names = NamesHost;
  type NamesBuilder = NamesBuilderHost;
  type Sentence = SentenceHost;
}

pub struct NamesHost(Names<u32>);

impl From<Names<u32>> for NamesHost {
  fn from(value: Names<u32>) -> Self {
    Self(value)
  }
}

impl From<NamesHost> for exports::jns42::core::naming::Names {
  fn from(value: NamesHost) -> Self {
    Self::new(value)
  }
}

impl From<Names<u32>> for exports::jns42::core::naming::Names {
  fn from(value: Names<u32>) -> Self {
    NamesHost::from(value).into()
  }
}

impl exports::jns42::core::naming::GuestNames for NamesHost {
  fn get_name(&self, key: u32) -> Option<exports::jns42::core::naming::Sentence> {
    self.0.get_name(&key).cloned().map(Into::into)
  }
}

pub struct NamesBuilderHost(cell::RefCell<NamesBuilder<u32>>);

impl From<NamesBuilder<u32>> for NamesBuilderHost {
  fn from(value: NamesBuilder<u32>) -> Self {
    Self(value.into())
  }
}

impl exports::jns42::core::naming::GuestNamesBuilder for NamesBuilderHost {
  fn new() -> Self {
    NamesBuilder::new().into()
  }

  fn set_default_name(&self, value: String) {
    self.0.borrow_mut().set_default_name(value);
  }

  fn add(&self, key: u32, values: Vec<String>) {
    self.0.borrow_mut().add(key, values);
  }

  fn build(&self) -> exports::jns42::core::naming::Names {
    self.0.borrow().build().into()
  }
}

pub struct SentenceHost(Sentence);

impl From<Sentence> for SentenceHost {
  fn from(value: Sentence) -> Self {
    Self(value)
  }
}

impl From<SentenceHost> for exports::jns42::core::naming::Sentence {
  fn from(value: SentenceHost) -> Self {
    Self::new(value)
  }
}

impl From<Sentence> for exports::jns42::core::naming::Sentence {
  fn from(value: Sentence) -> Self {
    SentenceHost::from(value).into()
  }
}

impl exports::jns42::core::naming::GuestSentence for SentenceHost {
  fn new(input: String) -> Self {
    Sentence::new(&input).into()
  }

  fn to_pascal_case(&self) -> String {
    self.0.to_pascal_case()
  }

  fn to_camel_case(&self) -> String {
    self.0.to_camel_case()
  }

  fn to_snake_case(&self) -> String {
    self.0.to_snake_case()
  }

  fn to_screaming_snake_case(&self) -> String {
    self.0.to_screaming_snake_case()
  }
}
