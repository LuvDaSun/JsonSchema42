use crate::imports::host_invoke_callback;
use crate::utils::key::Key;
use futures::task::LocalSpawnExt;
use futures::{executor::LocalPool, Future};
use std::cell::RefCell;

thread_local! {
  static EXECUTOR: RefCell<LocalPool> = RefCell::new(LocalPool::new());
}

pub fn wake() {
  EXECUTOR.with_borrow_mut(|pool| pool.run_until_stalled());
}

pub fn spawn_and_callback(callback: Key, task: impl Future<Output = ()> + 'static) {
  EXECUTOR.with_borrow_mut(|pool| {
    let spawner = pool.spawner();
    spawner
      .spawn_local(async move {
        task.await;
        unsafe {
          host_invoke_callback(callback);
        }
      })
      .unwrap();
    pool.run_until_stalled()
  });
}
