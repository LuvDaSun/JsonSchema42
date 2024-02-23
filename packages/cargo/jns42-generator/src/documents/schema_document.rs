use crate::utils::url::UrlWithPointer;
use std::rc::Rc;

#[allow(dead_code)]
pub struct EmbeddedDocument {
    pub retrieval_url: UrlWithPointer,
    pub given_url: UrlWithPointer,
    pub node_url: UrlWithPointer,
}

#[allow(dead_code)]
pub struct ReferencedDocument {
    pub retrieval_url: UrlWithPointer,
    pub given_url: UrlWithPointer,
}

pub trait SchemaDocument {
    fn get_referenced_documents(
        self: Rc<Self>,
        retrieval_url: &UrlWithPointer,
    ) -> Vec<ReferencedDocument>;
    fn get_embedded_documents(
        self: Rc<Self>,
        retrieval_url: &UrlWithPointer,
    ) -> Vec<EmbeddedDocument>;

    fn get_document_uri(&self) -> UrlWithPointer;
    fn get_node_urls(&self) -> Box<dyn Iterator<Item = UrlWithPointer> + '_>;

    fn get_intermediate_node_entries(&self) -> Box<dyn Iterator<Item = serde_json::Value> + '_>;
}
