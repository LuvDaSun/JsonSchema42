use std::{
    borrow::Cow,
    cmp::Ordering,
    collections::{BTreeSet, HashMap, HashSet},
};

#[derive(Debug, Default, PartialEq, Eq)]
struct PartInfo<'s> {
    value: &'s str,
    index: usize,
    cardinality: usize,
    is_head: bool,
}

impl<'s> PartialOrd for PartInfo<'s> {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl<'s> Ord for PartInfo<'s> {
    fn cmp(&self, other: &Self) -> Ordering {
        match self.is_head.cmp(&other.is_head) {
            Ordering::Less => return Ordering::Greater,
            Ordering::Greater => return Ordering::Less,
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

pub fn optimize_names(
    names: Vec<Vec<&str>>,
    maximum_iterations: usize,
) -> impl Iterator<Item = (Vec<&str>, Vec<Cow<str>>)> {
    // first we calculate the cardinality of each name-part we use this hashmap to keep
    // count
    let mut cardinality_counters = HashMap::<_, usize>::new();
    for name in &names {
        // unique name parts
        let name: HashSet<_> = name.iter().collect();
        for part in name {
            // for every unique name part add 1 to cardinality
            let cardinality = cardinality_counters.entry(part).or_default();
            *cardinality += 1;
        }
    }

    // then we create part info's that we can optimize. The key is the original name, then the
    // value is a tuple where the first element is the optimized name and the second part are
    // the ordered part info's. Those are ordered!
    let mut part_info_map: HashMap<Vec<&str>, (Vec<&str>, BTreeSet<_>)> = HashMap::new();
    for name in &names {
        let part_info_entry = part_info_map.entry(name.to_vec()).or_default();
        for (index, part) in name.iter().enumerate() {
            let part_info = PartInfo {
                cardinality: *cardinality_counters.entry(part).or_default(),
                index,
                value: part,
                is_head: index == name.len() - 1,
            };
            part_info_entry.1.insert(part_info);
        }
    }

    // this is where we keep the optimized names as the key, the original names are in the value.
    // Ideally there is only one element in the vector that is the value. This means that the
    // optimized name references only one original name and that we can use it as a replacement
    // for the original name.
    let mut optimized_names: HashMap<Vec<_>, Vec<Vec<_>>> = Default::default();
    // then run the optimization process! we keep on iterating the optimization until we reach the
    // maximum number of iterations, or if there is nothing more to optimize.
    for _iteration in 0..maximum_iterations {
        let mut done = true;
        optimized_names = Default::default();

        for (optimized_name, part_info) in &part_info_map {
            let original_names = optimized_names.entry(part_info.0.clone()).or_default();
            (*original_names).push(optimized_name.clone());
        }

        for original_names in optimized_names.values() {
            if original_names.len() == 1 {
                // hurray optimization for this name is done!
                continue;
            }

            // if we get to here then one of the names is not unique! this means we need
            // another iteration after this one. We are not done!
            done = false;

            // add a name part to the optimized names. For every optimized name, take the first
            // part info and add it to the optimized name. The part infos are ordered by cardinality
            // so unique names are more likely to popup. More unique names (lower cardinality) will
            // be at the beginning of the set.
            for original_name in original_names {
                let (optimized_name, part_infos) = part_info_map.get_mut(original_name).unwrap();
                let part_info = part_infos.pop_first();
                if let Some(part_info) = part_info {
                    optimized_name.push(part_info.value);
                }
            }
        }

        if done {
            break;
        }
    }

    // return the optimized names. If the original names vector has a length of 1 then
    // it is  unique and can safely be returned. If not, then we need to make it unique
    // by adding an index to it.
    optimized_names
        .into_iter()
        .flat_map(|(optimized_name, original_names)| {
            let unique = original_names.len() == 1;
            original_names
                .into_iter()
                .enumerate()
                .map(move |(index, original_name)| {
                    let mut optimized_name: Vec<_> = optimized_name
                        .iter()
                        .map(|value| Cow::Borrowed(*value))
                        .collect();
                    optimized_name.reverse();
                    if unique {
                        (original_name, optimized_name)
                    } else {
                        optimized_name.push(Cow::Owned(index.to_string()));
                        (original_name, optimized_name)
                    }
                })
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_part_info_order() {
        let part_info_a = PartInfo {
            cardinality: 100,
            index: 1,
            is_head: false,
            value: "A",
        };
        let part_info_b = PartInfo {
            cardinality: 1,
            index: 2,
            is_head: false,
            value: "B",
        };
        let part_info_c = PartInfo {
            cardinality: 100,
            index: 3,
            is_head: false,
            value: "C",
        };
        let part_info_d = PartInfo {
            cardinality: 10,
            index: 4,
            is_head: false,
            value: "D",
        };
        let part_info_e = PartInfo {
            cardinality: 1000,
            index: 5,
            is_head: true,
            value: "E",
        };

        let mut actual: Vec<_> = [
            &part_info_a,
            &part_info_b,
            &part_info_c,
            &part_info_d,
            &part_info_e,
        ]
        .into();
        actual.sort();

        let expected: Vec<_> = [
            &part_info_e,
            &part_info_b,
            &part_info_d,
            &part_info_a,
            &part_info_c,
        ]
        .into();

        assert_eq!(actual, expected);
    }

    #[test]
    fn test_names() {
        let actual: BTreeSet<_> = optimize_names(vec![vec!["A"], vec![""]], 5).collect();
        let expected: BTreeSet<_> = [
            (vec!["A"], vec![Cow::Borrowed("A")]),
            (vec![""], vec![Cow::Borrowed("")]),
        ]
        .into_iter()
        .collect();
        assert_eq!(actual, expected);

        let actual: BTreeSet<_> = optimize_names(vec![vec!["A"], vec!["B"]], 5).collect();
        let expected: BTreeSet<_> = [
            (vec!["A"], vec![Cow::Borrowed("A")]),
            (vec!["B"], vec![Cow::Borrowed("B")]),
        ]
        .into_iter()
        .collect();
        assert_eq!(actual, expected);

        let actual: BTreeSet<_> =
            optimize_names(vec![vec!["A"], vec!["B", "C"], vec!["B", "D"]], 5).collect();
        let expected: BTreeSet<_> = [
            (vec!["A"], vec![Cow::Borrowed("A")]),
            (vec!["B", "C"], vec![Cow::Borrowed("C")]),
            (vec!["B", "D"], vec![Cow::Borrowed("D")]),
        ]
        .into_iter()
        .collect();
        assert_eq!(actual, expected);

        let actual: BTreeSet<_> = optimize_names(
            vec![
                vec!["cat", "properties", "id"],
                vec!["dog", "properties", "id"],
                vec!["goat", "properties", "id"],
            ],
            5,
        )
        .collect();
        let expected: BTreeSet<_> = [
            (
                vec!["cat", "properties", "id"],
                vec![Cow::Borrowed("cat"), Cow::Borrowed("id")],
            ),
            (
                vec!["dog", "properties", "id"],
                vec![Cow::Borrowed("dog"), Cow::Borrowed("id")],
            ),
            (
                vec!["goat", "properties", "id"],
                vec![Cow::Borrowed("goat"), Cow::Borrowed("id")],
            ),
        ]
        .into_iter()
        .collect();
        assert_eq!(actual, expected);
    }
}
