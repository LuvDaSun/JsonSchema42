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
    let name_ident = format_ident!("T{}", name_parts.join(" ").to_pascal_case());

    if let Some(types) = &item.types {
        if types.len() == 1 {
            let r#type = types.first().unwrap();
            match r#type {
                crate::models::schema::SchemaType::Never => {
                    tokens.append_all(quote! {
                      pub struct #name_ident(());
                    });
                }
                crate::models::schema::SchemaType::Any => {
                    tokens.append_all(quote! {
                      pub struct #name_ident(std::any:Any);
                    });
                }
                crate::models::schema::SchemaType::Null => {
                    tokens.append_all(quote! {
                      pub struct #name_ident(());
                    });
                }
                crate::models::schema::SchemaType::Boolean => {
                    tokens.append_all(quote! {
                      pub struct #name_ident(bool);
                    });
                }
                crate::models::schema::SchemaType::Integer => {
                    tokens.append_all(quote! {
                      pub struct #name_ident(isize);
                    });
                }
                crate::models::schema::SchemaType::Number => {
                    tokens.append_all(quote! {
                      pub struct #name_ident(f64);
                    });
                }
                crate::models::schema::SchemaType::String => {
                    tokens.append_all(quote! {
                      pub struct #name_ident(String);
                    });
                }
                crate::models::schema::SchemaType::Array => {
                    tokens.append_all(quote! {
                      pub struct #name_ident(Vec<()>);
                    });
                }
                crate::models::schema::SchemaType::Object => {
                    tokens.append_all(quote! {
                      pub struct #name_ident(());
                    });
                }
            };
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
          pub enum #name_ident {
            #inner_tokens
          }
        });

        return Ok(tokens);
    }

    tokens.append_all(quote! {
      pub struct #name_ident();
    });

    Ok(tokens)
}
