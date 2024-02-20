pub struct Document {
    //
}

impl Document {
    pub fn new() -> Self {
        Self {}
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
