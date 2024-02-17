use url::Url;

pub trait Document {
    fn get_document_id(&self) -> &Url;

    fn get_intermediate_node_entries(&self) -> Box<dyn Iterator<Item = &serde_json::Value>>;
}
