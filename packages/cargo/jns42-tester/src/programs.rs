mod cases;
mod specifications;

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
  Specifications(specifications::CommandOptions),
  Cases(cases::CommandOptions),
}

pub fn run_program(options: ProgramOptions) -> Result<(), Box<dyn Error>> {
  match options.command {
    ProgramCommands::Specifications(options) => specifications::run_command(options),
    ProgramCommands::Cases(options) => cases::run_command(options),
  }
}
