use crate::{
    models::{schema::SchemaNode, specification::Specification},
    utils::url::UrlWithPointer,
};
use inflector::Inflector;
use proc_macro2::TokenStream;
use quote::{format_ident, quote, TokenStreamExt};
use std::error::Error;

pub fn generate_file_token_stream(
    specification: &Specification,
) -> Result<TokenStream, Box<dyn Error>> {
    let mut tokens = quote! {};

    for item in specification.arena.iter() {
        if item.id.is_some() {
            tokens.append_all(generate_type_token_stream(specification, item));
        }
    }

    Ok(tokens)
}

fn generate_type_token_stream(
    specification: &Specification,
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

    let id = item.id.as_ref().unwrap();
    let uri = UrlWithPointer::parse(id).unwrap();
    let name_parts = specification.names.get(&uri).unwrap();
    let name = format!("T{}", name_parts.join(" ").to_pascal_case());
    let name_identifier = format_ident!("{}", name);
    let inner_name = format!("super::inner_types::{}", name);
    let inner_name_identifier = quote! { super::inner_types::#name_identifier };

    tokens.append_all(quote! {
      #[derive(Debug, serde :: Serialize, serde :: Deserialize, Clone, PartialEq, Eq)]
      #[serde(try_from = #inner_name)]
      pub struct #name_identifier(#inner_name_identifier);
    });

    tokens.append_all(quote! {
      impl #name_identifier {
          fn new(value: #inner_name_identifier) -> Result<Self, super::errors::ValidationError> {
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
      impl TryFrom<#inner_name_identifier> for #name_identifier {
        type Error = super::errors::ValidationError;
        fn try_from(value: #inner_name_identifier) -> Result<Self, Self::Error> {
            Self::new(value)
        }
      }
    });

    tokens.append_all(quote! {
      impl std::ops::Deref for #name_identifier {
        type Target = #inner_name_identifier;
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
                      impl ToString for #name_identifier {
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
