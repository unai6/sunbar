type Success<T> = { data: T; error: null }
type Failure = { data: null; error: Error }
type AttemptResult<T> = Success<T> | Failure

/**
 * Wraps an async operation in a single try/catch, returning a discriminated
 * union of `{ data, error }`. Eliminates scattered try/catch blocks.
 *
 * @example
 * const { data, error } = await attempt(() => fetchSomething())
 * if (error) { handleError(error); return }
 * // data is narrowed to the success type
 */
export async function attempt<T>(fn: () => Promise<T>): Promise<AttemptResult<T>> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    return { data: null, error }
  }
}

/**
 * Synchronous version of attempt for non-async operations.
 */
export function attemptSync<T>(fn: () => T): AttemptResult<T> {
  try {
    const data = fn()
    return { data, error: null }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    return { data: null, error }
  }
}
