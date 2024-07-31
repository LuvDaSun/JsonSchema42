use crate::models::Specification;
use proc_macro2::TokenStream;
use quote::{quote, TokenStreamExt};
use std::error::Error;

pub fn generate_file_token_stream(
  specification: &Specification,
) -> Result<TokenStream, Box<dyn Error>> {
  let mut tokens = quote! {};

  tokens.append_all(quote! {
    use std::io::Read;
    use clap::Parser;

    #[tokio::main]
    async fn main() -> core::result::Result<(), std::boxed::Box<dyn std::error::Error>> {
      let options: ProgramOptions = ProgramOptions::parse();

      match options.command {
        ProgramCommands::Assert(options) => {
          let mut buffer = String::new();
          std::io::stdin().read_to_string(&mut buffer)?;

          println!("{}", buffer);
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
