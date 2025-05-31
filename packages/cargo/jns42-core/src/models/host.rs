pub struct SchemaItemHost();

impl crate::exports::jns42::core::models::GuestSchemaItem for SchemaItemHost {
  fn name_get(&self) -> Vec<String> {
    todo!()
  }
  //
}

impl crate::exports::jns42::core::models::Guest for crate::Host {
  type SchemaItem = SchemaItemHost;
}
