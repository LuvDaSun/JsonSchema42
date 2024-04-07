use futures::task::LocalSpawnExt;
use futures::{executor::LocalPool, Future};
use std::cell::RefCell;

pub fn spawn(task: impl Future<Output = ()> + 'static) {
  EXECUTOR.with_borrow_mut(|pool| {
    let spawner = pool.spawner();
    spawner.spawn_local(task).unwrap();
    pool.run_until_stalled()
  });
}

pub fn wake() {
  EXECUTOR.with_borrow_mut(|pool| pool.run_until_stalled());
}

thread_local! {
   static EXECUTOR: RefCell<LocalPool> = RefCell::new(LocalPool::new());
}
