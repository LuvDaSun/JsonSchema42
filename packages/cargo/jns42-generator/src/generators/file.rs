use jns42_core::utilities::banner;
use proc_macro2::TokenStream;
use quote::{TokenStreamExt, quote};
use rust_format::Formatter;
use std::error::Error;

pub fn generate_file_content(file_tokens: TokenStream) -> Result<String, Box<dyn Error>> {
  let mut tokens = quote! {};

  tokens.append_all(file_tokens);

  let configuration = rust_format::Config::new_str().edition(rust_format::Edition::Rust2021);
  let formatter = rust_format::RustFmt::from_config(configuration);

  let content = formatter.format_tokens(tokens)?;

  Ok(format!(
    "{}\n\n{}",
    banner("//", &format!("v{}", env!("CARGO_PKG_VERSION"))),
    content
  ))
}
