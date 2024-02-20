use super::document::Document;
use serde_json::Value;
use url::Url;

pub struct EmbeddedDocument<'a> {
    pub retrieval_url: Url,
    pub given_url: Url,
    pub node: &'a Value,
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
