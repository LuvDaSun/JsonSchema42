use std::ptr::null_mut;

#[no_mangle]
extern "C" fn reference_new() -> *mut *mut u8 {
  let pointer_box = Box::new(null_mut());
  Box::into_raw(pointer_box)
}

#[no_mangle]
extern "C" fn reference_drop(pointer_box: *mut *mut u8) {
  let _ = unsafe { Box::from_raw(pointer_box) };
}
