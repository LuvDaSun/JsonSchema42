use std::str::FromStr;

#[derive(
  Clone, Copy, Hash, PartialEq, Eq, PartialOrd, Ord, Debug, serde::Serialize, serde::Deserialize,
)]
pub enum SchemaType {
  Never,
  Any,
  Null,
  Boolean,
  Integer,
  Number,
  String,
  Array,
  Object,
}

impl SchemaType {
  pub fn intersection(&self, other: &Self) -> Self {
    if self == other {
      return *self;
    }

    if self == &Self::Any {
      return *other;
    }

    if other == &Self::Any {
      return *self;
    }

    if self == &Self::Never {
      return *self;
    }

    if other == &Self::Never {
      return *other;
    }

    SchemaType::Never
  }
}

#[allow(clippy::to_string_trait_impl)]
impl ToString for SchemaType {
  fn to_string(&self) -> String {
    match self {
      Self::Never => "never".to_string(),
      Self::Any => "any".to_string(),
      Self::Null => "null".to_string(),
      Self::Boolean => "boolean".to_string(),
      Self::Integer => "integer".to_string(),
      Self::Number => "number".to_string(),
      Self::String => "string".to_string(),
      Self::Array => "array".to_string(),
      Self::Object => "object".to_string(),
    }
  }
}

impl FromStr for SchemaType {
  type Err = ();

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    match s {
      "never" => Ok(Self::Never),
      "any" => Ok(Self::Any),
      "null" => Ok(Self::Null),
      "boolean" => Ok(Self::Boolean),
      "integer" => Ok(Self::Integer),
      "number" => Ok(Self::Number),
      "string" => Ok(Self::String),
      "array" => Ok(Self::Array),
      "object" => Ok(Self::Object),
      _ => Err(()),
    }
  }
}
