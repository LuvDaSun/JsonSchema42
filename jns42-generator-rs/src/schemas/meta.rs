use crate::schemas;
use clap::ValueEnum;
use std::fmt::Display;

#[derive(Debug, Copy, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, ValueEnum)]
pub enum MetaSchemaId {
    Unknown,

    #[clap(name = schemas::draft_2020_12::meta::META_SCHEMA_ID)]
    Draft202012,

    #[clap(name = schemas::draft_2019_09::meta::META_SCHEMA_ID)]
    Draft201909,

    #[clap(name = schemas::draft_07::meta::META_SCHEMA_ID)]
    Draft07,

    #[clap(name = schemas::draft_06::meta::META_SCHEMA_ID)]
    Draft06,

    #[clap(name = schemas::draft_04::meta::META_SCHEMA_ID)]
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
            MetaSchemaId::Draft202012 => schemas::draft_2020_12::meta::META_SCHEMA_ID,
            MetaSchemaId::Draft201909 => schemas::draft_2019_09::meta::META_SCHEMA_ID,
            MetaSchemaId::Draft07 => schemas::draft_07::meta::META_SCHEMA_ID,
            MetaSchemaId::Draft06 => schemas::draft_06::meta::META_SCHEMA_ID,
            MetaSchemaId::Draft04 => schemas::draft_04::meta::META_SCHEMA_ID,
            MetaSchemaId::Unknown => "",
        }
    }
}

impl From<&str> for MetaSchemaId {
    fn from(value: &str) -> Self {
        match value {
            schemas::draft_2020_12::meta::META_SCHEMA_ID => MetaSchemaId::Draft202012,
            schemas::draft_2019_09::meta::META_SCHEMA_ID => MetaSchemaId::Draft201909,
            schemas::draft_07::meta::META_SCHEMA_ID => MetaSchemaId::Draft07,
            schemas::draft_06::meta::META_SCHEMA_ID => MetaSchemaId::Draft06,
            schemas::draft_04::meta::META_SCHEMA_ID => MetaSchemaId::Draft04,
            _ => MetaSchemaId::Unknown,
        }
    }
}
