use futures::task::LocalSpawnExt;
use futures::{executor::LocalPool, Future};
use std::cell::RefCell;

pub fn spawn(task: impl Future<Output = ()> + 'static) {
  // MANUAL_EXECUTOR.spawn_wake(task);
  EXECUTOR.with_borrow_mut(|pool| {
    let spawner = pool.spawner();
    spawner.spawn_local(task).unwrap();
    pool.run_until_stalled()
  });
}

pub fn wake() {
  // MANUAL_EXECUTOR.wake_all();
  EXECUTOR.with_borrow_mut(|pool| pool.run_until_stalled());
}

thread_local! {
   static EXECUTOR: RefCell<LocalPool> = RefCell::new(LocalPool::new());
}

// static MANUAL_EXECUTOR: Lazy<Arc<ManualExecutor>> = Lazy::new(ManualExecutor::new);
