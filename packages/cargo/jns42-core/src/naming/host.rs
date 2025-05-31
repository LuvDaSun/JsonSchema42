use std::cell::RefCell;

pub struct NamesHost(super::Names<u32>);

impl From<super::Names<u32>> for NamesHost {
  fn from(value: super::Names<u32>) -> Self {
    Self(value)
  }
}

impl From<NamesHost> for crate::exports::jns42::core::naming::Names {
  fn from(value: NamesHost) -> Self {
    Self::new(value)
  }
}

impl crate::exports::jns42::core::naming::GuestNames for NamesHost {
  //
}

pub struct NamesBuilderHost(RefCell<super::NamesBuilder<u32>>);

impl From<super::NamesBuilder<u32>> for NamesBuilderHost {
  fn from(value: super::NamesBuilder<u32>) -> Self {
    Self(value.into())
  }
}

impl crate::exports::jns42::core::naming::GuestNamesBuilder for NamesBuilderHost {
  fn new() -> Self {
    super::NamesBuilder::new().into()
  }

  fn set_default_name(&self, value: String) {
    self.0.borrow_mut().set_default_name(value);
  }

  fn add(&self, key: u32, values: Vec<String>) {
    self.0.borrow_mut().add(key, values);
  }

  fn build(&self) -> crate::exports::jns42::core::naming::Names {
    NamesHost::from(self.0.borrow().build()).into()
  }
}

pub struct SentenceHost(super::Sentence);

impl From<super::Sentence> for SentenceHost {
  fn from(value: super::Sentence) -> Self {
    Self(value)
  }
}

impl crate::exports::jns42::core::naming::GuestSentence for SentenceHost {
  fn new(input: String) -> Self {
    super::Sentence::new(&input).into()
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

impl crate::exports::jns42::core::naming::Guest for crate::Host {
  type Names = NamesHost;
  type NamesBuilder = NamesBuilderHost;
  type Sentence = SentenceHost;
}
