use crate::models::Specification;
use jns42_core::utilities::NodeLocation;
use proc_macro2::TokenStream;
use quote::{TokenStreamExt, quote};
use std::error::Error;

pub fn generate_file_token_stream(
  specification: &Specification,
  entry_location: &NodeLocation,
) -> Result<TokenStream, Box<dyn Error>> {
  let mut tokens = quote! {};

  let entry_key = specification
    .arena
    .iter()
    .enumerate()
    .find_map(|(key, item)| (item.location.as_ref()? == entry_location).then_some(key))
    .unwrap();

  let Some(identifier) = specification.get_type_identifier(&entry_key) else {
    return Ok(quote! {});
  };

  tokens.append_all(quote! {
    mod interiors;
    mod types;

    use std::io::Read;
    use clap::Parser;

    fn main() -> core::result::Result<(), std::boxed::Box<dyn std::error::Error>> {
      let options: ProgramOptions = ProgramOptions::parse();

      match options.command {
        ProgramCommands::Assert(options) => {
          let mut buffer = String::new();
          std::io::stdin().read_to_string(&mut buffer)?;

          let _entity: #identifier = serde_json::from_str(&buffer)?;
        },
      }

      Ok(())
    }

    #[derive(clap::Parser, core::fmt::Debug)]
    #[command(author, version, about)]
    pub struct ProgramOptions {
      #[command(subcommand)]
      pub command: ProgramCommands,
    }

    #[derive(clap::Subcommand, core::fmt::Debug)]
    pub enum ProgramCommands {
      Assert(AssertCommandOptions),
    }

    #[derive(clap::Parser, core::fmt::Debug)]
    pub struct AssertCommandOptions {
      #[arg(long)]
      pub parse: bool,
    }

  });

  Ok(tokens)
}
