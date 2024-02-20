use url::Url;

pub trait Document {
    fn get_document_uri(&self) -> &Url;
    fn get_node_urls(&self) -> Box<dyn Iterator<Item = &Url>>;

    fn get_intermediate_node_entries(&self) -> Box<dyn Iterator<Item = &serde_json::Value>>;
}
