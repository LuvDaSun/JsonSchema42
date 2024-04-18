#[derive(
  Clone, Copy, Hash, PartialEq, Eq, PartialOrd, Ord, Debug, serde::Serialize, serde::Deserialize,
)]
#[serde(rename_all = "camelCase")]
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

impl SchemaType {
  pub fn parse(input: &str) -> Self {
    match input {
      "never" => Self::Never,
      "any" => Self::Any,
      "null" => Self::Null,
      "boolean" => Self::Boolean,
      "integer" => Self::Integer,
      "number" => Self::Number,
      "string" => Self::String,
      "array" => Self::Array,
      "object" => Self::Object,
      _ => {
        unreachable!();
      }
    }
  }
}
