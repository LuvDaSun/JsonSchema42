pub trait Selectors {
  fn select_schema(&self) -> Option<&str>;
  fn select_id(&self) -> Option<&str>;
}
