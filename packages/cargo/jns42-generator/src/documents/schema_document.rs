use serde_json::Value;
use url::Url;

#[allow(dead_code)]
pub struct EmbeddedDocument<'a> {
    pub retrieval_url: Url,
    pub given_url: Url,
    pub node: &'a Value,
}

#[allow(dead_code)]
pub struct ReferencedDocument {
    pub retrieval_url: Url,
    pub given_url: Url,
}

pub trait SchemaDocument {
    fn get_referenced_documents(
        &self,
        retrieval_url: &Url,
    ) -> Box<dyn Iterator<Item = ReferencedDocument>>;

    fn get_embedded_documents(
        &self,
        retrieval_url: &Url,
    ) -> Box<dyn Iterator<Item = EmbeddedDocument>>;

    fn get_document_uri(&self) -> Url;
    fn get_node_urls(&self) -> Box<dyn Iterator<Item = Url>>;

    fn get_intermediate_node_entries(&self) -> Box<dyn Iterator<Item = serde_json::Value>>;
}
