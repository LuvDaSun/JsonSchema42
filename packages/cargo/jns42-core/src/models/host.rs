pub struct ArenaSchemaItemHost();

impl crate::exports::jns42::core::models::GuestArenaSchemaItem for ArenaSchemaItemHost {
  fn name_get(&self) -> Vec<String> {
    todo!()
  }
  //
}

impl crate::exports::jns42::core::models::Guest for crate::Host {
  type ArenaSchemaItem = ArenaSchemaItemHost;
}
