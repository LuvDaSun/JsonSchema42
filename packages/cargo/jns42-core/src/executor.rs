use crate::imports::host_invoke_callback;
use crate::utils::key::Key;
use futures::task::LocalSpawnExt;
use futures::{executor::LocalPool, Future};
use std::cell::RefCell;

thread_local! {
  static EXECUTOR: RefCell<LocalPool> = RefCell::new(LocalPool::new());
}

/// Wakes up the local executor and runs all pending tasks.
///
/// This function is used to ensure that all pending tasks are executed when needed.
/// It borrows the mutable reference to the local pool and runs all tasks until they are stalled.
///
pub fn wake() {
  EXECUTOR.with_borrow_mut(|pool| pool.run_until_stalled());
}

/// Spawns a new task and runs it on the local executor.
///
/// After the task is completed, it calls the provided `callback` function using the `host_invoke_callback` function.
///
/// # Arguments
///
/// * `callback` - A unique identifier for the callback function to be invoked.
/// * `task` - A future that represents the task to be executed.
///
/// # Returns
///
/// This function does not return any value.
///
/// # Panics
///
/// This function may panic if the task fails to spawn or if the `host_invoke_callback` function fails.
///
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

/// Spawns a new task and waits for it to complete on the local executor.
///
/// This function takes a future representing a task, spawns it on the local executor,
/// and then waits for the task to complete by running the executor. This is a blocking
/// operation and should be used when it is necessary to wait for the task to finish before
/// proceeding.
///
/// # Arguments
///
/// * `task` - A future that represents the task to be executed. The task must have a `'static`
/// lifetime and return `()`.
///
/// # Panics
///
/// This function will panic if the task fails to spawn.
///
#[cfg(test)]
pub fn spawn_and_wait(task: impl Future<Output = ()> + 'static) {
  EXECUTOR.with_borrow_mut(|pool| {
    let spawner = pool.spawner();
    spawner.spawn_local(task).unwrap();
    pool.run()
  });
}
