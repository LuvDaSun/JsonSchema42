use std::error::Error;

use proc_macro2::TokenStream;
use quote::{quote, TokenStreamExt};

pub fn generate_file_token_stream() -> Result<TokenStream, Box<dyn Error>> {
    let mut tokens = quote! {};

    tokens.append_all(quote! {
        pub mod types;
    });

    Ok(tokens)
}
