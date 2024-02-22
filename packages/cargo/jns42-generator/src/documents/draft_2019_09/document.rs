use serde_json::Value;

use crate::documents::document::{EmbeddedDocument, ReferencedDocument, SchemaDocument};

#[allow(dead_code)]
pub struct Document {}

impl Document {
    pub fn new() -> Self {
        Self {}
    }
}

impl SchemaDocument for Document {
    fn get_document_uri(&self) -> &url::Url {
        todo!()
    }

    fn get_node_urls(&self) -> Box<dyn Iterator<Item = &url::Url>> {
        todo!()
    }

    fn get_intermediate_node_entries(&self) -> Box<dyn Iterator<Item = &Value>> {
        todo!()
    }

    fn get_referenced_documents(
        &self,
        retrieval_url: &url::Url,
    ) -> Box<dyn Iterator<Item = &ReferencedDocument>> {
        todo!()
    }

    fn get_embedded_documents(
        &self,
        retrieval_url: &url::Url,
    ) -> Box<dyn Iterator<Item = &EmbeddedDocument>> {
        todo!()
    }
}
