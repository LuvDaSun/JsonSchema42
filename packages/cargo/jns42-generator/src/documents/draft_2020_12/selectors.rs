use super::Node;
use crate::utils::json_pointer::JsonPointer;

pub trait Selectors {
    fn select_schema(&self) -> Option<&str>;
    fn select_id(&self) -> Option<&str>;
    fn select_ref(&self) -> Option<&str>;

    fn select_title(&self) -> Option<&str>;
    fn select_description(&self) -> Option<&str>;
    // fn select_examples(&self) -> Option<&Vec<Value>>;
    fn select_deprecated(&self) -> Option<bool>;

    fn select_types(&self) -> Option<Vec<&str>>;

    fn select_sub_nodes(&self, pointer: &JsonPointer) -> Vec<(JsonPointer, Node)>;
    fn select_sub_node_def_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>>;
    fn select_sub_node_property_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>>;
    fn select_sub_node_additional_properties_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>>;
    fn select_sub_node_prefix_items_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>>;
    fn select_sub_node_items_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>>;
    fn select_sub_node_all_of_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>>;
    fn select_sub_node_any_of_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>>;
    fn select_sub_node_one_of_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>>;
}

impl Selectors for Node {
    fn select_schema(&self) -> Option<&str> {
        self.as_object()?.get("$schema")?.as_str()
    }

    fn select_id(&self) -> Option<&str> {
        self.as_object()?.get("$id")?.as_str()
    }

    fn select_ref(&self) -> Option<&str> {
        self.as_object()?.get("$ref")?.as_str()
    }

    fn select_title(&self) -> Option<&str> {
        self.as_object()?.get("title")?.as_str()
    }

    fn select_description(&self) -> Option<&str> {
        self.as_object()?.get("description")?.as_str()
    }

    // fn select_examples(&self) -> Option<&Vec<Value>> {
    //     self.as_object()?
    //         .get("examples")?
    //         .as_array()
    //         .map(|item| item.into())
    // }

    fn select_deprecated(&self) -> Option<bool> {
        self.as_object()?.get("deprecated")?.as_bool()
    }

    fn select_types(&self) -> Option<Vec<&str>> {
        match self.as_object()?.get("type")? {
            Node::String(value) => Some(vec![value]),
            Node::Array(value) => Some(value.iter().filter_map(|value| value.as_str()).collect()),
            _ => None,
        }
    }

    fn select_sub_nodes(&self, pointer: &JsonPointer) -> Vec<(JsonPointer, Node)> {
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

    fn select_sub_node_def_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>> {
        let select_name = "$defs";
        let selected = self.as_object()?.get(select_name)?;

        let result = selected
            .as_object()?
            .iter()
            .map(|(key, sub_node)| {
                (
                    pointer.push(select_name.to_string()).push(key.to_string()),
                    sub_node.clone(),
                )
            })
            .collect();

        Some(result)
    }
    fn select_sub_node_property_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>> {
        let select_name = "properties";
        let selected = self.as_object()?.get(select_name)?;

        let result = selected
            .as_object()?
            .iter()
            .map(|(key, sub_node)| {
                (
                    pointer.push(select_name.to_string()).push(key.to_string()),
                    sub_node.clone(),
                )
            })
            .collect();

        Some(result)
    }
    fn select_sub_node_additional_properties_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>> {
        let select_name = "additionalProperties";
        let selected = self.as_object()?.get(select_name)?;

        let result = vec![(pointer.push(select_name.to_string()), selected.clone())];

        Some(result)
    }
    fn select_sub_node_prefix_items_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>> {
        let select_name = "prefixItems";
        let selected = self.as_object()?.get(select_name)?;

        let result = selected
            .as_array()?
            .iter()
            .enumerate()
            .map(|(key, sub_node)| {
                (
                    pointer.push(select_name.to_string()).push(key.to_string()),
                    sub_node.clone(),
                )
            })
            .collect();

        Some(result)
    }
    fn select_sub_node_items_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>> {
        let select_name = "items";
        let selected = self.as_object()?.get(select_name)?;

        let result = vec![(pointer.push(select_name.to_string()), selected.clone())];

        Some(result)
    }
    fn select_sub_node_all_of_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>> {
        let select_name = "allOf";
        let selected = self.as_object()?.get(select_name)?;

        let result = selected
            .as_array()?
            .iter()
            .enumerate()
            .map(|(key, sub_node)| {
                (
                    pointer.push(select_name.to_string()).push(key.to_string()),
                    sub_node.clone(),
                )
            })
            .collect();

        Some(result)
    }
    fn select_sub_node_any_of_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>> {
        let select_name = "anyOf";
        let selected = self.as_object()?.get(select_name)?;

        let result = selected
            .as_array()?
            .iter()
            .enumerate()
            .map(|(key, sub_node)| {
                (
                    pointer.push(select_name.to_string()).push(key.to_string()),
                    sub_node.clone(),
                )
            })
            .collect();

        Some(result)
    }
    fn select_sub_node_one_of_entries(
        &self,
        pointer: &JsonPointer,
    ) -> Option<Vec<(JsonPointer, Node)>> {
        let select_name = "oneOf";
        let selected = self.as_object()?.get(select_name)?;

        let result = selected
            .as_array()?
            .iter()
            .enumerate()
            .map(|(key, sub_node)| {
                (
                    pointer.push(select_name.to_string()).push(key.to_string()),
                    sub_node.clone(),
                )
            })
            .collect();

        Some(result)
    }
}
