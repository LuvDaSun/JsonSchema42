use crate::models::Specification;
use jns42_core::models::ArenaSchemaItem;
use proc_macro2::TokenStream;
use quote::{quote, TokenStreamExt};
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
  item: &ArenaSchemaItem,
) -> Result<TokenStream, Box<dyn Error>> {
  let mut tokens = quote! {};

  let Some(name) = specification.get_snake_name(key) else {
    return Ok(quote! {});
  };

  let Some(type_identifier) = specification.get_type_identifier(key) else {
    return Ok(quote! {});
  };

  for (index, example) in item.examples.iter().flatten().enumerate() {
    let test_identifier = if index == 0 {
      quote::format_ident!("r#{}", name)
    } else {
      quote::format_ident!("r#{}_{}", name, index)
    };
    let data = serde_json::to_string(example)?;
    tokens.append_all(quote! {
      #[test]
      fn #test_identifier() -> Result<(), Box<dyn std::error::Error>> {
        let data = #data;

        serde_json::from_str::<#type_identifier>(data)?;

        Ok(())
      }
    });
  }

  Ok(tokens)
}
