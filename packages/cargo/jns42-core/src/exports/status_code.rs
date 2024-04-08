#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq, Ord, PartialOrd)]
#[repr(transparent)]
pub struct StatusCode(usize);

impl StatusCode {
  pub const OK: Self = Self(0);
  pub const UNKNOWN: Self = Self(100);
}
