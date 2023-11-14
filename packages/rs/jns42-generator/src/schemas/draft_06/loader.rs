use super::meta::META_SCHEMA_ID;
use super::selectors::Selectors;
use crate::schemas::loader::Loader;
use crate::utils::value_rc::ValueRc;
use std::collections::HashMap;
use std::rc::Rc;
use url::Url;

#[derive(Default)]
pub struct LoaderImpl {
    _root_node_map: HashMap<Url, serde_json::Value>,
}

impl LoaderImpl {
    pub fn new() -> Self {
        Self::default()
    }
}

impl Loader for LoaderImpl {
    fn is_schema_root_node(&self, node: Rc<ValueRc>) -> bool {
        if let Some(schema) = node.select_schema() {
            return schema == META_SCHEMA_ID;
        }

        false
    }

    fn load_root_node(&mut self, _node: Rc<ValueRc>, _node_url: &Url) -> Result<(), &'static str> {
        todo!()
    }

    fn index_root_node(&mut self, _node_url: &Url) -> Result<Vec<Url>, &'static str> {
        todo!()
    }

    fn get_sub_node_urls(
        &self,
        _node: Rc<ValueRc>,
        _node_url: &Url,
        _retrieval_url: &Url,
    ) -> Result<Vec<(Url, Url)>, &'static str> {
        todo!()
    }

    fn get_root_node_url(
        &self,
        _node: Rc<ValueRc>,
        _default_node_url: &Url,
    ) -> Result<Url, &'static str> {
        todo!()
    }
}
