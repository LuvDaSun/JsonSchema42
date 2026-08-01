use crate::models::Specification;
use jns42_core::models::ArenaSchemaItem;
use proc_macro2::TokenStream;
use quote::{TokenStreamExt, quote};
use std::error::Error;

pub fn generate_file_token_stream(
  specification: &Specification,
) -> Result<TokenStream, Box<dyn Error>> {
  let mut tokens = quote! {};

  for (key, item) in specification.arena.iter().enumerate() {
    tokens.append_all(generate_test_token_stream(specification, &key, item));
  }

  Ok(tokens)
}

fn generate_test_token_stream(
  specification: &Specification,
  key: &usize,
  _item: &ArenaSchemaItem,
) -> Result<TokenStream, Box<dyn Error>> {
  let mut tokens = quote! {};

  let Some(identifier) = specification.get_snake_identifier(key) else {
    return Ok(quote! {});
  };

  tokens.append_all(quote! {
    #[test]
    fn #identifier() {
      //
    }
  });

  Ok(tokens)
}
