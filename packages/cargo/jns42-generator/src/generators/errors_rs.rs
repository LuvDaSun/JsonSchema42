use jns42_core::models::specification::Specification;
use proc_macro2::TokenStream;
use quote::{quote, TokenStreamExt};
use std::error::Error;

pub fn generate_file_token_stream(
  _specification: &Specification,
) -> Result<TokenStream, Box<dyn Error>> {
  let mut tokens = quote! {};

  tokens.append_all(quote! {
    #[derive(Clone, Debug, PartialEq, PartialOrd, Eq, Ord)]
    pub struct ValidationError {
        r#type: &'static str,
    }
  });

  tokens.append_all(quote! {
    impl ValidationError {
        pub fn new(r#type: &'static str) -> Self {
            Self { r#type }
        }
    }
  });

  tokens.append_all(quote! {
    impl std::fmt::Display for ValidationError {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            write!(f, "validation error for type {}", self.r#type)
        }
    }

  });

  Ok(tokens)
}
