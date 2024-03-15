pub mod name;

pub(crate) fn neon_register(cx: &mut neon::context::ModuleContext) -> neon::result::NeonResult<()> {
  name::neon_register(cx)?;

  Ok(())
}
