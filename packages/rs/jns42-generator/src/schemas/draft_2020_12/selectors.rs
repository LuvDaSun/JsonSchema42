use crate::utils::{json_pointer::join_json_pointer, value_rc::ValueRc};
use std::rc::Rc;

pub trait Selectors {
    fn select_schema(&self) -> Option<&str>;
    fn select_id(&self) -> Option<&str>;
    fn select_ref(&self) -> Option<&str>;

    fn select_sub_nodes(&self, pointer: &str) -> Vec<(String, Rc<ValueRc>)>;
    fn select_all_sub_nodes(&self, pointer: &str) -> Vec<(String, Rc<ValueRc>)>;

    fn select_sub_node_def_entries(&self, pointer: &str) -> Option<Vec<(String, Rc<ValueRc>)>>;
    fn select_sub_node_property_entries(&self, pointer: &str)
        -> Option<Vec<(String, Rc<ValueRc>)>>;
    fn select_sub_node_additional_properties_entries(
        &self,
        pointer: &str,
    ) -> Option<Vec<(String, Rc<ValueRc>)>>;
    fn select_sub_node_prefix_items_entries(
        &self,
        pointer: &str,
    ) -> Option<Vec<(String, Rc<ValueRc>)>>;
    fn select_sub_node_items_entries(&self, pointer: &str) -> Option<Vec<(String, Rc<ValueRc>)>>;
    fn select_sub_node_all_of_entries(&self, pointer: &str) -> Option<Vec<(String, Rc<ValueRc>)>>;
    fn select_sub_node_any_of_entries(&self, pointer: &str) -> Option<Vec<(String, Rc<ValueRc>)>>;
    fn select_sub_node_one_of_entries(&self, pointer: &str) -> Option<Vec<(String, Rc<ValueRc>)>>;
}

impl Selectors for Rc<ValueRc> {
    fn select_schema(&self) -> Option<&str> {
        self.as_object()?.get("$schema")?.as_str()
    }

    fn select_id(&self) -> Option<&str> {
        self.as_object()?.get("$id")?.as_str()
    }

    fn select_ref(&self) -> Option<&str> {
        self.as_object()?.get("$ref")?.as_str()
    }

    fn select_all_sub_nodes(&self, pointer: &str) -> Vec<(String, Rc<ValueRc>)> {
        let result = self.select_sub_nodes(pointer);
        vec![
            result.clone(),
            result
                .iter()
                .flat_map(|(sub_pointer, sub_node)| {
                    sub_node.select_all_sub_nodes(sub_pointer.as_str())
                })
                .collect(),
        ]
        .into_iter()
        .flatten()
        .collect()
    }

    fn select_sub_nodes(&self, pointer: &str) -> Vec<(String, Rc<ValueRc>)> {
        vec![
            self.select_sub_node_def_entries(pointer)
                .unwrap_or_default(),
            self.select_sub_node_property_entries(pointer)
                .unwrap_or_default(),
            self.select_sub_node_additional_properties_entries(pointer)
                .unwrap_or_default(),
            self.select_sub_node_prefix_items_entries(pointer)
                .unwrap_or_default(),
            self.select_sub_node_items_entries(pointer)
                .unwrap_or_default(),
            self.select_sub_node_all_of_entries(pointer)
                .unwrap_or_default(),
            self.select_sub_node_any_of_entries(pointer)
                .unwrap_or_default(),
            self.select_sub_node_one_of_entries(pointer)
                .unwrap_or_default(),
        ]
        .into_iter()
        .flatten()
        .collect()
    }

    //

    fn select_sub_node_def_entries(&self, pointer: &str) -> Option<Vec<(String, Rc<ValueRc>)>> {
        let select_name = "$defs";
        let selected = self.as_object()?.get(select_name)?;

        let result = selected
            .as_object()?
            .iter()
            .map(|(sub_pointer, sub_node)| {
                (
                    join_json_pointer(vec![pointer, select_name, sub_pointer.as_str()]),
                    sub_node.clone(),
                )
            })
            .collect();

        Some(result)
    }
    fn select_sub_node_property_entries(
        &self,
        pointer: &str,
    ) -> Option<Vec<(String, Rc<ValueRc>)>> {
        let select_name = "properties";
        let selected = self.as_object()?.get(select_name)?;

        let result = selected
            .as_object()?
            .iter()
            .map(|(sub_pointer, sub_node)| {
                (
                    join_json_pointer(vec![pointer, select_name, sub_pointer.as_str()]),
                    sub_node.clone(),
                )
            })
            .collect();

        Some(result)
    }
    fn select_sub_node_additional_properties_entries(
        &self,
        pointer: &str,
    ) -> Option<Vec<(String, Rc<ValueRc>)>> {
        let select_name = "additionalProperties";
        let selected = self.as_object()?.get(select_name)?;

        let result = vec![(
            join_json_pointer(vec![pointer, select_name]),
            selected.clone(),
        )];

        Some(result)
    }
    fn select_sub_node_prefix_items_entries(
        &self,
        pointer: &str,
    ) -> Option<Vec<(String, Rc<ValueRc>)>> {
        let select_name = "prefixItems";
        let selected = self.as_object()?.get(select_name)?;

        let result = selected
            .as_array()?
            .iter()
            .enumerate()
            .map(|(sub_pointer, sub_node)| {
                (
                    join_json_pointer(vec![pointer, select_name, sub_pointer.to_string().as_str()]),
                    sub_node.clone(),
                )
            })
            .collect();

        Some(result)
    }
    fn select_sub_node_items_entries(&self, pointer: &str) -> Option<Vec<(String, Rc<ValueRc>)>> {
        let select_name = "items";
        let selected = self.as_object()?.get(select_name)?;

        let result = vec![(
            join_json_pointer(vec![pointer, select_name]),
            selected.clone(),
        )];

        Some(result)
    }
    fn select_sub_node_all_of_entries(&self, pointer: &str) -> Option<Vec<(String, Rc<ValueRc>)>> {
        let select_name = "allOf";
        let selected = self.as_object()?.get(select_name)?;

        let result = selected
            .as_array()?
            .iter()
            .enumerate()
            .map(|(sub_pointer, sub_node)| {
                (
                    join_json_pointer(vec![pointer, select_name, sub_pointer.to_string().as_str()]),
                    sub_node.clone(),
                )
            })
            .collect();

        Some(result)
    }
    fn select_sub_node_any_of_entries(&self, pointer: &str) -> Option<Vec<(String, Rc<ValueRc>)>> {
        let select_name = "anyOf";
        let selected = self.as_object()?.get(select_name)?;

        let result = selected
            .as_array()?
            .iter()
            .enumerate()
            .map(|(sub_pointer, sub_node)| {
                (
                    join_json_pointer(vec![pointer, select_name, sub_pointer.to_string().as_str()]),
                    sub_node.clone(),
                )
            })
            .collect();

        Some(result)
    }
    fn select_sub_node_one_of_entries(&self, pointer: &str) -> Option<Vec<(String, Rc<ValueRc>)>> {
        let select_name = "oneOf";
        let selected = self.as_object()?.get(select_name)?;

        let result = selected
            .as_array()?
            .iter()
            .enumerate()
            .map(|(sub_pointer, sub_node)| {
                (
                    join_json_pointer(vec![pointer, select_name, sub_pointer.to_string().as_str()]),
                    sub_node.clone(),
                )
            })
            .collect();

        Some(result)
    }

    //
}
