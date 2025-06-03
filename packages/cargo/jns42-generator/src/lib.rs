pub mod generators;
pub mod models;
pub mod programs;

#[cfg(test)]
mod tests {
  jns42_macros::test_specifications!(
    "fixtures/specifications",
    "packages/cargo/jns42-generator/.generated/specifications"
  );
}
