use super::Node;
use crate::documents::Selectors;

impl Selectors for Node {
  fn select_schema(&self) -> Option<&str> {
    self.as_object()?.get("$schema")?.as_str()
  }

  fn select_id(&self) -> Option<&str> {
    self.as_object()?.get("$id")?.as_str()
  }
}
