type SignOutTask = () => Promise<void> | void;

const tasks = new Set<SignOutTask>();

/**
 * Something on screen that must stop before the user is signed out, e.g. a
 * recording in progress. Returns the unregister function, for an effect.
 */
export function registerSignOutTask(task: SignOutTask): () => void {
  tasks.add(task);
  return () => {
    tasks.delete(task);
  };
}

/** Run every task; one that fails never stops the others. */
export async function runSignOutTasks(): Promise<void> {
  for (const task of [...tasks]) {
    try {
      await task();
    } catch {
      // Sign-out must always finish.
    }
  }
}
