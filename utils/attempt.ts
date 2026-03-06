type Success<T> = { data: T; error: null }
type Failure = { data: null; error: Error }
type AttemptResult<T> = Success<T> | Failure

// Wraps an async operation in a single try/catch and returns a discriminated
// union of { data, error }. This eliminates scattered try/catch blocks.
//
// Example:
//   const { data, error } = await attempt(() => fetchSomething())
//   if (error) { handleError(error); return }
//   // data is narrowed to the success type here
export async function attempt<T>(fn: () => Promise<T>): Promise<AttemptResult<T>> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))
    return { data: null, error }
  }
}
