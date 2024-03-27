use jns42_core::models::specification::Specification;
use proc_macro2::TokenStream;
use quote::{quote, TokenStreamExt};
use std::error::Error;

pub fn generate_file_token_stream(
  _specification: &Specification,
) -> Result<TokenStream, Box<dyn Error>> {
  let mut tokens = quote! {};

  tokens.append_all(quote! {
    pub mod errors;
    pub mod interiors;
    pub mod types;
  });

  Ok(tokens)
}
