use crate::documents;
use clap::ValueEnum;
use std::fmt::Display;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, ValueEnum)]
pub enum MetaSchemaId {
    Unknown,

    #[clap(name = documents::draft_2020_12::meta::META_SCHEMA_ID)]
    Draft202012,

    #[clap(name = documents::draft_2019_09::meta::META_SCHEMA_ID)]
    Draft201909,

    #[clap(name = documents::draft_07::meta::META_SCHEMA_ID)]
    Draft07,

    #[clap(name = documents::draft_06::meta::META_SCHEMA_ID)]
    Draft06,

    #[clap(name = documents::draft_04::meta::META_SCHEMA_ID)]
    Draft04,
}

impl Display for MetaSchemaId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.into())
    }
}

impl From<&MetaSchemaId> for &'static str {
    fn from(value: &MetaSchemaId) -> Self {
        match value {
            MetaSchemaId::Draft202012 => documents::draft_2020_12::meta::META_SCHEMA_ID,
            MetaSchemaId::Draft201909 => documents::draft_2019_09::meta::META_SCHEMA_ID,
            MetaSchemaId::Draft07 => documents::draft_07::meta::META_SCHEMA_ID,
            MetaSchemaId::Draft06 => documents::draft_06::meta::META_SCHEMA_ID,
            MetaSchemaId::Draft04 => documents::draft_04::meta::META_SCHEMA_ID,
            MetaSchemaId::Unknown => "",
        }
    }
}

impl From<&str> for MetaSchemaId {
    fn from(value: &str) -> Self {
        match value {
            documents::draft_2020_12::meta::META_SCHEMA_ID => MetaSchemaId::Draft202012,
            documents::draft_2019_09::meta::META_SCHEMA_ID => MetaSchemaId::Draft201909,
            documents::draft_07::meta::META_SCHEMA_ID => MetaSchemaId::Draft07,
            documents::draft_06::meta::META_SCHEMA_ID => MetaSchemaId::Draft06,
            documents::draft_04::meta::META_SCHEMA_ID => MetaSchemaId::Draft04,
            _ => MetaSchemaId::Unknown,
        }
    }
}
