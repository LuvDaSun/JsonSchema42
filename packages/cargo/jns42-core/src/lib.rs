pub mod utils;

#[neon::main]
fn neon_main(mut cx: neon::context::ModuleContext) -> neon::result::NeonResult<()> {
  neon_register(&mut cx)?;

  Ok(())
}

pub(crate) fn neon_register(cx: &mut neon::context::ModuleContext) -> neon::result::NeonResult<()> {
  utils::neon_register(cx)?;

  Ok(())
}
