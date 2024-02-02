use std::collections::{HashMap, HashSet};
use url::Url;

use super::document::Document;

type DocumentFactory = dyn Fn() -> dyn Document;

pub struct DocumentContext {
    /**
     * document factories by schema identifier
     */
    factory: HashMap<Url, Box<DocumentFactory>>,

    /**
     * all documents, indexed by document id
     */
    documents: HashMap<Url, Box<dyn Document>>,

    /**
     * maps node urls to their documents
     */
    node_documents: HashMap<Url, Url>,

    /**
     * all loaded nodes
     */
    node_cache: HashMap<Url, serde_json::Value>,

    /**
     * keep track of what we have been loading (so we only load it once)
     */
    loaded: HashSet<Url>,
}
