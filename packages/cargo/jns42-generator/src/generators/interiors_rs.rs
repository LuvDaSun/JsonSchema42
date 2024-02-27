use crate::{
    models::{schema::SchemaNode, specification::Specification},
    utils::url::UrlWithPointer,
};
use inflector::Inflector;
use proc_macro2::TokenStream;
use quote::{format_ident, quote, TokenStreamExt};
use std::{collections::HashSet, error::Error};

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
    let _type_name = format!("super::types::{}", name);
    let type_name_identifier = quote! { super::types::#name_identifier };

    if let Some(types) = &item.types {
        if types.len() == 1 {
            let r#type = types.first().unwrap();
            match r#type {
                crate::models::schema::SchemaType::Never => {
                    tokens.append_all(quote! {
                      pub type #name_identifier = ();
                    });
                }
                crate::models::schema::SchemaType::Any => {
                    tokens.append_all(quote! {
                      pub type #name_identifier = std::any:Any;
                    });
                }
                crate::models::schema::SchemaType::Null => {
                    tokens.append_all(quote! {
                      pub type #name_identifier = ();
                    });
                }
                crate::models::schema::SchemaType::Boolean => {
                    tokens.append_all(quote! {
                      pub type #name_identifier = bool;
                    });
                }
                crate::models::schema::SchemaType::Integer => {
                    tokens.append_all(quote! {
                      pub type #name_identifier = i64;
                    });
                }
                crate::models::schema::SchemaType::Number => {
                    tokens.append_all(quote! {
                      pub type #name_identifier = f64;
                    });
                }
                crate::models::schema::SchemaType::String => {
                    tokens.append_all(quote! {
                      pub type #name_identifier = String;
                    });
                }
                crate::models::schema::SchemaType::Array => {
                    if let Some(tuple_items_keys) = &item.tuple_items {
                        let inner_tokens = tuple_items_keys
                            .iter()
                            .map(|tuple_items_key| {
                                let tuple_items_item =
                                    specification.arena.get_item(*tuple_items_key);
                                let tuple_items_id = tuple_items_item.id.as_ref().unwrap();
                                let tuple_items_uri =
                                    UrlWithPointer::parse(tuple_items_id).unwrap();

                                let tuple_items_name_parts =
                                    specification.names.get(&tuple_items_uri).unwrap();
                                let tuple_items_name = format!(
                                    "T{}",
                                    tuple_items_name_parts.join(" ").to_pascal_case()
                                );
                                let tuple_items_name_identifier =
                                    format_ident!("{}", tuple_items_name);
                                let tuple_items_type_name_identifier =
                                    quote! { super::types::#tuple_items_name_identifier };

                                quote! { #tuple_items_type_name_identifier }
                            })
                            .reduce(|a, b| quote!(#a, #b))
                            .unwrap_or_default();

                        tokens.append_all(quote! {
                          pub type #name_identifier = (
                            #inner_tokens
                          );
                        });
                    } else if let Some(array_items_key) = &item.array_items {
                        let array_items_item = specification.arena.get_item(*array_items_key);
                        let array_items_id = array_items_item.id.as_ref().unwrap();
                        let array_items_uri = UrlWithPointer::parse(array_items_id).unwrap();

                        let array_items_name_parts =
                            specification.names.get(&array_items_uri).unwrap();
                        let array_items_name =
                            format!("T{}", array_items_name_parts.join(" ").to_pascal_case());
                        let array_items_name_identifier = format_ident!("{}", array_items_name);
                        let array_items_type_name_identifier =
                            quote! { super::types::#array_items_name_identifier };

                        tokens.append_all(quote! {
                          pub type #name_identifier = Vec<#array_items_type_name_identifier>;
                        });
                    } else {
                        tokens.append_all(quote! {
                          pub type #name_identifier = Vec<()>;
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
                            .map(|(object_properties_property, object_properties_key)| {
                                let object_properties_item =
                                    specification.arena.get_item(*object_properties_key);
                                let object_properties_id =
                                    object_properties_item.id.as_ref().unwrap();
                                let object_properties_uri =
                                    UrlWithPointer::parse(object_properties_id).unwrap();

                                let object_properties_name_parts =
                                    specification.names.get(&object_properties_uri).unwrap();
                                let object_properties_name = format!(
                                    "T{}",
                                    object_properties_name_parts.join(" ").to_pascal_case()
                                );
                                let object_properties_name_identifier =                                    format_ident!("{}", object_properties_name);
                                let _object_properties_type_name =
                                    format!("super::types::{}", object_properties_name);
                                let _object_properties_type_name_identifier =
                                  quote! { super::types::#object_properties_name_identifier };

                                let object_properties_property_identifier = format_ident!("{}", object_properties_property);

                                if required.contains(object_properties_property){
                                  quote! { #object_properties_property_identifier: #object_properties_name_identifier }
                                }
                                else {
                                  quote! { #object_properties_property_identifier: Option<#object_properties_name_identifier> }
                                }
                            })
                            .reduce(|a, b| quote!(#a, #b))
                            .unwrap_or_default();

                        tokens.append_all(quote! {
                            #[derive(Debug, serde::Serialize, serde::Deserialize, Clone, PartialEq, Eq)]
                            pub struct #name_identifier {
                              #inner_tokens
                            }
                          });
                    } else if let Some(map_properties_key) = &item.map_properties {
                        let map_properties_item = specification.arena.get_item(*map_properties_key);
                        let map_properties_id = map_properties_item.id.as_ref().unwrap();
                        let map_properties_uri = UrlWithPointer::parse(map_properties_id).unwrap();

                        let map_properties_name_parts =
                            specification.names.get(&map_properties_uri).unwrap();
                        let map_properties_name =
                            format!("T{}", map_properties_name_parts.join(" ").to_pascal_case());
                        let map_properties_name_identifier =
                            format_ident!("{}", map_properties_name);
                        let _map_properties_type_name =
                            format!("super::types::{}", map_properties_name);
                        let map_properties_type_name_identifier =
                            quote! { super::types::#map_properties_name_identifier };

                        tokens.append_all(quote! {
                          pub type #name_identifier = HashMap<String, #map_properties_type_name_identifier>;
                        });
                    } else {
                        tokens.append_all(quote! {
                          #[derive(Debug, serde::Serialize, serde::Deserialize, Clone, PartialEq, Eq)]
                          pub type #name_identifier = std::collections::HashMap<String, ()>;
                        });
                    }
                }
            };

            tokens.append_all(quote! {
              impl From<#type_name_identifier> for #name_identifier {
                fn from(value: #type_name_identifier) -> Self {
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
            let sub_name_ident = format_ident!("T{}", sub_name_parts.join(" ").to_pascal_case());
            inner_tokens.append_all(quote! {
                #sub_name_ident(#sub_name_ident),
            });
        }

        tokens.append_all(quote! {
          pub enum #name_identifier {
            #inner_tokens
          }
        });

        return Ok(tokens);
    }

    tokens.append_all(quote! {
      pub struct #name_identifier();
    });

    Ok(tokens)
}
