use crate::{
  models::{schema::SchemaNode, specification::Specification},
  utils::{name::to_pascal, url::UrlWithPointer},
};
use proc_macro2::TokenStream;
use quote::{format_ident, quote, TokenStreamExt};
use std::{collections::HashSet, error::Error};

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
  let type_identifier = specification.get_type_identifier(key);

  if let Some(types) = &item.types {
    if types.len() == 1 {
      let r#type = types.first().unwrap();
      match r#type {
        crate::models::schema::SchemaType::Never => {
          tokens.append_all(quote! {
            pub type #identifier = ();
          });
        }
        crate::models::schema::SchemaType::Any => {
          tokens.append_all(quote! {
            pub type #identifier = std::any:Any;
          });
        }
        crate::models::schema::SchemaType::Null => {
          tokens.append_all(quote! {
            pub type #identifier = ();
          });
        }
        crate::models::schema::SchemaType::Boolean => {
          tokens.append_all(quote! {
            pub type #identifier = bool;
          });
        }
        crate::models::schema::SchemaType::Integer => {
          tokens.append_all(quote! {
            pub type #identifier = i64;
          });
        }
        crate::models::schema::SchemaType::Number => {
          tokens.append_all(quote! {
            pub type #identifier = f64;
          });
        }
        crate::models::schema::SchemaType::String => {
          tokens.append_all(quote! {
            pub type #identifier = String;
          });
        }
        crate::models::schema::SchemaType::Array => {
          if let Some(tuple_items_keys) = &item.tuple_items {
            let inner_tokens = tuple_items_keys
              .iter()
              .map(|tuple_items_key| {
                let tuple_items_identifier = specification.get_type_identifier(tuple_items_key);

                quote! { #tuple_items_identifier }
              })
              .reduce(|a, b| quote!(#a, #b))
              .unwrap_or_default();

            tokens.append_all(quote! {
              pub type #identifier = (
                #inner_tokens
              );
            });
          } else if let Some(array_items_key) = &item.array_items {
            let array_items_identifier = specification.get_type_identifier(array_items_key);

            tokens.append_all(quote! {
              pub type #identifier = Vec<#array_items_identifier>;
            });
          } else {
            tokens.append_all(quote! {
              pub type #identifier = Vec<()>;
            });
          }
        }
        crate::models::schema::SchemaType::Object => {
          if let Some(object_properties_entries) = &item.object_properties {
            let required: HashSet<_> = item
              .required
              .as_ref()
              .map(|value| value.iter().collect())
              .unwrap_or_default();
            let inner_tokens = object_properties_entries
              .iter()
              .map(|(member_name, object_properties_key)| {
                let member_identifier = format_ident!("{}", to_pascal([member_name]));
                let object_properties_identifier =
                  specification.get_type_identifier(object_properties_key);

                if required.contains(member_name) {
                  quote! {
                    #member_identifier: #object_properties_identifier
                  }
                } else {
                  quote! {
                    #member_identifier: Option<#object_properties_identifier>
                  }
                }
              })
              .reduce(|a, b| quote!(#a, #b))
              .unwrap_or_default();

            tokens.append_all(quote! {
              #[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
              pub struct #identifier {
                #inner_tokens
              }
            });
          } else if let Some(map_properties_key) = &item.map_properties {
            let map_properties_identifier = specification.get_type_identifier(map_properties_key);

            tokens.append_all(quote! {
              pub type #identifier = HashMap<String, #map_properties_identifier>;
            });
          } else {
            tokens.append_all(quote! {
              pub type #identifier = std::collections::HashMap<String, ()>;
            });
          }
        }
      };

      tokens.append_all(quote! {
        impl From<#type_identifier> for #identifier {
          fn from(value: #type_identifier) -> Self {
              value.0
          }
        }
      });

      return Ok(tokens);
    }
  }

  if let Some(one_of) = &item.one_of {
    let mut inner_tokens = quote!();
    for sub_key in one_of {
      let sub_item = specification.arena.get_item(*sub_key);
      let sub_name_parts = specification
        .names
        .get(&UrlWithPointer::parse(sub_item.id.as_ref().unwrap().as_str()).unwrap())
        .unwrap();
      let sub_name_ident = format_ident!("T{}", to_pascal(sub_name_parts));
      inner_tokens.append_all(quote! {
          #sub_name_ident(#sub_name_ident),
      });
    }

    tokens.append_all(quote! {
      pub enum #identifier {
        #inner_tokens
      }
    });

    return Ok(tokens);
  }

  tokens.append_all(quote! {
    #[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
    pub struct #identifier();
  });

  Ok(tokens)
}
