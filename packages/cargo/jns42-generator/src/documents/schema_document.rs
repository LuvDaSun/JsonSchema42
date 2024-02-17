use super::document::Document;

use std::rc::Rc;
use url::Url;

pub struct EmbeddedDocument {
    pub retrieval_url: Url,
    pub given_url: Url,
    pub node: Rc<serde_json::Value>,
}

pub struct ReferencedDocument {
    pub retrieval_url: Url,
    pub given_url: Url,
}

pub trait SchemaDocument
where
    Self: Document,
{
    fn get_referenced_documents(
        &self,
        retrieval_url: &Url,
    ) -> Box<dyn Iterator<Item = &ReferencedDocument>>;

    fn get_embedded_documents(
        &self,
        retrieval_url: &Url,
    ) -> Box<dyn Iterator<Item = &EmbeddedDocument>>;
}
