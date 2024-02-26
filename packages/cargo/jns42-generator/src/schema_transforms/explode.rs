use crate::models::{arena::Arena, schema::SchemaNode};

pub fn explode_transform(arena: &mut Arena<SchemaNode>, key: usize) {
    let item = arena.get_item(key);
    let mut sub_items = Vec::new();

    if item
        .types
        .as_ref()
        .map(|value| value.len())
        .unwrap_or_default()
        > 0
    {
        sub_items.push(SchemaNode {
            parent: Some(key),
            types: item.types.clone(),
            ..Default::default()
        })
    }

    if item.reference.is_some() {
        sub_items.push(SchemaNode {
            parent: Some(key),
            reference: item.reference,
            ..Default::default()
        })
    }

    if item
        .all_of
        .as_ref()
        .map(|value| value.len())
        .unwrap_or_default()
        > 0
    {
        sub_items.push(SchemaNode {
            parent: Some(key),
            all_of: item.all_of.clone(),
            ..Default::default()
        })
    }

    if item
        .any_of
        .as_ref()
        .map(|value| value.len())
        .unwrap_or_default()
        > 0
    {
        sub_items.push(SchemaNode {
            parent: Some(key),
            any_of: item.any_of.clone(),
            ..Default::default()
        })
    }

    if item
        .one_of
        .as_ref()
        .map(|value| value.len())
        .unwrap_or_default()
        > 0
    {
        sub_items.push(SchemaNode {
            parent: Some(key),
            one_of: item.one_of.clone(),
            ..Default::default()
        })
    }

    if item.r#if.is_some() || item.then.is_some() || item.r#else.is_some() {
        sub_items.push(SchemaNode {
            parent: Some(key),
            r#if: item.r#if,
            then: item.then,
            r#else: item.r#else,
            ..Default::default()
        })
    }

    if sub_items.len() > 1 {
        let item = item.clone();
        let sub_keys = sub_items
            .into_iter()
            .map(|sub_item| arena.add_item(sub_item))
            .collect();

        arena.set_item(
            key,
            SchemaNode {
                types: None,
                reference: None,
                all_of: Some(sub_keys),
                any_of: None,
                one_of: None,
                r#if: None,
                then: None,
                r#else: None,
                ..item
            },
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{arena::Arena, schema::SchemaNode};

    #[test]
    fn test_explode() {
        let mut arena = Arena::new();

        arena.add_item(SchemaNode {
            reference: Some(10),
            all_of: Some(vec![100, 200]),
            any_of: Some(vec![300, 400]),
            one_of: Some(vec![500, 600]),
            r#if: Some(700),
            then: Some(800),
            r#else: Some(900),
            ..Default::default()
        });

        arena.apply_transform(explode_transform);

        let actual: Vec<_> = arena.iter().cloned().collect();
        let expected = vec![
            SchemaNode {
                reference: None,
                any_of: None,
                one_of: None,
                r#if: None,
                then: None,
                r#else: None,
                all_of: Some(vec![1, 2, 3, 4, 5]),
                ..Default::default()
            },
            SchemaNode {
                parent: Some(0),
                reference: Some(10),
                ..Default::default()
            },
            SchemaNode {
                parent: Some(0),
                all_of: Some(vec![100, 200]),
                ..Default::default()
            },
            SchemaNode {
                parent: Some(0),
                any_of: Some(vec![300, 400]),
                ..Default::default()
            },
            SchemaNode {
                parent: Some(0),
                one_of: Some(vec![500, 600]),
                ..Default::default()
            },
            SchemaNode {
                parent: Some(0),
                r#if: Some(700),
                then: Some(800),
                r#else: Some(900),
                ..Default::default()
            },
        ];

        assert_eq!(actual, expected)
    }
}
