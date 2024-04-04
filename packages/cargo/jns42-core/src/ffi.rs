#[no_mangle]
extern "C" fn reverse(value: *const SizedString, result_output: *mut *const SizedString) {
  let value = unsafe { &*value };
  let value = value.as_str();

  let result: String = value.chars().rev().collect();

  let result = SizedString::new(result);
  let result = Box::new(result);

  unsafe { *result_output = Box::into_raw(result) };
}

#[repr(C)]
pub struct SizedString {
  data: *const u8,
  size: usize,
}

impl SizedString {
  pub fn new(value: String) -> Self {
    let bytes = value.into_bytes();
    let data = bytes.into_boxed_slice();
    let size = data.len();
    let data = Box::into_raw(data) as *const u8;

    Self { data, size }
  }

  pub fn as_str(&self) -> &str {
    unsafe {
      let slice = std::slice::from_raw_parts(self.data, self.size);
      std::str::from_utf8_unchecked(slice)
    }
  }
}

impl AsRef<str> for SizedString {
  fn as_ref(&self) -> &str {
    self.as_str()
  }
}

const ALIGN: usize = std::mem::align_of::<usize>();

#[no_mangle]
extern "C" fn alloc(size: usize) -> *const u8 {
  if size == 0 {
    return std::ptr::null();
  }

  let Ok(layout) = std::alloc::Layout::from_size_align(size, ALIGN) else {
    panic!("could not get layout")
  };

  let pointer = unsafe { std::alloc::alloc(layout) };
  if pointer.is_null() {
    panic!("could not get pointer")
  }

  pointer
}

// #[no_mangle]
// extern "C" fn realloc(pointer: *mut u8, size_previous: usize, size: usize) -> *const u8 {
//   debug_assert!(size_previous > 0);
//   debug_assert!(size > 0);

//   let Ok(layout) = std::alloc::Layout::from_size_align(size_previous, ALIGN) else {
//     panic!("could not get layout")
//   };

//   let pointer = unsafe { std::alloc::realloc(pointer, layout, size) };
//   if pointer.is_null() {
//     panic!("pointer is null")
//   }

//   pointer
// }

#[no_mangle]
extern "C" fn dealloc(pointer: *mut u8, size: usize) {
  if size == 0 {
    return;
  }

  if pointer.is_null() {
    return;
  }

  let Ok(layout) = std::alloc::Layout::from_size_align(size, ALIGN) else {
    panic!("could not get layout")
  };

  unsafe { std::alloc::dealloc(pointer, layout) };
}
