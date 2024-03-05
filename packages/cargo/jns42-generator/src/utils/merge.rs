use std::rc::Rc;

pub type Merger<'t, T> = Rc<dyn Fn(&'t T, &'t T) -> T + 't>;

pub fn merge_option<'f, T>(
  one: Option<&'f T>,
  other: Option<&'f T>,
  merger: Merger<'f, T>,
) -> Option<T>
where
  T: Clone,
{
  match (one, other) {
    (None, None) => None,
    (Some(value), None) | (None, Some(value)) => Some(value.clone()),
    (Some(one_value), Some(other_value)) => Some(merger(one_value, other_value)),
  }
}
