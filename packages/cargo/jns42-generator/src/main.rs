pub mod documents;
pub mod generators;
pub mod models;
pub mod programs;
pub mod schema_transforms;
pub mod utils;

use clap::Parser;
use programs::{run_program, ProgramOptions};
use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let options = ProgramOptions::parse();

    run_program(options).await?;

    Ok(())
}
