pub fn merge_option<'f, T>(
  base: Option<&'f T>,
  other: Option<&'f T>,
  merger: impl FnOnce(&'f T, &'f T) -> T,
) -> Option<T>
where
  T: Clone + PartialEq,
{
  if base == other {
    return base.cloned();
  }

  match (base, other) {
    (None, None) => None,
    (Some(value), None) | (None, Some(value)) => Some(value.clone()),
    (Some(one_value), Some(other_value)) => Some(merger(one_value, other_value)),
  }
}

pub fn merge_either<'f, T>(base: Option<&'f T>, other: Option<&'f T>) -> Option<T>
where
  T: Clone + PartialEq,
{
  if base == other {
    return base.cloned();
  }

  match (base, other) {
    (None, None) => None,
    (Some(value), None) | (None, Some(value)) => Some(value.clone()),
    (Some(_), Some(_)) => None,
  }
}

#[cfg(test)]
mod tests {
  use super::merge_option;
  use std::cell::RefCell;

  #[test]
  fn test_merge_option() {
    struct W(usize);
    impl W {
      pub fn add(&mut self, value: usize) {
        self.0 += value
      }
    }

    let sum = RefCell::new(W(0));
    let a = Some(1);
    let b = Some(2);
    let c = Some(3);

    let merger = |a, b| {
      let r = a + b;
      sum.borrow_mut().add(r);
      r
    };

    let _d = merge_option(a.as_ref(), b.as_ref(), merger);
    let _e = merge_option(c.as_ref(), b.as_ref(), merger);

    let _sum = sum.into_inner();
  }
}
