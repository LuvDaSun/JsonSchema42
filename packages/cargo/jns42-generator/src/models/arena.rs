#[derive(Clone, Debug, PartialEq, Default)]
pub struct Arena<T>(pub(super) im::Vector<T>)
where
  T: Clone + PartialEq;

impl<T> Arena<T>
where
  T: Clone + PartialEq,
{
  pub fn new() -> Self {
    Self(im::Vector::new())
  }

  pub fn get_item(&self, key: usize) -> &T {
    self.0.get(key).unwrap()
  }

  pub fn set_item(&mut self, key: usize, item: T) -> T {
    self.0.set(key, item)
  }

  pub fn add_item(&mut self, item: T) -> usize {
    let key = self.0.len();
    self.0.push_back(item);
    key
  }

  pub fn iter(&self) -> impl Iterator<Item = &T> {
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
