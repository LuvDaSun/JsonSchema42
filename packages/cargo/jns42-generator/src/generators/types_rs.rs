use crate::models::{schema::SchemaNode, specification::Specification};
use proc_macro2::TokenStream;
use quote::{quote, TokenStreamExt};
use std::error::Error;

pub fn generate_file_token_stream(
    specification: &Specification,
) -> Result<TokenStream, Box<dyn Error>> {
    let mut tokens = quote! {};

    for (key, item) in specification.arena.iter().enumerate() {
        if item.id.is_some() {
            tokens.append_all(generate_type_token_stream(specification, &key, item));
        }
    }

    Ok(tokens)
}

fn generate_type_token_stream(
    specification: &Specification,
    key: &usize,
    item: &SchemaNode,
) -> Result<TokenStream, Box<dyn Error>> {
    let mut tokens = quote! {};

    let documentation: Vec<_> = [&item.title, &item.description, &item.id]
        .into_iter()
        .flatten()
        .cloned()
        .collect();
    let documentation = documentation.join("\n\n");

    tokens.append_all(quote! {
      #[doc = #documentation]
    });

    let identifier = specification.get_identifier(key);
    let name = specification.get_name(key);
    let interior_name = specification.get_interior_name(key);
    let interior_identifier = specification.get_interior_identifier(key);

    tokens.append_all(quote! {
      #[derive(Debug, serde::Serialize, serde::Deserialize, Clone, PartialEq, Eq)]
      #[serde(try_from = #interior_name)]
      pub struct #identifier(#interior_identifier);
    });

    tokens.append_all(quote! {
      impl #identifier {
          fn new(value: #interior_identifier) -> Result<Self, super::errors::ValidationError> {
              let instance = Self(value);
              if instance.validate() {
                  Ok(instance)
              } else {
                  Err(ValidationError::new(#name))
              }
          }
          fn validate(&self) -> bool {
            true
          }
      }
    });

    tokens.append_all(quote! {
      impl TryFrom<#interior_identifier> for #identifier {
        type Error = super::errors::ValidationError;
        fn try_from(value: #interior_identifier) -> Result<Self, Self::Error> {
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

    if let Some(types) = &item.types {
        if types.len() == 1 {
            let r#type = types.first().unwrap();
            match r#type {
                crate::models::schema::SchemaType::Boolean
                | crate::models::schema::SchemaType::Integer
                | crate::models::schema::SchemaType::Number
                | crate::models::schema::SchemaType::String => {
                    tokens.append_all(quote! {
                      impl ToString for #identifier {
                          fn to_string(&self) -> String {
                              self.0.to_string()
                          }
                      }
                    });
                }
                _ => {}
            };
        }
    }

    Ok(tokens)
}
