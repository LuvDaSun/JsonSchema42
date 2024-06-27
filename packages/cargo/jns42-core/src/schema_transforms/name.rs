use crate::models::SchemaArena;

pub fn transform(arena: &mut SchemaArena, key: usize) {
  let item_base = arena.get_item(key);
  let item_base = item_base.clone();

  let Some(name_base) = item_base.name.as_ref() else {
    return;
  };

  macro_rules! set_name_single {
    ($member: ident, $suffix: literal) => {
      for key in item_base.$member.as_ref().into_iter() {
        let item = arena.get_item(*key);

        if item.name.is_some() {
          continue;
        };

        let mut item = item.clone();

        item.name = Some(
          name_base
            .iter()
            .cloned()
            .chain([$suffix.to_owned()])
            .collect(),
        );

        arena.replace_item(*key, item);
      }
    };
  }

  macro_rules! set_name_list {
    ($member: ident, $suffix: literal) => {
      for (index, key) in item_base.$member.as_ref().into_iter().flatten().enumerate() {
        let item = arena.get_item(*key);

        if item.name.is_some() {
          continue;
        };

        let mut item = item.clone();

        item.name = Some(
          name_base
            .iter()
            .cloned()
            .chain([$suffix.to_owned(), format!("{}", index)])
            .collect(),
        );

        arena.replace_item(*key, item);
      }
    };
  }

  macro_rules! set_name_map {
    ($member: ident, $suffix: literal) => {
      for (name, key) in item_base.$member.as_ref().into_iter().flatten() {
        let item = arena.get_item(*key);

        if item.name.is_some() {
          continue;
        };

        let mut item = item.clone();

        item.name = Some(
          name_base
            .iter()
            .cloned()
            .chain([$suffix.to_owned(), name.clone()])
            .collect(),
        );

        arena.replace_item(*key, item);
      }
    };
  }

  set_name_single!(property_names, "propertyNames");
  set_name_single!(map_properties, "mapProperties");
  set_name_single!(array_items, "arrayItems");
  set_name_single!(contains, "contains");
  set_name_single!(reference, "reference");
  set_name_single!(r#if, "if");
  set_name_single!(then, "then");
  set_name_single!(r#else, "else");
  set_name_single!(not, "not");

  set_name_list!(all_of, "allOf");
  set_name_list!(any_of, "anyOf");
  set_name_list!(one_of, "oneOf");
  set_name_list!(tuple_items, "oneOf");

  set_name_map!(object_properties, "objectProperties");
  set_name_map!(pattern_properties, "patternProperties");
  set_name_map!(dependent_schemas, "dependentSchemas");
}
