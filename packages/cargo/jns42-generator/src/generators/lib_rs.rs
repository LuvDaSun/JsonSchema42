use crate::models::Specification;
use proc_macro2::TokenStream;
use quote::{TokenStreamExt, quote};
use std::error::Error;

pub fn generate_file_token_stream(
  _specification: &Specification,
) -> Result<TokenStream, Box<dyn Error>> {
  let mut tokens = quote! {};

  tokens.append_all(quote! {
    pub mod interiors;
    pub mod types;
    #[cfg(test)]
    pub mod examples_test;
    #[cfg(test)]
    pub mod mocks_test;
  });

  Ok(tokens)
}
