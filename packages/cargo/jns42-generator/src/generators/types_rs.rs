use crate::{models::specification::Specification, utils::url::UrlWithPointer};
use inflector::Inflector;
use proc_macro2::TokenStream;
use quote::{format_ident, quote, TokenStreamExt};
use std::error::Error;

pub fn generate_file_token_stream(
    specification: &Specification,
) -> Result<TokenStream, Box<dyn Error>> {
    let mut tokens = quote! {};

    for (_key, item) in specification.arena.iter() {
        if let Some(id) = &item.id {
            let uri = UrlWithPointer::parse(id).unwrap();
            let name_parts = specification.names.get(&uri).unwrap();
            let name_ident = format_ident!("T{}", name_parts.join(" ").to_pascal_case());

            tokens.append_all(quote! {
                pub type #name_ident = ();
            });
        }
    }

    Ok(tokens)
}
