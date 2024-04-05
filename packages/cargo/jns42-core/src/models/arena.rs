#[derive(Clone, Debug, PartialEq, Default)]
pub struct Arena<I>(im::Vector<I>)
where
  I: Clone + PartialEq;

impl<I> Arena<I>
where
  I: Clone + PartialEq,
{
  pub fn new() -> Self {
    Self(im::Vector::new())
  }

  pub fn count(&self) -> usize {
    self.0.len()
  }

  pub fn get_item(&self, key: usize) -> &I {
    self.0.get(key).unwrap()
  }

  pub fn replace_item(&mut self, key: usize, item: I) -> I {
    self.0.set(key, item)
  }

  pub fn add_item(&mut self, item: I) -> usize {
    let key = self.0.len();
    self.0.push_back(item);
    key
  }

  pub fn iter(&self) -> impl Iterator<Item = &I> {
    self.0.iter()
  }

  pub fn apply_transform(&mut self, transform: impl Fn(&mut Self, usize)) -> usize {
    let mut count = 0;
    let mut key = 0;
    while key < self.0.len() {
      let self_previous = self.clone();

      transform(self, key);

      if self.0 != self_previous.0 {
        count += 1
      }

      key += 1;
    }

    count
  }
}

impl<I> FromIterator<I> for Arena<I>
where
  I: Clone + PartialEq,
{
  fn from_iter<T: IntoIterator<Item = I>>(iter: T) -> Self {
    Self(im::Vector::from_iter(iter))
  }
}
