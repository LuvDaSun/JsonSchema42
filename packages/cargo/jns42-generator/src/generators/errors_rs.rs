use crate::models::Specification;
use proc_macro2::TokenStream;
use quote::{TokenStreamExt, quote};
use std::error::Error;

pub fn generate_file_token_stream(
  _specification: &Specification,
) -> Result<TokenStream, Box<dyn Error>> {
  let mut tokens = quote! {};

  tokens.append_all(quote! {
    #[derive(core::clone::Clone, core::fmt::Debug, core::cmp::PartialEq, core::cmp::PartialOrd, core::cmp::Eq, core::cmp::Ord)]
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
    impl core::fmt::Display for ValidationError {
        fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
            write!(f, "validation error for type {}", self.r#type)
        }
    }

  });

  Ok(tokens)
}
