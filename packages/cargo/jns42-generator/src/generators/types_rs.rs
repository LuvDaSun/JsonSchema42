use crate::{models::specification::Specification, utils::url::UrlWithPointer};
use inflector::Inflector;
use proc_macro2::TokenStream;
use quote::{format_ident, quote, TokenStreamExt};
use std::error::Error;

pub fn generate_file_token_stream(
    specification: &Specification,
) -> Result<TokenStream, Box<dyn Error>> {
    let mut tokens = quote! {};

    for item in specification.arena.iter() {
        if let Some(id) = &item.id {
            let uri = UrlWithPointer::parse(id).unwrap();
            let name_parts = specification.names.get(&uri).unwrap();
            let name_ident = format_ident!("T{}", name_parts.join(" ").to_pascal_case());

            if let Some(one_of) = &item.one_of {
                let mut inner_tokens = quote!();
                for sub_key in one_of {
                    let sub_item = specification.arena.get_item(*sub_key);
                    let sub_name_parts = specification
                        .names
                        .get(
                            &UrlWithPointer::parse(sub_item.id.as_ref().unwrap().as_str()).unwrap(),
                        )
                        .unwrap();
                    let sub_name_ident =
                        format_ident!("T{}", sub_name_parts.join(" ").to_pascal_case());
                    inner_tokens.append_all(quote! {
                        #sub_name_ident(#sub_name_ident),
                    });
                }

                tokens.append_all(quote! {
                  pub enum #name_ident {
                    #inner_tokens
                  }
                });
            } else {
                tokens.append_all(quote! {
                  pub struct #name_ident();
                });
            }
        }
    }

    Ok(tokens)
}
