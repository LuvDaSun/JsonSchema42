mod package;

use clap::{Parser, Subcommand};

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct ProgramOptions {
    #[command(subcommand)]
    pub command: ProgramCommands,
}

#[derive(Subcommand, Debug)]
pub enum ProgramCommands {
    Package(package::CommandOptions),
}

pub fn run_program(options: ProgramOptions) -> Result<(), &'static str> {
    match options.command {
        ProgramCommands::Package(options) => package::run_command(options),
    }
}
