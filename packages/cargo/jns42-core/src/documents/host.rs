use std::rc::Rc;

pub struct DocumentContextHost(Rc<super::DocumentContext>);

impl From<super::DocumentContext> for DocumentContextHost {
  fn from(value: super::DocumentContext) -> Self {
    Self(value.into())
  }
}

impl From<DocumentContextHost> for crate::exports::jns42::core::documents::DocumentContext {
  fn from(value: DocumentContextHost) -> Self {
    Self::new(value)
  }
}

impl From<super::DocumentContext> for crate::exports::jns42::core::documents::DocumentContext {
  fn from(value: super::DocumentContext) -> Self {
    DocumentContextHost::from(value).into()
  }
}

impl From<crate::exports::jns42::core::documents::DocumentContext> for DocumentContextHost {
  fn from(value: crate::exports::jns42::core::documents::DocumentContext) -> Self {
    value.into_inner()
  }
}

impl From<crate::exports::jns42::core::documents::DocumentContext> for Rc<super::DocumentContext> {
  fn from(value: crate::exports::jns42::core::documents::DocumentContext) -> Self {
    DocumentContextHost::from(value).0
  }
}

impl crate::exports::jns42::core::documents::GuestDocumentContext for DocumentContextHost {
  //
}

impl crate::exports::jns42::core::documents::Guest for crate::Host {
  type DocumentContext = DocumentContextHost;
}
