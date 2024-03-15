pub mod name;
pub mod product;

pub(crate) fn neon_register(cx: &mut neon::context::ModuleContext) -> neon::result::NeonResult<()> {
  name::neon_register(cx)?;
  product::neon_register(cx)?;

  Ok(())
}
