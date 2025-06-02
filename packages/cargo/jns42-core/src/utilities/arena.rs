/// A generic container that stores elements in an immutable vector.
///
/// # Type Parameters
///
/// * `I`: The type of elements stored in the arena. Must implement `Clone` and `PartialEq`.
///
/// This struct wraps an immutable vector from the `im` crate, providing a persistent data structure
/// that can be efficiently cloned without copying the entire underlying data. It supports operations
/// such as adding, replacing, and retrieving items by index, as well as iterating over the items.
/// The arena ensures that elements are type-safe and can be compared for equality.
#[derive(Clone, Debug, PartialEq, Default)]
pub struct Arena<I>(im::Vector<I>)
where
  I: Clone + PartialEq;
impl<I> Arena<I>
where
  I: Clone + PartialEq,
{
  /// Constructs a new, empty `Arena`.
  ///
  /// # Returns
  ///
  /// An instance of `Arena<I>`.
  pub fn new() -> Self {
    Self(im::Vector::new())
  }

  /// Returns the number of elements in the arena.
  ///
  /// # Returns
  ///
  /// The number of elements as `u32`.
  pub fn count(&self) -> u32 {
    self.0.len() as u32
  }

  /// Retrieves a reference to the item at the specified key.
  ///
  /// # Parameters
  ///
  /// * `key`: The index of the item to retrieve.
  ///
  /// # Returns
  ///
  /// A reference to the item.
  ///
  /// # Panics
  ///
  /// Panics if `key` is out of bounds.
  pub fn get_item(&self, key: usize) -> &I {
    self.0.get(key).unwrap()
  }

  /// Replaces the item at the specified key with a new item.
  ///
  /// # Parameters
  ///
  /// * `key`: The index of the item to replace.
  /// * `item`: The new item to insert at the specified key.
  ///
  /// # Returns
  ///
  /// The item that was replaced.
  pub fn replace_item(&mut self, key: usize, item: I) -> I {
    self.0.set(key, item)
  }

  /// Adds a new item to the end of the arena and returns its key.
  ///
  /// # Parameters
  ///
  /// * `item`: The item to add to the arena.
  ///
  /// # Returns
  ///
  /// The key (index) of the newly added item.
  pub fn add_item(&mut self, item: I) -> usize {
    let key = self.0.len();
    self.0.push_back(item);
    key
  }

  /// Returns an iterator over the items in the arena.
  ///
  /// # Returns
  ///
  /// An iterator over references to the items.
  pub fn iter(&self) -> impl Iterator<Item = &I> {
    self.0.iter()
  }

  /// Applies a transformation function to each item in the arena, tracking the number of changes.
  ///
  /// # Parameters
  ///
  /// * `transform`: A function that takes a mutable reference to the arena and an item key, and performs a transformation.
  ///
  /// # Returns
  ///
  /// The number of items that were changed by the transformation.
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
  /// Creates an `Arena` from an iterator over items of type `I`.
  ///
  /// # Parameters
  ///
  /// * `iter`: An iterator that yields items of type `I`.
  ///
  /// # Returns
  ///
  /// An instance of `Arena<I>` containing the items from the iterator.
  fn from_iter<T: IntoIterator<Item = I>>(iter: T) -> Self {
    Self(im::Vector::from_iter(iter))
  }
}
