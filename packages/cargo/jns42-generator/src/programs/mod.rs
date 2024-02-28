mod package;

use clap::{Parser, Subcommand};
use std::error::Error;

#[derive(Parser, Debug)]
#[command(author, version, about)]
pub struct ProgramOptions {
  #[command(subcommand)]
  pub command: ProgramCommands,
}

#[derive(Subcommand, Debug)]
pub enum ProgramCommands {
  Package(package::CommandOptions),
}

pub async fn run_program(options: ProgramOptions) -> Result<(), Box<dyn Error>> {
  match options.command {
    ProgramCommands::Package(options) => package::run_command(options).await,
  }
}
