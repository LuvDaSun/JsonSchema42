use crate::documents::document_context::DocumentContext;
use serde_json::Value;
use url::Url;

pub struct Document {
    antecedent_url: Option<Url>,
    document_node_url: Url,
    document_node: Value,
}

impl Document {
    pub fn new(given_url: Url, antecedent_url: Option<Url>, document_node: Value) -> Self {
        Self {
            antecedent_url,
            document_node,
            document_node_url: given_url,
        }
    }
}

impl crate::documents::document::Document for Document {
    fn get_document_uri(&self) -> &url::Url {
        todo!()
    }

    fn get_node_urls(&self) -> Box<dyn Iterator<Item = &url::Url>> {
        todo!()
    }

    fn get_intermediate_node_entries(&self) -> Box<dyn Iterator<Item = &serde_json::Value>> {
        todo!()
    }
}
