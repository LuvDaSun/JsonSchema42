use std::rc::Rc;
use url::Url;

#[allow(dead_code)]
pub struct EmbeddedDocument {
    pub retrieval_url: Url,
    pub given_url: Url,
    pub node_url: Url,
}

#[allow(dead_code)]
pub struct ReferencedDocument {
    pub retrieval_url: Url,
    pub given_url: Url,
}

pub trait SchemaDocument {
    fn get_referenced_documents(self: Rc<Self>, retrieval_url: &Url) -> Vec<ReferencedDocument>;
    fn get_embedded_documents(self: Rc<Self>, retrieval_url: &Url) -> Vec<EmbeddedDocument>;

    fn get_document_uri(&self) -> Url;
    fn get_node_urls(&self) -> Box<dyn Iterator<Item = Url> + '_>;

    fn get_intermediate_node_entries(&self) -> Box<dyn Iterator<Item = serde_json::Value> + '_>;
}
