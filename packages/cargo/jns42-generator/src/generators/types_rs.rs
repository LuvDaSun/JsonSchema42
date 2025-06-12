use crate::models::Specification;
use jns42_core::models::{ArenaSchemaItem, SchemaType};
use proc_macro2::TokenStream;
use quote::{TokenStreamExt, quote};
use regex::Regex;
use std::error::Error;

pub fn generate_file_token_stream(
  specification: &Specification,
) -> Result<TokenStream, Box<dyn Error>> {
  let mut tokens = quote! {};

  for (key, item) in specification.arena.iter().enumerate() {
    tokens.append_all(generate_type_token_stream(specification, &key, item));
  }

  Ok(tokens)
}

fn generate_type_token_stream(
  specification: &Specification,
  key: &usize,
  item: &ArenaSchemaItem,
) -> Result<TokenStream, Box<dyn Error>> {
  let mut tokens = quote! {};

  let types = item.types.clone().unwrap_or_default();
  assert!(types.len() <= 1);
  let r#type = types.first();

  let documentation: Vec<_> = [
    item.title.clone(),
    item.description.clone(),
    item.location.as_ref().map(|id| id.to_string()),
  ]
  .into_iter()
  .flatten()
  .collect();

  let documentation = documentation.join("\n\n");
  if !documentation.is_empty() {
    tokens.append_all(quote! {
      #[doc = #documentation]
    });
  }

  let Some(identifier) = specification.get_identifier(key) else {
    return Ok(quote! {});
  };

  if let Some(reference) = &item.reference {
    let reference_identifier = specification.get_identifier(reference);
    tokens.append_all(quote! {
      pub type #identifier = #reference_identifier;
    });
  } else {
    let name = specification.get_name(key);
    let interior_name = specification.get_interior_name(key);
    let interior_identifier = specification.get_interior_identifier(key);
    let boxed = item
      .types
      .iter()
      .flatten()
      .any(|r#type| *r#type == SchemaType::Object)
      || item.one_of.is_some();
    let to_string = item.types.iter().flatten().any(|r#type| {
      matches!(
        *r#type,
        SchemaType::Boolean | SchemaType::Integer | SchemaType::Number | SchemaType::String
      )
    });

    {
      let mut tokens_validation = quote! {};

      match r#type {
        Some(&SchemaType::Never) => {
          tokens_validation.append_all(quote! {
            core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
          });
        }
        Some(&SchemaType::Any) => {}
        Some(&SchemaType::Null) => {}
        Some(&SchemaType::Boolean) => {
          tokens_validation.append_all(quote! {
            core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
          });
        }
        Some(&SchemaType::Integer) => {
          if let Some(validation_value) = &item.maximum_exclusive {
            let validation_value = validation_value
              .as_i64()
              .ok_or(crate::errors::Error::ExpectedSome)?;
            tokens_validation.append_all(quote! {
              if value >= #validation_value {
                core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
              }
            });
          }
          if let Some(validation_value) = &item.maximum_inclusive {
            let validation_value = validation_value
              .as_i64()
              .ok_or(crate::errors::Error::ExpectedSome)?;
            tokens_validation.append_all(quote! {
              if value > #validation_value {
                core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
              }
            });
          }
          if let Some(validation_value) = &item.minimum_exclusive {
            let validation_value = validation_value
              .as_i64()
              .ok_or(crate::errors::Error::ExpectedSome)?;
            tokens_validation.append_all(quote! {
              if value <= #validation_value {
                core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
              }
            });
          }
          if let Some(validation_value) = &item.minimum_inclusive {
            let validation_value = validation_value
              .as_i64()
              .ok_or(crate::errors::Error::ExpectedSome)?;
            tokens_validation.append_all(quote! {
              if value < #validation_value {
                core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
              }
            });
          }
          if let Some(validation_value) = &item.multiple_of {
            let validation_value = validation_value
              .as_i64()
              .ok_or(crate::errors::Error::ExpectedSome)?;
            tokens_validation.append_all(quote! {
              if value % #validation_value != 0 {
                core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
              }
            });
          }
        }
        Some(&SchemaType::Number) => {
          if let Some(validation_value) = &item.maximum_exclusive {
            let validation_value = validation_value
              .as_f64()
              .ok_or(crate::errors::Error::ExpectedSome)?;
            tokens_validation.append_all(quote! {
              if value >= #validation_value {
                core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
              }
            });
          }
          if let Some(validation_value) = &item.maximum_inclusive {
            let validation_value = validation_value
              .as_f64()
              .ok_or(crate::errors::Error::ExpectedSome)?;
            tokens_validation.append_all(quote! {
              if value > #validation_value {
                core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
              }
            });
          }
          if let Some(validation_value) = &item.minimum_exclusive {
            let validation_value = validation_value
              .as_f64()
              .ok_or(crate::errors::Error::ExpectedSome)?;
            tokens_validation.append_all(quote! {
              if value <= #validation_value {
                core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
              }
            });
          }
          if let Some(validation_value) = &item.minimum_inclusive {
            let validation_value = validation_value
              .as_f64()
              .ok_or(crate::errors::Error::ExpectedSome)?;
            tokens_validation.append_all(quote! {
              if value < #validation_value {
                core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
              }
            });
          }
          if let Some(validation_value) = &item.multiple_of {
            let validation_value = validation_value
              .as_f64()
              .ok_or(crate::errors::Error::ExpectedSome)?;
            tokens_validation.append_all(quote! {
              if value % #validation_value != 0 {
                core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
              }
            });
          }
        }
        Some(&SchemaType::String) => {
          if let Some(validation_value) = &item.minimum_length {
            let validation_value: usize = (*validation_value).try_into().unwrap();
            tokens_validation.append_all(quote! {
              if value.len() < #validation_value {
                core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
              }
            });
          }
          if let Some(validation_value) = &item.maximum_length {
            let validation_value: usize = (*validation_value).try_into().unwrap();
            tokens_validation.append_all(quote! {
              if value.len() > #validation_value {
                core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
              }
            });
          }
          if let Some(validation_value) = &item.value_pattern {
            tokens_validation.append_all(quote! {
              todo!();
            });
          }
          if let Some(validation_value) = &item.value_format {
            tokens_validation.append_all(quote! {
              todo!();
            });
          }
        }
        Some(&SchemaType::Array) => {
          tokens_validation.append_all(quote! {
            core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
          });
        }
        Some(&SchemaType::Object) => {
          tokens_validation.append_all(quote! {
            core::result::Result::Err(jns42_lib::errors::ValidationError::new(#name))?;
          });
        }
        None => {}
      };

      if boxed {
        tokens.append_all(quote! {
          #[derive(core::fmt::Debug, serde::Serialize, serde::Deserialize, core::clone::Clone)]
          #[serde(try_from = #interior_name)]
          pub struct #identifier(pub(super) Box<#interior_identifier>);
        });

        tokens.append_all(quote! {
          impl #identifier {
            fn new(value: #interior_identifier) -> core::result::Result<Self, jns42_lib::errors::ValidationError> {
              #tokens_validation

              let instance = Self(Box::new(value));
              core::result::Result::Ok(instance)
            }
          }
        });
      } else {
        tokens.append_all(quote! {
          #[derive(core::fmt::Debug, serde::Serialize, serde::Deserialize, core::clone::Clone)]
          #[serde(try_from = #interior_name)]
          pub struct #identifier(pub(super) #interior_identifier);
        });

        tokens.append_all(quote! {
          impl #identifier {
            fn new(value: #interior_identifier) -> core::result::Result<Self, jns42_lib::errors::ValidationError> {
              #tokens_validation

              let instance = Self(value);
              core::result::Result::Ok(instance)
            }
          }
        });
      }
    }

    tokens.append_all(quote! {
      impl core::convert::TryFrom<#interior_identifier> for #identifier {
        type Error = jns42_lib::errors::ValidationError;
        fn try_from(value: #interior_identifier) -> core::result::Result<Self, Self::Error> {
            Self::new(value)
        }
      }
    });

    tokens.append_all(quote! {
      impl std::ops::Deref for #identifier {
        type Target = #interior_identifier;
        fn deref(&self) -> &Self::Target {
            &self.0
        }
      }
    });

    if to_string {
      tokens.append_all(quote! {
        impl std::fmt::Display for #identifier {
          fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            write!(f, "{}", self.0)
          }
        }
      });
    }
  }

  Ok(tokens)
}
