use crate::documents::{
    DocumentContext, {EmbeddedDocument, ReferencedDocument, SchemaDocument},
};
use serde_json::Value;
use url::Url;

#[allow(dead_code)]
pub struct Document {
    document_context: DocumentContext,
    antecedent_url: Option<Url>,
    document_node_url: Url,
    document_node: Value,
}

impl Document {
    pub fn new(
        document_context: DocumentContext,
        given_url: Url,
        antecedent_url: Option<Url>,
        document_node: Value,
    ) -> Self {
        Self {
            document_context,
            antecedent_url,
            document_node,
            document_node_url: given_url,
        }
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
        _retrieval_url: &url::Url,
    ) -> Box<dyn Iterator<Item = &ReferencedDocument>> {
        todo!()
    }

    fn get_embedded_documents(
        &self,
        _retrieval_url: &url::Url,
    ) -> Box<dyn Iterator<Item = &EmbeddedDocument>> {
        todo!()
    }
}
