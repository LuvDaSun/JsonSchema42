pub trait Document {
    fn get_intermediate_node_entries(&self) -> Box<dyn Iterator<Item = &serde_json::Value>>;
}
