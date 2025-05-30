mod generators;
mod models;
mod programs;

use clap::Parser;
use programs::{ProgramOptions, run_program};
use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
  let options = ProgramOptions::parse();

  run_program(options).await?;

  Ok(())
}
