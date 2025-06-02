use std::{cell::RefCell, rc::Rc};

pub struct DocumentContextHost(Rc<super::DocumentContext>);

impl From<Rc<super::DocumentContext>> for DocumentContextHost {
  fn from(value: Rc<super::DocumentContext>) -> Self {
    Self(value)
  }
}

impl From<DocumentContextHost> for Rc<super::DocumentContext> {
  fn from(value: DocumentContextHost) -> Self {
    value.0
  }
}

impl From<crate::exports::jns42::core::documents::DocumentContext> for Rc<super::DocumentContext> {
  fn from(value: crate::exports::jns42::core::documents::DocumentContext) -> Self {
    todo!()
  }
}

impl crate::exports::jns42::core::documents::Guest for crate::Host {
  type DocumentContext = DocumentContextHost;
}

impl crate::exports::jns42::core::documents::GuestDocumentContext for DocumentContextHost {
  //
}
