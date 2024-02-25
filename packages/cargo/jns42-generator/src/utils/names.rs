use std::{cmp::Ordering, iter::empty};

#[derive(Debug, PartialEq, Eq)]
struct PartInfo {
    value: String,
    index: usize,
    cardinality: usize,
    is_head: bool,
}

impl PartialOrd for PartInfo {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for PartInfo {
    fn cmp(&self, other: &Self) -> Ordering {
        match self.is_head.cmp(&other.is_head) {
            Ordering::Less => return Ordering::Less,
            Ordering::Greater => return Ordering::Greater,
            _ => {}
        };

        match self.cardinality.cmp(&other.cardinality) {
            Ordering::Less => return Ordering::Less,
            Ordering::Greater => return Ordering::Greater,
            _ => {}
        };

        match self.index.cmp(&other.index) {
            Ordering::Less => return Ordering::Less,
            Ordering::Greater => return Ordering::Greater,
            _ => {}
        };

        Ordering::Equal
    }
}

pub fn make_names<'f>(
    ids: impl Iterator<Item = impl Iterator<Item = &'f str>>,
    default_name: impl Iterator<Item = &'f str>,
    maximum_iterations: usize,
) -> impl Iterator<Item = (String, Vec<String>)> {
    for ids in ids {
        //
    }

    for iteration in 0..maximum_iterations {
        //
    }

    empty()
}
